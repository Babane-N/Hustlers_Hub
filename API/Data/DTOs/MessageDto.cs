public class MessageDto
{
    public Guid Id { get; set; }

    public Guid ConversationId { get; set; }

    public Guid SenderId { get; set; }

    public string SenderName { get; set; }

    public string MessageText { get; set; }

    public DateTime SentAt { get; set; }

    public bool IsRead { get; set; }
}

