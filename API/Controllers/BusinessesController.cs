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

        // ✅ GET all businesses for a specific user
        [HttpGet("Users/{userId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetBusinesses(Guid userId)
        {
            var businesses = await _context.Businesses
                .Where(b => b.UserId == userId)
                .Select(b => new
                {
                    b.Id,
                    b.BusinessName,
                    b.Category,
                    b.Location,
                    b.Latitude,
                    b.Longitude,
                    b.Description,
                    b.UserId,
                    b.CreatedAt,
                    b.IsVerified,
                    LogoUrl = string.IsNullOrEmpty(b.LogoUrl) ? null : b.LogoUrl
                })
                .ToListAsync();

            return Ok(businesses);
        }

        // ✅ GET single business by ID
        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetBusiness(Guid id)
        {
            var business = await _context.Businesses
                .Where(b => b.Id == id)
                .Select(b => new
                {
                    b.Id,
                    b.BusinessName,
                    b.Category,
                    b.Location,
                    b.Latitude,
                    b.Longitude,
                    b.Description,
                    b.UserId,
                    b.CreatedAt,
                    b.IsVerified,
                    LogoUrl = string.IsNullOrEmpty(b.LogoUrl) ? null : b.LogoUrl
                })
                .FirstOrDefaultAsync();

            if (business == null)
                return NotFound(new { message = "Business not found." });

            return Ok(business);
        }

        // ✅ UPDATE business
        [HttpPut("{id}")]
        public async Task<IActionResult> PutBusiness(Guid id, Business business)
        {
            if (id != business.Id)
                return BadRequest(new { message = "Invalid business ID." });

            _context.Entry(business).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!BusinessExists(id))
                    return NotFound(new { message = "Business not found." });
                throw;
            }

            return NoContent();
        }

        // ✅ CREATE new business (auto-insert service + update user role)
        [HttpPost]
        public async Task<ActionResult<Business>> PostBusiness([FromForm] BusinessCreateDto dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == dto.UserId);
            if (user == null)
                return NotFound(new { message = "User not found." });

            // Prepare new business
            var business = new Business
            {
                Id = Guid.NewGuid(),
                BusinessName = dto.BusinessName,
                Category = dto.Category,
                Location = dto.Location,
                Latitude = dto.Latitude,
                Longitude = dto.Longitude,
                Description = dto.Description,
                UserId = dto.UserId,
                CreatedAt = DateTime.UtcNow,
                IsVerified = false
            };

            // ✅ Handle optional logo upload
            if (dto.Logo != null && dto.Logo.Length > 0)
            {
                var uploadsFolder = Path.Combine(_env.WebRootPath ?? "wwwroot", "uploads");
                Directory.CreateDirectory(uploadsFolder);

                var fileName = $"{Guid.NewGuid()}{Path.GetExtension(dto.Logo.FileName)}";
                var filePath = Path.Combine(uploadsFolder, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await dto.Logo.CopyToAsync(stream);
                }

                business.LogoUrl = $"/uploads/{fileName}";
            }

            // ✅ Wrap in transaction to keep data consistent
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Add business
                _context.Businesses.Add(business);
                await _context.SaveChangesAsync();

                // ✅ Automatically create default service for new business
                var service = new Service
                {
                    Id = Guid.NewGuid(),
                    BusinessId = business.Id,
                    Title = $"{business.BusinessName} Service",
                    Description = $"Default service for {business.BusinessName}",
                    Category = business.Category,
                    Price = 0,
                    ImageUrl = business.LogoUrl,
                    DurationMinutes = 60,
                };

                _context.Services.Add(service);

                // ✅ Update user role (Customer → Business)
                if (user.UserType is UserType.Customer)
                {
                    user.UserType = UserType.Business;
                    _context.Users.Update(user);
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new
                {
                    message = "Business created successfully, service added and user role updated.",
                    businessId = business.Id,
                    defaultServiceId = service.Id
                });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { message = $"Error creating business: {ex.Message}" });
            }
        }

        // ✅ DELETE business
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBusiness(Guid id)
        {
            var business = await _context.Businesses.FindAsync(id);
            if (business == null)
                return NotFound(new { message = "Business not found." });

            _context.Businesses.Remove(business);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool BusinessExists(Guid id)
        {
            return _context.Businesses.Any(e => e.Id == id);
        }
    }

    // ✅ DTO for business creation
    public class BusinessCreateDto
    {
        public string BusinessName { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public Guid UserId { get; set; }
        public IFormFile? Logo { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
    }
}
