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
    public class ServicesController : ControllerBase
    {
        private readonly HustlersHubDbContext _context;

        public ServicesController(HustlersHubDbContext context)
        {
            _context = context;
        }

        // ✅ GET: api/Services
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetServices()
        {
            var servicesWithBusiness = await _context.Services
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
                    businessName = s.Business.BusinessName,
                    businessLocation = s.Business.Location,
                    logoUrl = s.Business.LogoUrl // ✅ Unified camelCase name
                })
                .ToListAsync();

            return Ok(servicesWithBusiness);
        }

        // ✅ GET: api/Services/detail/{id}
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
                    s.ImageUrl,
                    s.Price,
                    s.DurationMinutes,
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

        // ✅ GET: api/Services/reviews/business/{businessId}
        [HttpGet("reviews/business/{businessId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetBusinessReviews(Guid businessId)
        {
            var reviews = await _context.Reviews
                .Include(r => r.User) // join with user for reviewer name
                .Where(r => r.BusinessId == businessId)
                .Select(r => new
                {
                    r.Id,
                    r.Comment,
                    r.Rating,
                    Reviewer = r.User.FullName,
                    r.CreatedAt
                })
                .ToListAsync();

            return Ok(reviews);
        }

        // ✅ PUT: api/Services/{id}
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
                else
                    throw;
            }

            return NoContent();
        }

        // ✅ POST: api/Services
        [HttpPost]
        public async Task<ActionResult<Service>> PostService(Service service)
        {
            _context.Services.Add(service);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetServiceWithBusiness), new { id = service.Id }, service);
        }

        // ✅ DELETE: api/Services/{id}
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
