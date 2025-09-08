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
    public class BusinessesController(HustlersHubDbContext _context, IWebHostEnvironment _env) : ControllerBase
    {

        // ✅ GET businesses for a specific user (with Logo)
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
                    b.Description,
                    b.UserId,
                    b.CreatedAt,
                    b.IsVerified,
                    LogoUrl = string.IsNullOrEmpty(b.LogoUrl) ? null : b.LogoUrl
                })
                .ToListAsync();

            return Ok(businesses);
        }

        // ✅ GET single business by ID (with Logo)
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
                    b.Description,
                    b.UserId,
                    b.CreatedAt,
                    b.IsVerified,
                    LogoUrl = string.IsNullOrEmpty(b.LogoUrl) ? null : b.LogoUrl
                })
                .FirstOrDefaultAsync();

            if (business == null)
                return NotFound();

            return Ok(business);
        }

        // ✅ UPDATE existing business
        [HttpPut("{id}")]
        public async Task<IActionResult> PutBusiness(Guid id, Business business)
        {
            if (id != business.Id)
                return BadRequest();

            _context.Entry(business).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!BusinessExists(id))
                    return NotFound();
                else
                    throw;
            }

            return NoContent();
        }

        // ✅ CREATE new business with optional logo
        [HttpPost]
        public async Task<ActionResult<Business>> PostBusiness([FromForm] BusinessCreateDto dto)
        {
            var business = new Business
            {
                Id = Guid.NewGuid(),
                BusinessName = dto.BusinessName,
                Category = dto.Category,
                Location = dto.Location,
                Description = dto.Description,
                UserId = dto.UserId,
                CreatedAt = DateTime.UtcNow
            };

            // 🔁 Save logo image if provided
            if (dto.Logo != null && dto.Logo.Length > 0)
            {
                var uploadsFolder = Path.Combine(_env.WebRootPath, "uploads");
                Directory.CreateDirectory(uploadsFolder);

                var fileName = $"{Guid.NewGuid()}{Path.GetExtension(dto.Logo.FileName)}";
                var filePath = Path.Combine(uploadsFolder, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await dto.Logo.CopyToAsync(stream);
                }

                business.LogoUrl = $"/uploads/{fileName}";
            }

            _context.Businesses.Add(business);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetBusiness), new { id = business.Id }, business);
        }

        // ✅ DELETE business
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBusiness(Guid id)
        {
            var business = await _context.Businesses.FindAsync(id);
            if (business == null)
                return NotFound();

            _context.Businesses.Remove(business);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool BusinessExists(Guid id)
        {
            return _context.Businesses.Any(e => e.Id == id);
        }
    }

    // ✅ DTO for form-data creation
    public class BusinessCreateDto
    {
        public string BusinessName { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public Guid UserId { get; set; }
        public IFormFile? Logo { get; set; }
    }
}
