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

        // BASIC BUSINESS INFO
        [Required, MaxLength(100)]
        public string BusinessName { get; set; }

        [Required]
        public string Description { get; set; }

        [MaxLength(255)]
        public string Location { get; set; } 

        [MaxLength(100)]
        public string Category { get; set; } 

        // SERVICE (MERGED)
        [Required]
        public decimal Price { get; set; }
        public int DurationMinutes { get; set; }
        public string? ImageUrls { get; set; }
        public string? LogoUrl { get; set; }

        // VERIFICATION & APPROVAL    
        public bool IsApproved { get; set; } = false;
        public bool IsVerified { get; set; } = false;
        public string BusinessType { get; set; } = string.Empty;
        public string? RegistrationNumber { get; set; } // CIPC number

        // LOCATION (MAP)
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }

        // META
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // OWNERSHIP
        [Required]
        public Guid UserId { get; set; }
        [ForeignKey(nameof(UserId))]
        public User User { get; set; }

        // RELATIONSHIPS
        public ICollection<Review> Reviews { get; set; }
    }
}
