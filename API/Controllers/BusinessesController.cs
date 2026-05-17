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
        // 🌍 PUBLIC — Approved businesses
        // =====================================================
        [HttpGet("public")]
        public async Task<IActionResult> GetApprovedBusinesses(
            [FromQuery] double? lat,
            [FromQuery] double? lng)
        {
            var random = new Random();

            var businesses = await _context.Businesses
                .Where(b => b.IsApproved)
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

            return Ok(rankedBusinesses);
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
        // 👤 USER BUSINESSES
        // =====================================================
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetUserBusinesses(Guid userId)
        {
            var businesses = await _context.Businesses
                .Include(b => b.Images)
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
                .Include(b => b.Images)
                .Include(b => b.Reviews)
                .ThenInclude(r => r.User)
                .FirstOrDefaultAsync(b => b.Id == id && b.IsApproved);

            if (business == null)
                return NotFound();

            return Ok(new
            {
                business.Id,
                business.BusinessName,
                business.Description,
                business.Category,
                business.LogoUrl,
                business.IsVerified,
                images = business.Images.Select(i => new
                {
                    i.Id,
                    i.ImageUrl
                })
            });
        }

        // =====================================================
        // 📝 CREATE BUSINESS
        // =====================================================
        [HttpPost]
        public async Task<IActionResult> CreateBusiness(
            [FromForm] BusinessCreateDto dto)
        {
            var user = await _context.Users.FindAsync(dto.UserId);

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

            // =========================
            // Upload Logo
            // =========================
            if (dto.Logo != null)
            {
                var uploadsFolder = GetUploadsFolder();

                var fileName =
                    $"{Guid.NewGuid()}{Path.GetExtension(dto.Logo.FileName)}";

                var filePath = Path.Combine(
                    uploadsFolder,
                    fileName
                );

                using var stream = new FileStream(
                    filePath,
                    FileMode.Create
                );

                await dto.Logo.CopyToAsync(stream);

                business.LogoUrl = $"/uploads/{fileName}";
            }

            _context.Businesses.Add(business);

            // Promote user
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
        [HttpPost("{id}/Images")]
        public async Task<IActionResult> UploadBusinessImages(
    Guid id,
    IFormFile[] images)
        {
            var business = await _context.Businesses
                .Include(b => b.Images)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (business == null)
                return NotFound();

            // =====================================================
            // IMAGE LIMIT
            // =====================================================
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

            foreach (var file in images)
            {
                // Skip empty files
                if (file.Length == 0)
                    continue;

                var fileName =
                    $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";

                var filePath = Path.Combine(
                    uploadsFolder,
                    fileName
                );

                using var stream = new FileStream(
                    filePath,
                    FileMode.Create
                );

                await file.CopyToAsync(stream);

                _context.BusinessImages.Add(new BusinessImage
                {
                    BusinessId = id,
                    ImageUrl = $"/uploads/{fileName}"
                });
            }

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
                .FindAsync(id);

            if (business == null)
                return NotFound();

            // =====================================================
            // UPDATE BASIC INFO
            // =====================================================
            business.Description = dto.Description;
            business.Category = dto.Category;
            business.Location = dto.Location;

            // =====================================================
            // UPDATE LOGO
            // =====================================================
            if (dto.Logo != null && dto.Logo.Length > 0)
            {
                var uploadsFolder = GetUploadsFolder();

                // =========================================
                // DELETE OLD LOGO FILE
                // =========================================
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

                // =========================================
                // SAVE NEW LOGO
                // =========================================
                var fileName =
                    $"{Guid.NewGuid()}{Path.GetExtension(dto.Logo.FileName)}";

                var filePath = Path.Combine(
                    uploadsFolder,
                    fileName
                );

                using var stream = new FileStream(
                    filePath,
                    FileMode.Create
                );

                await dto.Logo.CopyToAsync(stream);

                // Save new URL
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
            return Ok(
                await _context.Businesses
                    .Where(b => !b.IsApproved)
                    .ToListAsync()
            );
        }

        // =====================================================
        // ✅ APPROVE BUSINESS
        // =====================================================
        [HttpPost("approve/{id}")]
        public async Task<IActionResult> ApproveBusiness(
            Guid id,
            [FromBody] ApproveBusinessRequest request)
        {
            var business = await _context.Businesses.FindAsync(id);

            if (business == null)
                return NotFound();

            business.IsApproved = true;
            business.IsVerified = request?.VerifyBusiness ?? false;

            await _context.SaveChangesAsync();

            return Ok();
        }

        // =====================================================
        // ❌ REJECT BUSINESS
        // =====================================================
        [HttpDelete("reject/{id}")]
        public async Task<IActionResult> Reject(Guid id)
        {
            var business = await _context.Businesses.FindAsync(id);

            if (business == null)
                return NotFound();

            _context.Businesses.Remove(business);

            await _context.SaveChangesAsync();

            return Ok("Business rejected");
        }

        // =====================================================
        // 🗑️ DELETE BUSINESS IMAGE
        // =====================================================
        [HttpDelete("images/{imageId}")]
        public async Task<IActionResult> DeleteBusinessImage(Guid imageId)
        {
            var image = await _context.BusinessImages
                .FindAsync(imageId);

            if (image == null)
                return NotFound();

            // Extract filename from URL
            var fileName = Path.GetFileName(image.ImageUrl);

            var uploadsFolder = GetUploadsFolder();

            var filePath = Path.Combine(
                uploadsFolder,
                fileName
            );

            // Delete physical file
            if (System.IO.File.Exists(filePath))
            {
                System.IO.File.Delete(filePath);
            }

            // Delete database record
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
    public class BusinessCreateDto
    {
        public string BusinessName { get; set; } = string.Empty;

        public string Category { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public string Location { get; set; } = string.Empty;

        public Guid UserId { get; set; }

        public IFormFile? Logo { get; set; }

        public double? Latitude { get; set; }

        public double? Longitude { get; set; }

        public string BusinessType { get; set; } = "unverified";

        public string? RegistrationNumber { get; set; }
    }

    public class PendingBusinessDto
    {
        public int Id { get; set; }

        public string BusinessName { get; set; }

        public string Description { get; set; }

        public string LogoUrl { get; set; }

        public string OwnerName { get; set; }

        public bool IsCipcRegistered { get; set; }

        public string? CipcNumber { get; set; }
    }

    public class ApproveBusinessRequest
    {
        public bool VerifyBusiness { get; set; }
    }

    public class UpdateBusinessDto
    {
        public string Description { get; set; } = string.Empty;

        public string Category { get; set; } = string.Empty;

        public string Location { get; set; } = string.Empty;

        public IFormFile? Logo { get; set; }
    }
}