using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace API.Data.Models
{
    public class PromotionImage
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public string ImageUrl { get; set; }

        [Required]
        public Guid PromotionId { get; set; }

        [ForeignKey("PromotionId")]
        public Promotion Promotion { get; set; }
    }
}
