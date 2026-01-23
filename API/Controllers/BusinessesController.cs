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
        // 🌍 PUBLIC — Approved businesses (LISTINGS)
        // =====================================================
        [HttpGet("public")]
        public async Task<IActionResult> GetApprovedBusinesses()
        {
            var businesses = await _context.Businesses
                .Where(b => b.IsApproved)
                .Select(b => new
                {
                    b.Id,
                    b.BusinessName,
                    b.Category,
                    b.Description,
                    b.Location,
                    b.Latitude,
                    b.Longitude,
                    logoUrl = b.LogoUrl,
                    b.IsVerified
                })
                .ToListAsync();

            return Ok(businesses);
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
        public async Task<IActionResult> Approve(Guid id)
        {
            var business = await _context.Businesses.FindAsync(id);
            if (business == null)
                return NotFound();

            business.IsApproved = true;
            await _context.SaveChangesAsync();

            return Ok("Business approved");
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
}

