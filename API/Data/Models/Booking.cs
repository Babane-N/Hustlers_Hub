using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace API.Data.Models
{
    public class Booking
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid ServiceId { get; set; }

        [Required]
        public Guid CustomerId { get; set; } // Who booked the service

        [Required]
        public Guid ProviderId { get; set; } // Who provides the service

        public DateTime BookingDate { get; set; }

        [Required]
        public BookingStatus Status { get; set; } = BookingStatus.Pending; // Default status

        // Navigation Properties
        [ForeignKey("ServiceId")]
        public Service Service { get; set; }

        [ForeignKey("CustomerId")]
        public User Customer { get; set; }

        [ForeignKey("ProviderId")]
        public User ServiceProvider { get; set; }
    }
    public enum BookingStatus
    {
        Pending,
        Confirmed,
        Cancelled,
        Completed
    }
}
