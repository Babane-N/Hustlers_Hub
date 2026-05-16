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

        public BusinessesController(HustlersHubDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        // =====================================================
        // 🌍 PUBLIC — Approved businesses (Smart LISTINGS)
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

                    // Calculate distance if coordinates exist
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

                    // Nearby businesses score higher
                    double locationScore = 1 / (distance + 1);

                    // Random rotation
                    double randomScore = random.NextDouble();

                    // Verified businesses get slight boost
                    double verifiedBoost = b.IsVerified ? 0.1 : 0;

                    // Final ranking score
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
        // 📍 Distance Calculator (Haversine Formula)
        // =====================================================
        private double CalculateDistance(
            double lat1,
            double lon1,
            double lat2,
            double lon2)
        {
            const double R = 6371; // Earth radius in KM

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
        // 👤 BUSINESS OWNER — My businesses
        // =====================================================
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetUserBusinesses(Guid userId)
        {
            var businesses = await _context.Businesses
                .Where(b => b.UserId == userId)
                .ToListAsync();

            return Ok(businesses);
        }

        // =====================================================
        // 🔎 SINGLE BUSINESS (details page)
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
                images = business.Images.Select(i => i.ImageUrl)
            });
        }

        // =====================================================
        // 📝 CREATE — Submit for approval
        // =====================================================
        [HttpPost]
        public async Task<IActionResult> CreateBusiness([FromForm] BusinessCreateDto dto)
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

            // Logo upload
            if (dto.Logo != null)
            {
                var uploads = Path.Combine(_env.WebRootPath ?? "wwwroot", "uploads");
                Directory.CreateDirectory(uploads);

                var fileName = $"{Guid.NewGuid()}{Path.GetExtension(dto.Logo.FileName)}";
                var path = Path.Combine(uploads, fileName);

                using var stream = new FileStream(path, FileMode.Create);
                await dto.Logo.CopyToAsync(stream);

                business.LogoUrl = $"/uploads/{fileName}";
            }

            _context.Businesses.Add(business);

            // Promote user
            if (user.UserType == UserType.Customer)
                user.UserType = UserType.Business;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Business submitted for approval",
                business.Id
            });
        }

        [HttpPost("{id}/Images")]
        public async Task<IActionResult> UploadBusinessImages(Guid id, IFormFile[] images)
        {
            var business = await _context.Businesses.FindAsync(id);
            if (business == null) return NotFound();

            var uploadsFolder = Path.Combine(_env.WebRootPath ?? "wwwroot", "uploads");
            Directory.CreateDirectory(uploadsFolder);

            foreach (var file in images)
            {
                var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
                var filePath = Path.Combine(uploadsFolder, fileName);

                using var stream = new FileStream(filePath, FileMode.Create);
                await file.CopyToAsync(stream);

                _context.BusinessImages.Add(new BusinessImage
                {
                    BusinessId = id,
                    ImageUrl = $"/uploads/{fileName}"
                });
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Images uploaded successfully" });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateBusiness(
     Guid id,
     [FromForm] UpdateBusinessDto dto)
        {
            var business = await _context.Businesses.FindAsync(id);

            if (business == null)
                return NotFound();

            business.Description = dto.Description;
            business.Category = dto.Category;
            business.Location = dto.Location;

            // Upload new logo
            if (dto.Logo != null)
            {
                var uploadsFolder = Path.Combine(
                    _env.ContentRootPath,
                    "wwwroot",
                    "uploads"
                );

                Directory.CreateDirectory(uploadsFolder);

                var fileName =
                    $"{Guid.NewGuid()}{Path.GetExtension(dto.Logo.FileName)}";

                var filePath = Path.Combine(uploadsFolder, fileName);

                using var stream = new FileStream(filePath, FileMode.Create);

                await dto.Logo.CopyToAsync(stream);

                business.LogoUrl = $"/uploads/{fileName}";
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Business updated successfully"
            });
        }


        // =====================================================
        // 🛂 ADMIN — Pending approvals
        // =====================================================
        [HttpGet("pending")]
        public async Task<IActionResult> GetPending()
        {
            return Ok(await _context.Businesses
                .Where(b => !b.IsApproved)
                .ToListAsync());
        }

        // =====================================================
        // ✅ ADMIN — Approve business
        // =====================================================
        [HttpPost("approve/{id}")]
        public async Task<IActionResult> ApproveBusiness(
        Guid id,
    [FromBody] ApproveBusinessRequest request)
        {
            var business = await _context.Businesses.FindAsync(id);
            if (business == null) return NotFound();

            business.IsApproved = true;
            business.IsVerified = request?.VerifyBusiness ?? false;

            await _context.SaveChangesAsync();
            return Ok();
        }

        // =====================================================
        // ❌ ADMIN — Reject business
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
    }

    // =====================================================
    // DTO
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

