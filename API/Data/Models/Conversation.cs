using System.ComponentModel.DataAnnotations;

namespace API.Data.Models
{
    public class Conversation
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        // Customer participating in the conversation
        [Required]
        public Guid CustomerId { get; set; }

        public User Customer { get; set; }

        // Business being contacted
        [Required]
        public Guid BusinessId { get; set; }

        public Business Business { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? LastMessageAt { get; set; }

        public ICollection<Message> Messages { get; set; }
            = new List<Message>();
    }
}