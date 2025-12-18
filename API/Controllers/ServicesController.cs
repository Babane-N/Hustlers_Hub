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
        private List<string> ParseImages(string? imageUrl)
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
                // backward compatibility (single image stored as string)
                return new List<string> { imageUrl };
            }
        }

        // =========================
        // ✅ GET: api/Services
        // =========================
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetServices()
        {
            var services = await _context.Services
                .Include(s => s.Business)
                .Select(s => new
                {
                    s.Id,
                    s.Title,
                    s.Category,
                    s.Description,
                    images = ParseImages(s.ImageUrl), // ✅ MULTIPLE IMAGES
                    s.Price,
                    s.DurationMinutes,
                    latitude = s.Business.Latitude,
                    longitude = s.Business.Longitude,
                    businessName = s.Business.BusinessName,
                    businessLocation = s.Business.Location,
                    logoUrl = s.Business.LogoUrl,
                    isVerified = s.Business.IsVerified
                })
                .ToListAsync();

            return Ok(services);
        }

        // =========================
        // ✅ GET: api/Services/detail/{id}
        // =========================
        [HttpGet("detail/{id}")]
        public async Task<ActionResult<object>> GetServiceWithBusiness(Guid id)
        {
            var service = await _context.Services
                .Include(s => s.Business)
                .Where(s => s.Id == id)
                .Select(s => new
                {
                    s.Id,
                    s.Title,
                    s.Description,
                    s.Category,
                    images = ParseImages(s.ImageUrl), // ✅ MULTIPLE IMAGES
                    s.Price,
                    s.DurationMinutes,
                    businessId = s.Business.Id,
                    businessName = s.Business.BusinessName,
                    logoUrl = s.Business.LogoUrl,
                    businessLocation = s.Business.Location,
                    businessDescription = s.Business.Description,
                    isVerified = s.Business.IsVerified
                })
                .FirstOrDefaultAsync();

            if (service == null)
                return NotFound();

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

