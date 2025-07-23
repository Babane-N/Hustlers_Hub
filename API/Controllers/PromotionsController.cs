using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
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

        public PromotionsController(HustlersHubDbContext context)
        {
            _context = context;
        }

        // ✅ GET all promotions
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Promotion>>> GetPromotions()
        {
            return await _context.Promotions.ToListAsync();
        }

        // ✅ GET promotion by ID
        [HttpGet("{id}")]
        public async Task<ActionResult<Promotion>> GetPromotion(Guid id)
        {
            var promotion = await _context.Promotions.FindAsync(id);

            if (promotion == null)
                return NotFound();

            return promotion;
        }

        // ✅ PUT: Update promotion by ID
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

        // ✅ POST: Add a new promotion
        [HttpPost]
        public async Task<ActionResult<Promotion>> PostPromotion(Promotion promotion)
        {
            // Validate required fields
            if (string.IsNullOrWhiteSpace(promotion.Title) ||
                string.IsNullOrWhiteSpace(promotion.Description) ||
                string.IsNullOrWhiteSpace(promotion.Category) ||
                promotion.PostedById == Guid.Empty)
            {
                return BadRequest("Missing required fields.");
            }

            // Set additional fields
            promotion.Id = Guid.NewGuid();
            promotion.CreatedAt = DateTime.UtcNow;
            promotion.ExpiresAt = promotion.ExpiresAt == default ? DateTime.UtcNow.AddDays(7) : promotion.ExpiresAt;

            // Optionally: check if PostedById is valid
            var userExists = await _context.Users.AnyAsync(u => u.Id == promotion.PostedById);
            if (!userExists)
            {
                return BadRequest("Invalid PostedById: user does not exist.");
            }

            _context.Promotions.Add(promotion);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetPromotion), new { id = promotion.Id }, promotion);
        }

        [HttpPost("upload-image")]
        public async Task<IActionResult> UploadImage([FromForm] IFormFile imageFile)
        {
            if (imageFile == null || imageFile.Length == 0)
                return BadRequest("No image uploaded.");

            var fileName = Guid.NewGuid() + Path.GetExtension(imageFile.FileName);
            var filePath = Path.Combine("wwwroot/uploads", fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await imageFile.CopyToAsync(stream);
            }

            var imageUrl = $"{Request.Scheme}://{Request.Host}/uploads/{fileName}";
            return Ok(new { imageUrl });
        }


        // ✅ DELETE promotion by ID
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePromotion(Guid id)
        {
            var promotion = await _context.Promotions.FindAsync(id);

            if (promotion == null)
                return NotFound();

            _context.Promotions.Remove(promotion);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool PromotionExists(Guid id)
        {
            return _context.Promotions.Any(e => e.Id == id);
        }
    }
}
