using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace API.Data.Models
{
    public class Service
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid BusinessId { get; set; }

        [Required, MaxLength(255)]
        public string ServiceName { get; set; }

        public string Description { get; set; }

        public decimal Price { get; set; }

        [MaxLength(50)]
        public string Duration { get; set; } // Example: "30 mins", "1 hour"

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Property
        [ForeignKey("BusinessId")]
        public Business Business { get; set; }
    }
}
