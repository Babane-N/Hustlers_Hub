using System.ComponentModel.DataAnnotations;

namespace API.Data.Models
{
    public class Message
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid ConversationId { get; set; }

        public Conversation Conversation { get; set; }

        // User who sent the message
        [Required]
        public Guid SenderId { get; set; }

        public User Sender { get; set; }

        [Required]
        public string MessageText { get; set; }

        public DateTime SentAt { get; set; } = DateTime.UtcNow;

        public bool IsRead { get; set; } = false;
    }
}
