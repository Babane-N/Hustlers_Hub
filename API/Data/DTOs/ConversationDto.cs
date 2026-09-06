namespace API.DTOs
{
    public class ConversationDto
    {
        public Guid Id { get; set; }

        public Guid CustomerId { get; set; }

        public Guid BusinessId { get; set; }

        public string BusinessName { get; set; }

        public string CustomerName { get; set; }

        public string? LastMessage { get; set; }

        public DateTime? LastMessageAt { get; set; }

        public int UnreadCount { get; set; }
    }
}