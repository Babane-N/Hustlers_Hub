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

        // ---------------------------
        // GET: api/Bookings
        // ---------------------------
        [HttpGet]
        public async Task<ActionResult<IEnumerable<BookingDto>>> GetBookings()
        {
            var bookings = await _context.Bookings
                .Include(b => b.Customer)
                .Include(b => b.Service)
                .Include(b => b.Business)
                .ToListAsync();

            return Ok(bookings.Select(MapToDto));
        }

        // ---------------------------
        // GET: api/Bookings/{id}
        // ---------------------------
        [HttpGet("{id}")]
        public async Task<ActionResult<BookingDto>> GetBooking(Guid id)
        {
            var booking = await _context.Bookings
                .Include(b => b.Customer)
                .Include(b => b.Service)
                .Include(b => b.Business)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (booking == null)
                return NotFound();

            return Ok(MapToDto(booking));
        }

        // ---------------------------
        // GET: api/Bookings/business/{businessId}
        // ---------------------------
        [HttpGet("business/{businessId}")]
        public async Task<ActionResult<IEnumerable<BookingDto>>> GetBookingsByBusiness(Guid businessId)
        {
            var bookings = await _context.Bookings
                .Where(b => b.BusinessId == businessId)
                .Include(b => b.Customer)
                .Include(b => b.Service)
                .Include(b => b.Business)
                .ToListAsync();

            return Ok(bookings.Select(MapToDto));
        }

        // ---------------------------
        // GET: api/Bookings/customer/{customerId}
        // ---------------------------
        [HttpGet("customer/{customerId}")]
        public async Task<ActionResult<IEnumerable<BookingDto>>> GetBookingsByCustomer(Guid customerId)
        {
            var bookings = await _context.Bookings
                .Where(b => b.CustomerId == customerId)
                .Include(b => b.Customer)
                .Include(b => b.Service)
                .Include(b => b.Business)
                .ToListAsync();

            return Ok(bookings.Select(MapToDto));
        }

        // ---------------------------
        // POST: api/Bookings
        // ---------------------------
        [HttpPost]
        public async Task<ActionResult<BookingDto>> PostBooking([FromBody] CreateBookingDto dto)
        {
            var service = await _context.Services
                .Include(s => s.Business)
                .FirstOrDefaultAsync(s => s.Id == dto.ServiceId);

            if (service == null)
                return BadRequest($"Service with Id {dto.ServiceId} does not exist.");

            if (!await _context.Users.AnyAsync(u => u.Id == dto.CustomerId))
                return BadRequest($"Customer with Id {dto.CustomerId} does not exist.");

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

            return CreatedAtAction(nameof(GetBooking), new { id = booking.Id }, MapToDto(booking));
        }

        // ---------------------------
        // PUT: api/Bookings/{id}
        // ---------------------------
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

        // ---------------------------
        // DELETE: api/Bookings/{id}
        // ---------------------------
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

        // ---------------------------
        // Helper: Map Booking EF entity to BookingDto
        // ---------------------------
        private BookingDto MapToDto(Booking b) => new BookingDto
        {
            Id = b.Id,
            BookingDate = b.BookingDate,
            Status = b.Status,
            CustomerName = b.Customer?.FullName ?? "Unknown Customer",
            ServiceTitle = b.Service?.Title ?? "Unknown Service",
            BusinessName = b.Business?.BusinessName ?? "Unknown Business",
            Description = b.Description,
            ContactNumber = b.ContactNumber,
            Location = b.Location,
            Latitude = b.Latitude,
            Longitude = b.Longitude
        };
    }

    // ---------------------------
    // DTOs
    // ---------------------------
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
