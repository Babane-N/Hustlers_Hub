using API.Data;
using API.Data.Models;
using API.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ConversationsController : ControllerBase
    {
        private readonly HustlersHubDbContext _context;

        public ConversationsController(HustlersHubDbContext context)
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
        // CREATE OR GET CONVERSATION WITH BUSINESS
        // POST: api/conversations/business/{businessId}
        // ---------------------------------------------------------
        [HttpPost("business/{businessId}")]
        public async Task<IActionResult> StartConversation(Guid businessId)
        {
            var currentUserId = GetCurrentUserId();

            if (currentUserId == null)
                return Unauthorized();

            // Only customers should initiate a conversation
            var customer = await _context.Users
                .FirstOrDefaultAsync(u =>
                    u.Id == currentUserId.Value &&
                    u.UserType == UserType.Customer);

            if (customer == null)
            {
                return Forbid();
            }

            // Make sure business exists and is approved
            var business = await _context.Businesses
                .FirstOrDefaultAsync(b =>
                    b.Id == businessId &&
                    b.IsApproved);

            if (business == null)
            {
                return NotFound(new
                {
                    message = "Business not found."
                });
            }

            // Check if conversation already exists
            var existingConversation = await _context.Conversations
                .FirstOrDefaultAsync(c =>
                    c.CustomerId == currentUserId.Value &&
                    c.BusinessId == businessId);

            if (existingConversation != null)
            {
                return Ok(new ConversationDto
                {
                    Id = existingConversation.Id,
                    CustomerId = existingConversation.CustomerId,
                    BusinessId = existingConversation.BusinessId,

                    BusinessName = business.BusinessName,
                    CustomerName = customer.FullName,

                    LastMessage = null,
                    LastMessageAt = existingConversation.LastMessageAt,

                    UnreadCount = await _context.Messages.CountAsync(m =>
                        m.ConversationId == existingConversation.Id &&
                        !m.IsRead &&
                        m.SenderId != currentUserId.Value)
                });
            }

            // Create new conversation
            var conversation = new Conversation
            {
                Id = Guid.NewGuid(),
                CustomerId = currentUserId.Value,
                BusinessId = businessId,
                CreatedAt = DateTime.UtcNow
            };

            _context.Conversations.Add(conversation);

            await _context.SaveChangesAsync();

            // Return the COMPLETE conversation DTO
            return Ok(new ConversationDto
            {
                Id = conversation.Id,
                CustomerId = conversation.CustomerId,
                BusinessId = conversation.BusinessId,

                BusinessName = business.BusinessName,
                CustomerName = customer.FullName,

                LastMessage = null,
                LastMessageAt = null,

                UnreadCount = 0
            });
        }


        // ---------------------------------------------------------
        // GET USER'S CONVERSATIONS
        // GET: api/conversations
        // ---------------------------------------------------------
        [HttpGet]
        public async Task<IActionResult> GetConversations()
        {
            var currentUserId = GetCurrentUserId();

            if (currentUserId == null)
                return Unauthorized();

            var conversations = await _context.Conversations
                .Include(c => c.Customer)
                .Include(c => c.Business)
                .Include(c => c.Messages)
                .Where(c =>
                    c.CustomerId == currentUserId.Value ||
                    c.Business.UserId == currentUserId.Value)
                .OrderByDescending(c => c.LastMessageAt ?? c.CreatedAt)
                .ToListAsync();

            var result = conversations.Select(c =>
            {
                var lastMessage = c.Messages
                    .OrderByDescending(m => m.SentAt)
                    .FirstOrDefault();

                return new ConversationDto
                {
                    Id = c.Id,
                    CustomerId = c.CustomerId,
                    BusinessId = c.BusinessId,

                    BusinessName = c.Business.BusinessName,
                    CustomerName = c.Customer.FullName,

                    LastMessage = lastMessage?.MessageText,
                    LastMessageAt = c.LastMessageAt,

                    UnreadCount = c.Messages.Count(m =>
                        !m.IsRead &&
                        m.SenderId != currentUserId.Value)
                };
            });

            return Ok(result);
        }
    }
}