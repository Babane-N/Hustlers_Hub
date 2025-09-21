using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace API.Data.Models
{
    public class Booking
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid ServiceId { get; set; }

        [Required]
        public Guid CustomerId { get; set; }

        [Required]
        public Guid BusinessId { get; set; } // matches DB column

        [Required]
        public DateTime BookingDate { get; set; }

        [MaxLength(500)]
        public string? Description { get; set; }

        [MaxLength(255)]
        public string? Location { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }

        [Phone]
        public string? ContactNumber { get; set; }

        public BookingStatus Status { get; set; } = BookingStatus.Pending;

        // Navigation
        [ForeignKey("ServiceId")]
        public Service Service { get; set; }

        [ForeignKey("CustomerId")]
        public User Customer { get; set; }

        [ForeignKey("BusinessId")]
        public Business Business { get; set; }
    }


    public enum BookingStatus
    {
        Pending,
        Confirmed,
        Cancelled,
        Completed
    }
}
