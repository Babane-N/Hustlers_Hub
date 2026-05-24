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
    public class PromotionsController : ControllerBase
    {
        private readonly HustlersHubDbContext _context;
        private readonly IWebHostEnvironment _env;

        public PromotionsController(
            HustlersHubDbContext context,
            IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        // =====================================================
        // 📁 Upload Folder
        // =====================================================
        private string GetUploadsFolder()
        {
            var uploadsFolder = Path.Combine(
                Environment.GetEnvironmentVariable("HOME") ?? "D:\\home",
                "site",
                "uploads",
                "promotions"
            );

            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            return uploadsFolder;
        }

        // =====================================================
        // ✅ GET ALL PROMOTIONS
        // =====================================================
        [HttpGet]
        [ResponseCache(Duration = 60)]
        public async Task<ActionResult<object>> GetPromotions(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] string? category = null)
        {
            page = page < 1 ? 1 : page;
            pageSize = pageSize > 50 ? 50 : pageSize;

            var query = _context.Promotions
                .AsNoTracking()
                .Where(p => p.ExpiresAt > DateTime.UtcNow);

            // =====================================================
            // CATEGORY FILTER
            // =====================================================
            if (!string.IsNullOrWhiteSpace(category))
            {
                query = query.Where(p =>
                    p.Category.ToLower() == category.ToLower());
            }

            var totalCount = await query.CountAsync();

            var promotions = await query
                .OrderByDescending(p => p.IsBoosted)
                .ThenByDescending(p => p.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
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

                    Images = p.Images
                        .Select(img => img.ImageUrl)
                        .ToList()
                })
                .ToListAsync();

            return Ok(new
            {
                page,
                pageSize,
                totalCount,
                totalPages = (int)Math.Ceiling(
                    totalCount / (double)pageSize
                ),
                data = promotions
            });
        }

        // =====================================================
        // ✅ GET SINGLE PROMOTION
        // =====================================================
        [HttpGet("{id}")]
        [ResponseCache(Duration = 60)]
        public async Task<ActionResult<object>> GetPromotion(Guid id)
        {
            var promotion = await _context.Promotions
                .AsNoTracking()
                .Where(p =>
                    p.Id == id &&
                    p.ExpiresAt > DateTime.UtcNow)
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

                    Images = p.Images
                        .Select(img => img.ImageUrl)
                        .ToList()
                })
                .FirstOrDefaultAsync();

            if (promotion == null)
                return NotFound();

            return Ok(promotion);
        }

        // =====================================================
        // ✅ CREATE PROMOTION
        // =====================================================
        [HttpPost]
        public async Task<ActionResult<object>> PostPromotion(
            [FromForm] PromotionCreateDto dto)
        {
            // =====================================================
            // VALIDATION
            // =====================================================
            if (
                string.IsNullOrWhiteSpace(dto.Title) ||
                string.IsNullOrWhiteSpace(dto.Description) ||
                string.IsNullOrWhiteSpace(dto.Category) ||
                dto.PostedById == Guid.Empty
            )
            {
                return BadRequest(
                    "Missing required fields.");
            }

            // =====================================================
            // VERIFY USER EXISTS
            // =====================================================
            var userExists = await _context.Users
                .AnyAsync(u => u.Id == dto.PostedById);

            if (!userExists)
            {
                return BadRequest(
                    "Invalid PostedById.");
            }

            // =====================================================
            // IMAGE LIMITS
            // =====================================================
            const int maxImages = 5;
            const long maxSize = 5 * 1024 * 1024;

            if (dto.Images != null)
            {
                if (dto.Images.Count > maxImages)
                {
                    return BadRequest(
                        $"Maximum {maxImages} images allowed.");
                }

                if (dto.Images.Any(i => i.Length > maxSize))
                {
                    return BadRequest(
                        "Each image must be smaller than 5MB.");
                }
            }

            // =====================================================
            // CREATE PROMOTION
            // =====================================================
            var promotion = new Promotion
            {
                Id = Guid.NewGuid(),
                Title = dto.Title,
                Description = dto.Description,
                Category = dto.Category,
                PostedById = dto.PostedById,
                IsBoosted = dto.IsBoosted,
                CreatedAt = DateTime.UtcNow,
                ExpiresAt =
                    dto.ExpiresAt == default
                        ? DateTime.UtcNow.AddDays(7)
                        : dto.ExpiresAt
            };

            await _context.Promotions
                .AddAsync(promotion);

            await _context.SaveChangesAsync();

            // =====================================================
            // UPLOAD IMAGES
            // =====================================================
            if (dto.Images != null && dto.Images.Count > 0)
            {
                var uploadsFolder = GetUploadsFolder();

                var uploadTasks = dto.Images
                    .Where(image => image.Length > 0)
                    .Select(async image =>
                    {
                        var fileName =
                            $"{Guid.NewGuid()}{Path.GetExtension(image.FileName)}";

                        var filePath = Path.Combine(
                            uploadsFolder,
                            fileName
                        );

                        await using var stream =
                            new FileStream(
                                filePath,
                                FileMode.Create
                            );

                        await image.CopyToAsync(stream);

                        return new PromotionImage
                        {
                            Id = Guid.NewGuid(),
                            ImageUrl =
                                $"/uploads/promotions/{fileName}",
                            PromotionId = promotion.Id
                        };
                    });

                var uploadedImages =
                    await Task.WhenAll(uploadTasks);

                await _context.PromotionImages
                    .AddRangeAsync(uploadedImages);

                await _context.SaveChangesAsync();
            }

            // =====================================================
            // RETURN RESULT
            // =====================================================
            var result = await _context.Promotions
                .AsNoTracking()
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

                    Images = p.Images
                        .Select(img => img.ImageUrl)
                        .ToList()
                })
                .FirstOrDefaultAsync();

            return CreatedAtAction(
                nameof(GetPromotion),
                new { id = promotion.Id },
                result
            );
        }

        // =====================================================
        // ✅ UPDATE PROMOTION
        // =====================================================
        [HttpPut("{id}")]
        public async Task<IActionResult> PutPromotion(
            Guid id,
            [FromForm] UpdatePromotionDto dto)
        {
            var promotion = await _context.Promotions
                .Include(p => p.Images)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (promotion == null)
                return NotFound();

            // =====================================================
            // UPDATE FIELDS
            // =====================================================
            promotion.Title = dto.Title;
            promotion.Description = dto.Description;
            promotion.Category = dto.Category;
            promotion.IsBoosted = dto.IsBoosted;

            if (dto.ExpiresAt.HasValue)
            {
                promotion.ExpiresAt = dto.ExpiresAt.Value;
            }

            // =====================================================
            // ADD NEW IMAGES
            // =====================================================
            if (dto.Images != null && dto.Images.Count > 0)
            {
                const int maxImages = 5;

                var currentImageCount =
                    promotion.Images.Count;

                if (
                    currentImageCount + dto.Images.Count >
                    maxImages
                )
                {
                    return BadRequest(
                        $"Maximum of {maxImages} images allowed.");
                }

                var uploadsFolder = GetUploadsFolder();

                var uploadTasks = dto.Images
                    .Where(image => image.Length > 0)
                    .Select(async image =>
                    {
                        var fileName =
                            $"{Guid.NewGuid()}{Path.GetExtension(image.FileName)}";

                        var filePath = Path.Combine(
                            uploadsFolder,
                            fileName
                        );

                        await using var stream =
                            new FileStream(
                                filePath,
                                FileMode.Create
                            );

                        await image.CopyToAsync(stream);

                        return new PromotionImage
                        {
                            Id = Guid.NewGuid(),
                            ImageUrl =
                                $"/uploads/promotions/{fileName}",
                            PromotionId = promotion.Id
                        };
                    });

                var uploadedImages =
                    await Task.WhenAll(uploadTasks);

                await _context.PromotionImages
                    .AddRangeAsync(uploadedImages);
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Promotion updated successfully"
            });
        }

        // =====================================================
        // ✅ DELETE PROMOTION
        // =====================================================
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePromotion(
            Guid id)
        {
            var promotion = await _context.Promotions
                .Include(p => p.Images)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (promotion == null)
                return NotFound();

            var uploadsFolder = GetUploadsFolder();

            // =====================================================
            // DELETE PHYSICAL FILES
            // =====================================================
            foreach (var image in promotion.Images)
            {
                var fileName = Path.GetFileName(
                    image.ImageUrl
                );

                var filePath = Path.Combine(
                    uploadsFolder,
                    fileName
                );

                if (System.IO.File.Exists(filePath))
                {
                    System.IO.File.Delete(filePath);
                }
            }

            // =====================================================
            // DELETE DATABASE RECORDS
            // =====================================================
            _context.PromotionImages
                .RemoveRange(promotion.Images);

            _context.Promotions.Remove(promotion);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Promotion deleted successfully"
            });
        }

        // =====================================================
        // ✅ DELETE SINGLE PROMOTION IMAGE
        // =====================================================
        [HttpDelete("images/{imageId}")]
        public async Task<IActionResult> DeletePromotionImage(
            Guid imageId)
        {
            var image = await _context.PromotionImages
                .FirstOrDefaultAsync(i => i.Id == imageId);

            if (image == null)
                return NotFound();

            var uploadsFolder = GetUploadsFolder();

            var fileName = Path.GetFileName(
                image.ImageUrl
            );

            var filePath = Path.Combine(
                uploadsFolder,
                fileName
            );

            if (System.IO.File.Exists(filePath))
            {
                System.IO.File.Delete(filePath);
            }

            _context.PromotionImages.Remove(image);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Image deleted successfully"
            });
        }

        // =====================================================
        // ✅ CHECK EXISTS
        // =====================================================
        private async Task<bool> PromotionExists(Guid id)
        {
            return await _context.Promotions
                .AnyAsync(e => e.Id == id);
        }
    }

    // =====================================================
    // DTOs
    // =====================================================

    public class PromotionCreateDto
    {
        public string Title { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public string Category { get; set; } = string.Empty;

        public Guid PostedById { get; set; }

        public bool IsBoosted { get; set; } = false;

        public DateTime ExpiresAt { get; set; }

        public List<IFormFile>? Images { get; set; }
    }

    public class UpdatePromotionDto
    {
        public string Title { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public string Category { get; set; } = string.Empty;

        public bool IsBoosted { get; set; }

        public DateTime? ExpiresAt { get; set; }

        public List<IFormFile>? Images { get; set; }
    }
}