using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace API.Data.Models
{
    public class Promotion
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public string Title { get; set; }

        [Required]
        public string Description { get; set; }

        public string? ImageUrl { get; set; }

        [Required]
        public string Category { get; set; } // "Event", "Deal", "Buy & Sell", "Job", "Announcement"

        [Required]
        public Guid PostedById { get; set; }

        public bool IsBoosted { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime ExpiresAt { get; set; }

        [ForeignKey("PostedById")]
        public User PostedBy { get; set; }
    }

}
