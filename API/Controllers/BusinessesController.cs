using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using API.Data;
using API.Data.Models;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BusinessesController : ControllerBase
    {
        private readonly HustlersHubDbContext _context;
        private readonly IWebHostEnvironment _env;

        public BusinessesController(
            HustlersHubDbContext context,
            IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        // =====================================================
        // 📁 Persistent Upload Folder
        // =====================================================
        private string GetUploadsFolder()
        {
            var uploadsFolder = Path.Combine(
                Environment.GetEnvironmentVariable("HOME") ?? "D:\\home",
                "site",
                "uploads"
            );

            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            return uploadsFolder;
        }

        // =====================================================
        // 📍 Distance Calculator
        // =====================================================
        private double CalculateDistance(
            double lat1,
            double lon1,
            double lat2,
            double lon2)
        {
            const double R = 6371;

            var dLat = DegreesToRadians(lat2 - lat1);
            var dLon = DegreesToRadians(lon2 - lon1);

            var a =
                Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(DegreesToRadians(lat1)) *
                Math.Cos(DegreesToRadians(lat2)) *
                Math.Sin(dLon / 2) *
                Math.Sin(dLon / 2);

            var c = 2 * Math.Atan2(
                Math.Sqrt(a),
                Math.Sqrt(1 - a)
            );

            return R * c;
        }

        private double DegreesToRadians(double degrees)
        {
            return degrees * (Math.PI / 180);
        }

        // =====================================================
        // 🌍 PUBLIC — Approved businesses
        // =====================================================
        [HttpGet("public")]
        [ResponseCache(Duration = 60)]
        public async Task<IActionResult> GetApprovedBusinesses(
            [FromQuery] double? lat,
            [FromQuery] double? lng,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            page = page < 1 ? 1 : page;
            pageSize = pageSize > 50 ? 50 : pageSize;

            var random = new Random();

            var query = _context.Businesses
                .AsNoTracking()
                .Where(b => b.IsApproved);

            var totalCount = await query.CountAsync();

            var businesses = await query
                .OrderByDescending(b => b.IsVerified)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(b => new
                {
                    b.Id,
                    b.BusinessName,
                    b.Category,
                    b.Description,
                    b.Location,
                    b.Latitude,
                    b.Longitude,
                    b.LogoUrl,
                    b.IsVerified
                })
                .ToListAsync();

            var rankedBusinesses = businesses
                .Select(b =>
                {
                    double distance = 9999;

                    if (
                        lat.HasValue &&
                        lng.HasValue &&
                        b.Latitude.HasValue &&
                        b.Longitude.HasValue
                    )
                    {
                        distance = CalculateDistance(
                            lat.Value,
                            lng.Value,
                            b.Latitude.Value,
                            b.Longitude.Value
                        );
                    }

                    double locationScore = 1 / (distance + 1);
                    double randomScore = random.NextDouble();
                    double verifiedBoost = b.IsVerified ? 0.1 : 0;

                    double finalScore =
                        (locationScore * 0.7) +
                        (randomScore * 0.3) +
                        verifiedBoost;

                    return new
                    {
                        b.Id,
                        b.BusinessName,
                        b.Category,
                        b.Description,
                        b.Location,
                        b.Latitude,
                        b.Longitude,
                        logoUrl = b.LogoUrl,
                        b.IsVerified,
                        Distance = Math.Round(distance, 1),
                        Score = finalScore
                    };
                })
                .OrderByDescending(x => x.Score)
                .ToList();

            return Ok(new
            {
                page,
                pageSize,
                totalCount,
                totalPages = (int)Math.Ceiling(
                    totalCount / (double)pageSize
                ),
                data = rankedBusinesses
            });
        }

        // =====================================================
        // 👤 USER BUSINESSES
        // =====================================================
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetUserBusinesses(
            Guid userId)
        {
            var businesses = await _context.Businesses
                .AsNoTracking()
                .Where(b => b.UserId == userId)
                .Select(b => new
                {
                    b.Id,
                    b.BusinessName,
                    b.Category,
                    b.Description,
                    b.Location,
                    b.LogoUrl,
                    b.IsApproved,
                    b.IsVerified,

                    images = b.Images.Select(i => new
                    {
                        i.Id,
                        i.ImageUrl
                    })
                })
                .ToListAsync();

            return Ok(businesses);
        }

        // =====================================================
        // 🔎 SINGLE BUSINESS
        // =====================================================
        [HttpGet("{id}")]
        public async Task<IActionResult> GetBusiness(Guid id)
        {
            var business = await _context.Businesses
                .AsNoTracking()
                .Where(b => b.Id == id && b.IsApproved)
                .Select(b => new
                {
                    b.Id,
                    b.BusinessName,
                    b.Description,
                    b.Category,
                    b.LogoUrl,
                    b.IsVerified,

                    images = b.Images.Select(i => new
                    {
                        i.Id,
                        i.ImageUrl
                    }),

                    reviews = b.Reviews
                        .OrderByDescending(r => r.Id)
                        .Take(10)
                        .Select(r => new
                        {
                            r.Id,
                            r.Comment,
                            r.Rating,
                            user = r.User.FullName
                        })
                })
                .FirstOrDefaultAsync();

            if (business == null)
                return NotFound();

            return Ok(business);
        }

        // =====================================================
        // 📝 CREATE BUSINESS
        // =====================================================
        [HttpPost]
        public async Task<IActionResult> CreateBusiness(
            [FromForm] BusinessCreateDto dto)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == dto.UserId);

            if (user == null)
                return NotFound("User not found");

            var business = new Business
            {
                BusinessName = dto.BusinessName,
                Category = dto.Category,
                Description = dto.Description,
                Location = dto.Location,
                Latitude = dto.Latitude,
                Longitude = dto.Longitude,
                UserId = dto.UserId,
                BusinessType = dto.BusinessType,
                RegistrationNumber = dto.RegistrationNumber,
                IsVerified = dto.BusinessType == "verified"
            };

            // =====================================================
            // Upload Logo
            // =====================================================
            if (dto.Logo != null && dto.Logo.Length > 0)
            {
                var uploadsFolder = GetUploadsFolder();

                var fileName =
                    $"{Guid.NewGuid()}{Path.GetExtension(dto.Logo.FileName)}";

                var filePath = Path.Combine(
                    uploadsFolder,
                    fileName
                );

                await using var stream = new FileStream(
                    filePath,
                    FileMode.Create
                );

                await dto.Logo.CopyToAsync(stream);

                business.LogoUrl = $"/uploads/{fileName}";
            }

            await _context.Businesses.AddAsync(business);

            // =====================================================
            // Promote user
            // =====================================================
            if (user.UserType == UserType.Customer)
            {
                user.UserType = UserType.Business;
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Business submitted for approval",
                business.Id
            });
        }

        // =====================================================
        // 🖼️ Upload Business Images
        // =====================================================
        [HttpPost("{id}/images")]
        public async Task<IActionResult> UploadBusinessImages(
            Guid id,
            IFormFile[] images)
        {
            var business = await _context.Businesses
                .Include(b => b.Images)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (business == null)
                return NotFound();

            const int maxImages = 8;

            var currentImageCount = business.Images.Count;

            if (currentImageCount + images.Length > maxImages)
            {
                return BadRequest(new
                {
                    message = $"Maximum of {maxImages} images allowed."
                });
            }

            var uploadsFolder = GetUploadsFolder();

            // =====================================================
            // Parallel Uploads
            // =====================================================
            var uploadTasks = images
                .Where(file => file.Length > 0)
                .Select(async file =>
                {
                    var fileName =
                        $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";

                    var filePath = Path.Combine(
                        uploadsFolder,
                        fileName
                    );

                    await using var stream = new FileStream(
                        filePath,
                        FileMode.Create
                    );

                    await file.CopyToAsync(stream);

                    return new BusinessImage
                    {
                        BusinessId = id,
                        ImageUrl = $"/uploads/{fileName}"
                    };
                });

            var uploadedImages = await Task.WhenAll(uploadTasks);

            await _context.BusinessImages
                .AddRangeAsync(uploadedImages);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Images uploaded successfully"
            });
        }

        // =====================================================
        // ✏️ UPDATE BUSINESS
        // =====================================================
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateBusiness(
            Guid id,
            [FromForm] UpdateBusinessDto dto)
        {
            var business = await _context.Businesses
                .FirstOrDefaultAsync(b => b.Id == id);

            if (business == null)
                return NotFound();

            business.Description = dto.Description;
            business.Category = dto.Category;
            business.Location = dto.Location;

            // =====================================================
            // UPDATE LOGO
            // =====================================================
            if (dto.Logo != null && dto.Logo.Length > 0)
            {
                var uploadsFolder = GetUploadsFolder();

                // Delete old logo
                if (!string.IsNullOrEmpty(business.LogoUrl))
                {
                    var oldFileName = Path.GetFileName(
                        business.LogoUrl
                    );

                    var oldFilePath = Path.Combine(
                        uploadsFolder,
                        oldFileName
                    );

                    if (System.IO.File.Exists(oldFilePath))
                    {
                        System.IO.File.Delete(oldFilePath);
                    }
                }

                // Save new logo
                var fileName =
                    $"{Guid.NewGuid()}{Path.GetExtension(dto.Logo.FileName)}";

                var filePath = Path.Combine(
                    uploadsFolder,
                    fileName
                );

                await using var stream = new FileStream(
                    filePath,
                    FileMode.Create
                );

                await dto.Logo.CopyToAsync(stream);

                business.LogoUrl = $"/uploads/{fileName}";
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Business updated successfully",
                logoUrl = business.LogoUrl
            });
        }

        // =====================================================
        // 🛂 PENDING BUSINESSES
        // =====================================================
        [HttpGet("pending")]
        public async Task<IActionResult> GetPending()
        {
            var businesses = await _context.Businesses
                .AsNoTracking()
                .Where(b => !b.IsApproved)
                .Select(b => new
                {
                    b.Id,
                    b.BusinessName,
                    b.Description,
                    b.LogoUrl,
                    b.BusinessType,
                    b.Category,
                    b.Location,
                    b.IsVerified,
                    b.RegistrationNumber,

                    ApplicantName = b.User.FullName,
                    ApplicantEmail = b.User.Email
                })
                .ToListAsync();

            return Ok(businesses);
        }

        // =====================================================
        // ✅ APPROVE BUSINESS
        // =====================================================
        [HttpPost("approve/{id}")]
        public async Task<IActionResult> ApproveBusiness(
            Guid id,
            [FromBody] ApproveBusinessRequest request)
        {
            var business = await _context.Businesses
                .FirstOrDefaultAsync(b => b.Id == id);

            if (business == null)
                return NotFound();

            business.IsApproved = true;
            business.IsVerified = request?.VerifyBusiness ?? false;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Business approved successfully"
            });
        }

        // =====================================================
        // ❌ REJECT BUSINESS
        // =====================================================
        [HttpDelete("reject/{id}")]
        public async Task<IActionResult> Reject(Guid id)
        {
            var business = await _context.Businesses
                .FirstOrDefaultAsync(b => b.Id == id);

            if (business == null)
                return NotFound();

            _context.Businesses.Remove(business);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Business rejected"
            });
        }

        // =====================================================
        // 🗑️ DELETE BUSINESS IMAGE
        // =====================================================
        [HttpDelete("images/{imageId}")]
        public async Task<IActionResult> DeleteBusinessImage(
            Guid imageId)
        {
            var image = await _context.BusinessImages
                .FirstOrDefaultAsync(i => i.Id == imageId);

            if (image == null)
                return NotFound();

            var fileName = Path.GetFileName(image.ImageUrl);

            var uploadsFolder = GetUploadsFolder();

            var filePath = Path.Combine(
                uploadsFolder,
                fileName
            );

            if (System.IO.File.Exists(filePath))
            {
                System.IO.File.Delete(filePath);
            }

            _context.BusinessImages.Remove(image);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Image deleted successfully"
            });
        }
    }

    // =====================================================
    // DTOs
    // =====================================================

    public class ApproveBusinessRequest
    {
        public bool VerifyBusiness { get; set; }
    }
}