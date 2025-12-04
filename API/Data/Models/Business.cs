using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace API.Data.Models
{
    public class Business
    {
        [Key]
        [Required]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required, MaxLength(100)]
        public string BusinessName { get; set; }

        public string Description { get; set; }

        [MaxLength(255)]
        public string Location { get; set; } // e.g. "Johannesburg, South Africa"

        [MaxLength(100)]
        public string Category { get; set; } // E.g., Plumbing, Cleaning, Fitness

        public string? LogoUrl { get; set; } // Business Logo (optional)

        public bool IsVerified { get; set; } = false;
        public string BusinessType { get; set; } = string.Empty; // verified / unverified
        public string? RegistrationNumber { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // ✅ New: Store map coordinates
        public double? Latitude { get; set; }   // precise lat
        public double? Longitude { get; set; }  // precise lng
        public bool IsApproved { get; set; } = false;

        // Foreign Key
        [Required]
        public Guid UserId { get; set; }

        // Navigation Properties
        [ForeignKey("UserId")]
        public User User { get; set; }

        public ICollection<Service> Services { get; set; }
        public ICollection<Review> Reviews { get; set; }
    }
}
