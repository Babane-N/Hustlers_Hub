using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using API.Data;
using API.Data.Models;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ServicesController : ControllerBase
    {
        private readonly HustlersHubDbContext _context;

        public ServicesController(HustlersHubDbContext context)
        {
            _context = context;
        }

        // =========================
        // 🔧 Helper: parse images
        // =========================
        private static List<string> ParseImages(string? imageUrl)
        {
            if (string.IsNullOrWhiteSpace(imageUrl))
                return new List<string>();

            try
            {
                return JsonSerializer.Deserialize<List<string>>(imageUrl)
                       ?? new List<string>();
            }
            catch
            {
                return new List<string> { imageUrl };
            }
        }

        // =========================
        // ✅ GET: api/Services
        // =========================
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetServices()
        {
            // Select only raw fields EF Core can translate
            var rawServices = await _context.Services
                .Include(s => s.Business)
                .Select(s => new
                {
                    s.Id,
                    s.Title,
                    s.Category,
                    s.Description,
                    s.ImageUrl,
                    s.Price,
                    s.DurationMinutes,
                    BusinessId = s.Business != null ? s.Business.Id : (Guid?)null,
                    BusinessName = s.Business != null ? s.Business.BusinessName : null,
                    BusinessLocation = s.Business != null ? s.Business.Location : null,
                    LogoUrl = s.Business != null ? s.Business.LogoUrl : null,
                    Latitude = s.Business != null ? s.Business.Latitude : (double?)null,
                    Longitude = s.Business != null ? s.Business.Longitude : (double?)null,
                    IsVerified = s.Business != null ? s.Business.IsVerified : false
                })
                .ToListAsync();

            // Project in memory (safe for ParseImages and null-handling)
            var services = rawServices.Select(s => new
            {
                s.Id,
                s.Title,
                s.Category,
                s.Description,
                images = ParseImages(s.ImageUrl),
                s.Price,
                s.DurationMinutes,
                latitude = s.Latitude,
                longitude = s.Longitude,
                businessName = s.BusinessName ?? "",
                businessLocation = s.BusinessLocation ?? "",
                logoUrl = s.LogoUrl ?? "",
                isVerified = s.IsVerified
            });

            return Ok(services);
        }

        // =========================
        // ✅ GET: api/Services/detail/{id}
        // =========================
        [HttpGet("detail/{id}")]
        public async Task<ActionResult<object>> GetServiceWithBusiness(Guid id)
        {
            var s = await _context.Services
                .Include(s => s.Business)
                .Where(s => s.Id == id)
                .Select(s => new
                {
                    s.Id,
                    s.Title,
                    s.Description,
                    s.Category,
                    s.ImageUrl,
                    s.Price,
                    s.DurationMinutes,
                    BusinessId = s.Business != null ? s.Business.Id : (Guid?)null,
                    BusinessName = s.Business != null ? s.Business.BusinessName : null,
                    LogoUrl = s.Business != null ? s.Business.LogoUrl : null,
                    BusinessLocation = s.Business != null ? s.Business.Location : null,
                    BusinessDescription = s.Business != null ? s.Business.Description : null,
                    IsVerified = s.Business != null ? s.Business.IsVerified : false
                })
                .FirstOrDefaultAsync();

            if (s == null)
                return NotFound();

            // Final projection in memory
            var service = new
            {
                s.Id,
                s.Title,
                s.Description,
                s.Category,
                images = ParseImages(s.ImageUrl),
                s.Price,
                s.DurationMinutes,
                businessId = s.BusinessId,
                businessName = s.BusinessName ?? "",
                logoUrl = s.LogoUrl ?? "",
                businessLocation = s.BusinessLocation ?? "",
                businessDescription = s.BusinessDescription ?? "",
                isVerified = s.IsVerified
            };

            return Ok(service);
        }

        // =========================
        // ✅ GET: api/Services/reviews/business/{businessId}
        // =========================
        [HttpGet("reviews/business/{businessId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetBusinessReviews(Guid businessId)
        {
            var reviews = await _context.Reviews
                .Include(r => r.User)
                .Where(r => r.BusinessId == businessId)
                .Select(r => new
                {
                    r.Id,
                    r.Comment,
                    r.Rating,
                    customerName = r.User.FullName,
                    r.CreatedAt
                })
                .ToListAsync();

            return Ok(reviews);
        }

        // =========================
        // ✅ PUT: api/Services/{id}
        // =========================
        [HttpPut("{id}")]
        public async Task<IActionResult> PutService(Guid id, Service service)
        {
            if (id != service.Id)
                return BadRequest();

            _context.Entry(service).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ServiceExists(id))
                    return NotFound();

                throw;
            }

            return NoContent();
        }

        // =========================
        // ✅ POST: api/Services
        // =========================
        [HttpPost]
        public async Task<ActionResult<Service>> PostService(Service service)
        {
            _context.Services.Add(service);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetServiceWithBusiness),
                new { id = service.Id }, service);
        }

        // =========================
        // ✅ DELETE: api/Services/{id}
        // =========================
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteService(Guid id)
        {
            var service = await _context.Services.FindAsync(id);
            if (service == null)
                return NotFound();

            _context.Services.Remove(service);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ServiceExists(Guid id)
        {
            return _context.Services.Any(e => e.Id == id);
        }
    }
}
