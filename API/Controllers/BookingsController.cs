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
    public class BookingsController : ControllerBase
    {
        private readonly HustlersHubDbContext _context;

        public BookingsController(HustlersHubDbContext context)
        {
            _context = context;
        }

        // GET: api/Bookings
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Booking>>> GetBookings()
        {
            var bookings = await _context.Bookings
                .Include(b => b.Customer)
                .Include(b => b.Service)
                .Include(b => b.ServiceProvider)
                .ToListAsync();

            return Ok(bookings);
        }

        // GET: api/Bookings/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Booking>> GetBooking(Guid id)
        {
            var booking = await _context.Bookings
                .Include(b => b.Customer)
                .Include(b => b.Service)
                .Include(b => b.ServiceProvider)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (booking == null)
                return NotFound();

            return Ok(booking);
        }

        // POST: api/Bookings
        [HttpPost]
        public async Task<ActionResult<Booking>> PostBooking([FromBody] CreateBookingDto dto)
        {
            var booking = new Booking
            {
                Id = Guid.NewGuid(),
                ServiceId = dto.ServiceId,
                CustomerId = dto.CustomerId,
                ProviderId = dto.ProviderId,
                BookingDate = dto.BookingDate,
                Status = BookingStatus.Pending
            };

            _context.Bookings.Add(booking);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetBooking), new { id = booking.Id }, booking);
        }

        // PUT: api/Bookings/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutBooking(Guid id, [FromBody] UpdateBookingDto dto)
        {
            var booking = await _context.Bookings.FindAsync(id);
            if (booking == null)
                return NotFound();

            booking.BookingDate = dto.BookingDate;
            booking.Status = dto.Status;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/Bookings/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBooking(Guid id)
        {
            var booking = await _context.Bookings.FindAsync(id);
            if (booking == null)
                return NotFound();

            _context.Bookings.Remove(booking);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/Bookings/provider/{providerId}
        [HttpGet("provider/{providerId}")]
        public async Task<ActionResult<IEnumerable<Booking>>> GetBookingsByProvider(Guid providerId)
        {
            var bookings = await _context.Bookings
                .Where(b => b.ProviderId == providerId)
                .Include(b => b.Customer)
                .Include(b => b.Service)
                .ToListAsync();

            return Ok(bookings);
        }

        private bool BookingExists(Guid id)
        {
            return _context.Bookings.Any(e => e.Id == id);
        }
    }
}

