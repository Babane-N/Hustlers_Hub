using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using API.Data;
using API.Data.Models;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PromotionsController : ControllerBase
    {
        private readonly HustlersHubDbContext _context;
        private readonly IWebHostEnvironment _env;

        public PromotionsController(HustlersHubDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        // ✅ GET all promotions including images
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetPromotions()
        {
            var promotions = await _context.Promotions
                .Include(p => p.Images)
                .Select(p => new
                {
                    p.Id,
                    p.Title,
                    p.Description,
                    p.Category,
                    p.PostedById,
                    p.IsBoosted,
                    p.CreatedAt,
                    p.ExpiresAt,
                    Images = p.Images.Select(img => img.ImageUrl).ToList()
                })
                .ToListAsync();

            return Ok(promotions);
        }

        // ✅ GET promotion by ID including images
        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetPromotion(Guid id)
        {
            var promotion = await _context.Promotions
                .Include(p => p.Images)
                .Where(p => p.Id == id)
                .Select(p => new
                {
                    p.Id,
                    p.Title,
                    p.Description,
                    p.Category,
                    p.PostedById,
                    p.IsBoosted,
                    p.CreatedAt,
                    p.ExpiresAt,
                    Images = p.Images.Select(img => img.ImageUrl).ToList()
                })
                .FirstOrDefaultAsync();

            if (promotion == null)
                return NotFound();

            return Ok(promotion);
        }

        // ✅ PUT: Update promotion by ID (basic, no image update here)
        [HttpPut("{id}")]
        public async Task<IActionResult> PutPromotion(Guid id, Promotion promotion)
        {
            if (id != promotion.Id)
                return BadRequest("Mismatched promotion ID.");

            _context.Entry(promotion).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PromotionExists(id))
                    return NotFound();
                else
                    throw;
            }

            return NoContent();
        }

        // ✅ POST: Add a new promotion with multiple images upload
        [HttpPost]
        public async Task<ActionResult<object>> PostPromotion([FromForm] PromotionCreateDto dto)
        {
            // Validate required fields
            if (string.IsNullOrWhiteSpace(dto.Title) ||
                string.IsNullOrWhiteSpace(dto.Description) ||
                string.IsNullOrWhiteSpace(dto.Category) ||
                dto.PostedById == Guid.Empty)
            {
                return BadRequest("Missing required fields.");
            }

            // Validate PostedById exists
            var userExists = await _context.Users.AnyAsync(u => u.Id == dto.PostedById);
            if (!userExists)
                return BadRequest("Invalid PostedById: user does not exist.");

            var promotion = new Promotion
            {
                Id = Guid.NewGuid(),
                Title = dto.Title,
                Description = dto.Description,
                Category = dto.Category,
                PostedById = dto.PostedById,
                IsBoosted = dto.IsBoosted,
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = dto.ExpiresAt == default ? DateTime.UtcNow.AddDays(7) : dto.ExpiresAt,
            };

            _context.Promotions.Add(promotion);
            await _context.SaveChangesAsync();

            if (dto.Images != null && dto.Images.Count > 0)
            {
                var uploadsFolder = Path.Combine(_env.WebRootPath, "uploads", "promotions");
                Directory.CreateDirectory(uploadsFolder);

                foreach (var image in dto.Images)
                {
                    if (image.Length > 0)
                    {
                        var fileName = $"{Guid.NewGuid()}{Path.GetExtension(image.FileName)}";
                        var filePath = Path.Combine(uploadsFolder, fileName);

                        using (var stream = new FileStream(filePath, FileMode.Create))
                        {
                            await image.CopyToAsync(stream);
                        }

                        var promotionImage = new PromotionImage
                        {
                            Id = Guid.NewGuid(),
                            ImageUrl = $"/uploads/promotions/{fileName}",
                            PromotionId = promotion.Id
                        };

                        _context.PromotionImages.Add(promotionImage);
                    }
                }
                await _context.SaveChangesAsync();
            }

            // Return promotion with images included
            var result = await _context.Promotions
                .Include(p => p.Images)
                .Where(p => p.Id == promotion.Id)
                .Select(p => new
                {
                    p.Id,
                    p.Title,
                    p.Description,
                    p.Category,
                    p.PostedById,
                    p.IsBoosted,
                    p.CreatedAt,
                    p.ExpiresAt,
                    Images = p.Images.Select(img => img.ImageUrl).ToList()
                })
                .FirstOrDefaultAsync();

            return CreatedAtAction(nameof(GetPromotion), new { id = promotion.Id }, result);
        }

        // ✅ DELETE promotion by ID (including images)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePromotion(Guid id)
        {
            var promotion = await _context.Promotions
                .Include(p => p.Images)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (promotion == null)
                return NotFound();

            // Optionally delete image files from disk (add code here if needed)

            // Remove images from DB
            _context.PromotionImages.RemoveRange(promotion.Images);

            _context.Promotions.Remove(promotion);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool PromotionExists(Guid id)
        {
            return _context.Promotions.Any(e => e.Id == id);
        }
    }

    // DTO for promotion creation with multiple images
    public class PromotionCreateDto
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public Guid PostedById { get; set; }
        public bool IsBoosted { get; set; } = false;
        public DateTime ExpiresAt { get; set; }

        // Multiple images support
        public List<IFormFile>? Images { get; set; }
    }
}
