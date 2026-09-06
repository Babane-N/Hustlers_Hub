using API.Data;
using API.Data.Models;
using API.DTOs;
using HustlersHub.API.DTOs.Messaging;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class MessagesController : ControllerBase
    {
        private readonly HustlersHubDbContext _context;

        public MessagesController(HustlersHubDbContext context)
        {
            _context = context;
        }


        // ---------------------------------------------------------
        // GET CURRENT USER ID
        // ---------------------------------------------------------
        private Guid? GetCurrentUserId()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (Guid.TryParse(userId, out var id))
                return id;

            return null;
        }


        // ---------------------------------------------------------
        // CHECK CONVERSATION ACCESS
        // ---------------------------------------------------------
        private async Task<Conversation?> GetAuthorizedConversation(
            Guid conversationId,
            Guid userId)
        {
            return await _context.Conversations
                .Include(c => c.Business)
                .FirstOrDefaultAsync(c =>
                    c.Id == conversationId &&
                    (
                        c.CustomerId == userId ||
                        c.Business.UserId == userId
                    ));
        }


        // ---------------------------------------------------------
        // GET MESSAGES
        // GET: api/messages/conversation/{conversationId}
        // ---------------------------------------------------------
        [HttpGet("conversation/{conversationId}")]
        public async Task<IActionResult> GetMessages(Guid conversationId)
        {
            var currentUserId = GetCurrentUserId();

            if (currentUserId == null)
                return Unauthorized();

            var conversation = await GetAuthorizedConversation(
                conversationId,
                currentUserId.Value);

            if (conversation == null)
            {
                return NotFound(new
                {
                    message = "Conversation not found."
                });
            }

            var messages = await _context.Messages
                .Include(m => m.Sender)
                .Where(m => m.ConversationId == conversationId)
                .OrderBy(m => m.SentAt)
                .Select(m => new MessageDto
                {
                    Id = m.Id,
                    ConversationId = m.ConversationId,
                    SenderId = m.SenderId,
                    SenderName = m.Sender.FullName,
                    MessageText = m.MessageText,
                    SentAt = m.SentAt,
                    IsRead = m.IsRead
                })
                .ToListAsync();

            return Ok(messages);
        }


        // ---------------------------------------------------------
        // SEND MESSAGE
        // POST: api/messages/conversation/{conversationId}
        // ---------------------------------------------------------
        [HttpPost("conversation/{conversationId}")]
        public async Task<IActionResult> SendMessage(
            Guid conversationId,
            [FromBody] SendMessageDto dto)
        {
            var currentUserId = GetCurrentUserId();

            if (currentUserId == null)
                return Unauthorized();

            if (dto == null || string.IsNullOrWhiteSpace(dto.MessageText))
            {
                return BadRequest(new
                {
                    message = "Message cannot be empty."
                });
            }

            var conversation = await GetAuthorizedConversation(
                conversationId,
                currentUserId.Value);

            if (conversation == null)
            {
                return NotFound(new
                {
                    message = "Conversation not found."
                });
            }

            var message = new Message
            {
                Id = Guid.NewGuid(),
                ConversationId = conversationId,
                SenderId = currentUserId.Value,
                MessageText = dto.MessageText.Trim(),
                SentAt = DateTime.UtcNow,
                IsRead = false
            };

            _context.Messages.Add(message);

            // Update conversation's latest activity
            conversation.LastMessageAt = message.SentAt;

            await _context.SaveChangesAsync();

            // Load sender for response
            await _context.Entry(message)
                .Reference(m => m.Sender)
                .LoadAsync();

            var result = new MessageDto
            {
                Id = message.Id,
                ConversationId = message.ConversationId,
                SenderId = message.SenderId,
                SenderName = message.Sender.FullName,
                MessageText = message.MessageText,
                SentAt = message.SentAt,
                IsRead = message.IsRead
            };

            return Ok(result);
        }


        // ---------------------------------------------------------
        // MARK MESSAGES AS READ
        // PUT: api/messages/conversation/{conversationId}/read
        // ---------------------------------------------------------
        [HttpPut("conversation/{conversationId}/read")]
        public async Task<IActionResult> MarkAsRead(Guid conversationId)
        {
            var currentUserId = GetCurrentUserId();

            if (currentUserId == null)
                return Unauthorized();

            var conversation = await GetAuthorizedConversation(
                conversationId,
                currentUserId.Value);

            if (conversation == null)
            {
                return NotFound(new
                {
                    message = "Conversation not found."
                });
            }

            var unreadMessages = await _context.Messages
                .Where(m =>
                    m.ConversationId == conversationId &&
                    m.SenderId != currentUserId.Value &&
                    !m.IsRead)
                .ToListAsync();

            foreach (var message in unreadMessages)
            {
                message.IsRead = true;
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                markedAsRead = unreadMessages.Count
            });
        }
    }
}