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
        public string BusisnssName { get; set; }

        public string Description { get; set; }

        [MaxLength(255)]
        public string Location { get; set; }

        [MaxLength(100)]
        public string Category { get; set; } // E.g., Plumbing, Cleaning, Fitness

        public string? LogoUrl { get; set; } // Business Logo (optional)

        public bool IsVerified { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

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
