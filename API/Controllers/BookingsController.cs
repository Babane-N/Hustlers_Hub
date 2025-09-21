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
        public BookingsController(HustlersHubDbContext context) => _context = context;

        // GET: api/Bookings
        [HttpGet]
        public async Task<ActionResult<IEnumerable<BookingDto>>> GetBookings()
        {
            var bookings = await _context.Bookings
                .Include(b => b.Customer)
                .Include(b => b.Service)
                .ThenInclude(s => s.Business)
                .ToListAsync();

            return Ok(bookings.Select(b => MapToDto(b)));
        }

        // GET: api/Bookings/5
        [HttpGet("{id}")]
        public async Task<ActionResult<BookingDto>> GetBooking(Guid id)
        {
            var booking = await _context.Bookings
                .Include(b => b.Customer)
                .Include(b => b.Service)
                .ThenInclude(s => s.Business)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (booking == null)
                return NotFound();

            return Ok(MapToDto(booking));
        }

        // POST: api/Bookings
        [HttpPost]
        public async Task<ActionResult<BookingDto>> PostBooking([FromBody] CreateBookingDto dto)
        {
            // Validate Service exists
            var service = await _context.Services
                .Include(s => s.Business)
                .FirstOrDefaultAsync(s => s.Id == dto.ServiceId);

            if (service == null)
                return BadRequest($"Service with Id {dto.ServiceId} does not exist.");

            // Validate Customer exists
            if (!await _context.Users.AnyAsync(u => u.Id == dto.CustomerId))
                return BadRequest($"Customer with Id {dto.CustomerId} does not exist.");

            // Create Booking
            var booking = new Booking
            {
                Id = Guid.NewGuid(),
                ServiceId = dto.ServiceId,
                CustomerId = dto.CustomerId,
                BusinessId = service.BusinessId,
                BookingDate = dto.BookingDate,
                Status = BookingStatus.Pending,
                Description = dto.Description,
                ContactNumber = dto.ContactNumber,
                Location = dto.Location,
                Latitude = dto.Latitude,
                Longitude = dto.Longitude
            };

            _context.Bookings.Add(booking);
            await _context.SaveChangesAsync();

            // Return DTO instead of EF entity to avoid cycles
            return CreatedAtAction(nameof(GetBooking), new { id = booking.Id }, MapToDto(booking));
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
            booking.Description = dto.Description;
            booking.ContactNumber = dto.ContactNumber;
            booking.Location = dto.Location;
            booking.Latitude = dto.Latitude;
            booking.Longitude = dto.Longitude;

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

        // GET: api/Bookings/business/5
        [HttpGet("business/{businessId}")]
        public async Task<ActionResult<IEnumerable<BookingDto>>> GetBookingsByBusiness(Guid businessId)
        {
            var bookings = await _context.Bookings
                .Where(b => b.BusinessId == businessId)
                .Include(b => b.Customer)
                .Include(b => b.Service)
                .ThenInclude(s => s.Business)
                .ToListAsync();

            return Ok(bookings.Select(b => MapToDto(b)));
        }

        // Helper: Map Booking EF entity to BookingDto
        private BookingDto MapToDto(Booking b) => new BookingDto
        {
            Id = b.Id,
            BookingDate = b.BookingDate,
            Status = b.Status,
            CustomerName = b.Customer?.FullName,
            ServiceTitle = b.Service?.Title,
            BusinessName = b.Service?.Business?.BusinessName,
            Description = b.Description,
            ContactNumber = b.ContactNumber,
            Location = b.Location,
            Latitude = b.Latitude,
            Longitude = b.Longitude
        };
    }

    // DTOs
    public class CreateBookingDto
    {
        public Guid ServiceId { get; set; }
        public Guid CustomerId { get; set; }
        public DateTime BookingDate { get; set; }
        public string? Description { get; set; }
        public string? ContactNumber { get; set; }
        public string? Location { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
    }

    public class UpdateBookingDto
    {
        public DateTime BookingDate { get; set; }
        public BookingStatus Status { get; set; }
        public string? Description { get; set; }
        public string? ContactNumber { get; set; }
        public string? Location { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
    }

    public class BookingDto
    {
        public Guid Id { get; set; }
        public DateTime BookingDate { get; set; }
        public BookingStatus Status { get; set; }
        public string? CustomerName { get; set; }
        public string? ServiceTitle { get; set; }
        public string? BusinessName { get; set; }
        public string? Description { get; set; }
        public string? ContactNumber { get; set; }
        public string? Location { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
    }
}
