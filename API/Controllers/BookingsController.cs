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

        // =====================================================
        // GET: api/Bookings
        // =====================================================
        [HttpGet]
        public async Task<ActionResult<IEnumerable<BookingDto>>> GetBookings()
        {
            var bookings = await QueryBookings().ToListAsync();
            return Ok(bookings.Select(MapToDto));
        }

        // =====================================================
        // GET: api/Bookings/{id}
        // =====================================================
        [HttpGet("{id}")]
        public async Task<ActionResult<BookingDto>> GetBooking(Guid id)
        {
            var booking = await QueryBookings()
                .FirstOrDefaultAsync(b => b.Id == id);

            if (booking == null)
                return NotFound("Booking not found.");

            return Ok(MapToDto(booking));
        }

        // =====================================================
        // GET: api/Bookings/business/{businessId}
        // =====================================================
        [HttpGet("business/{businessId}")]
        public async Task<ActionResult<IEnumerable<BookingDto>>> GetBookingsByBusiness(Guid businessId)
        {
            var bookings = await QueryBookings()
                .Where(b => b.BusinessId == businessId)
                .OrderByDescending(b => b.BookingDate)
                .ToListAsync();

            return Ok(bookings.Select(MapToDto));
        }

        // =====================================================
        // GET: api/Bookings/customer/{customerId}
        // =====================================================
        [HttpGet("customer/{customerId}")]
        public async Task<ActionResult<IEnumerable<BookingDto>>> GetBookingsByCustomer(Guid customerId)
        {
            var bookings = await QueryBookings()
                .Where(b => b.CustomerId == customerId)
                .OrderByDescending(b => b.BookingDate)
                .ToListAsync();

            return Ok(bookings.Select(MapToDto));
        }

        // =====================================================
        // POST: api/Bookings
        // =====================================================
        [HttpPost]
        public async Task<ActionResult<BookingDto>> CreateBooking([FromBody] CreateBookingDto dto)
        {
            // Validate business
            var business = await _context.Businesses
                .FirstOrDefaultAsync(b => b.Id == dto.BusinessId && b.IsApproved);

            if (business == null)
                return BadRequest("Business does not exist or is not approved.");

            // Validate customer
            var customerExists = await _context.Users.AnyAsync(u => u.Id == dto.CustomerId);
            if (!customerExists)
                return BadRequest("Customer does not exist.");

            var booking = new Booking
            {
                Id = Guid.NewGuid(),
                BusinessId = dto.BusinessId,
                CustomerId = dto.CustomerId,
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

            // Reload with navigation properties
            var created = await QueryBookings()
                .FirstAsync(b => b.Id == booking.Id);

            return CreatedAtAction(nameof(GetBooking),
                new { id = booking.Id },
                MapToDto(created));
        }

        // =====================================================
        // PUT: api/Bookings/{id}
        // =====================================================
        [HttpPut("{id}")]
        public async Task<ActionResult<BookingDto>> UpdateBooking(Guid id, [FromBody] UpdateBookingDto dto)
        {
            var booking = await _context.Bookings.FindAsync(id);
            if (booking == null)
                return NotFound("Booking not found.");

            booking.BookingDate = dto.BookingDate;
            booking.Status = dto.Status;
            booking.Description = dto.Description;
            booking.ContactNumber = dto.ContactNumber;
            booking.Location = dto.Location;
            booking.Latitude = dto.Latitude;
            booking.Longitude = dto.Longitude;

            await _context.SaveChangesAsync();

            var updated = await QueryBookings()
                .FirstAsync(b => b.Id == id);

            return Ok(MapToDto(updated));
        }

        // =====================================================
        // DELETE: api/Bookings/{id}
        // =====================================================
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBooking(Guid id)
        {
            var booking = await _context.Bookings.FindAsync(id);
            if (booking == null)
                return NotFound("Booking not found.");

            _context.Bookings.Remove(booking);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // =====================================================
        // Helper: Shared Query
        // =====================================================
        private IQueryable<Booking> QueryBookings()
        {
            return _context.Bookings
                .Include(b => b.Customer)
                .Include(b => b.Business)
                .AsNoTracking();
        }

        // =====================================================
        // Helper: Map to DTO
        // =====================================================
        private BookingDto MapToDto(Booking b)
        {
            return new BookingDto
            {
                Id = b.Id,
                BookingDate = b.BookingDate,
                Status = b.Status,
                CustomerName = b.Customer?.FullName ?? "Unknown Customer",
                BusinessName = b.Business?.BusinessName ?? "Unknown Business",
                Description = b.Description,
                ContactNumber = b.ContactNumber,
                Location = b.Location,
                Latitude = b.Latitude,
                Longitude = b.Longitude
            };
        }
    }

    // =====================================================
    // DTOs
    // =====================================================
    public class CreateBookingDto
    {
        public Guid BusinessId { get; set; }
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
        public string? BusinessName { get; set; }
        public string? Description { get; set; }
        public string? ContactNumber { get; set; }
        public string? Location { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
    }
}
