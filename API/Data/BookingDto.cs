using API.Data.Models;

public class CreateBookingDto
{
    public Guid ServiceId { get; set; }
    public Guid CustomerId { get; set; }
    public Guid ProviderId { get; set; }
    public DateTime BookingDate { get; set; }
}

public class UpdateBookingDto
{
    public DateTime BookingDate { get; set; }
    public BookingStatus Status { get; set; }
}
