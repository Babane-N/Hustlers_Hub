using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace API.Data.Models
{
    public class Review
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid BusinessId { get; set; }

        [Required]
        public Guid UserId { get; set; } // Customer who left the review

        [Required]
        [Range(1, 5)]
        public int Rating { get; set; } // 1-5 stars

        public string Comment { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        [ForeignKey("BusinessId")]
        public Business Business { get; set; }

        [ForeignKey("UserId")]
        public User User { get; set; }
    }
}
