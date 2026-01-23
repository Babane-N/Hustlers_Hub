using API.Data;
using API.Data.Models;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly HustlersHubDbContext _context;
        private readonly JwtService _jwtService;
        private readonly IEmailService _emailService;
        private readonly IConfiguration _config;
        private readonly PasswordHasher<User> _passwordHasher = new();

        public AuthController(
            HustlersHubDbContext context,
            JwtService jwtService,
            IEmailService emailService,
            IConfiguration config)
        {
            _context = context;
            _jwtService = jwtService;
            _emailService = emailService;
            _config = config;
        }


        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
                return BadRequest(new { message = "Email already exists." });

            var user = new User
            {
                Id = Guid.NewGuid(),
                FullName = dto.FullName,
                Email = dto.Email,
                PhoneNumber = dto.PhoneNumber,
                UserType = (UserType)dto.UserType // ✅ cast int -> enum
            };

            user.PasswordHash = _passwordHasher.HashPassword(user, dto.Password);

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                userId = user.Id,
                user.Email,
                role = user.UserType == UserType.Customer ? "Customer" : "Business"
            });
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
            if (user == null)
                return BadRequest(new { message = "Invalid email or password." });

            var result = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, dto.Password);
            if (result == PasswordVerificationResult.Failed)
                return BadRequest(new { message = "Invalid email or password." });

            // Generate JWT
            var token = _jwtService.GenerateToken(user.Id.ToString(), user.UserType == 0 ? "Customer" : "Business");

            return Ok(new
            {
                token,
                role = user.UserType == 0 ? "Customer" : "Business",
                user = new
                {
                    id = user.Id,
                    fullName = user.FullName,
                    email = user.Email,
                    phoneNumber = user.PhoneNumber,
                    businessId = user.ProviderUserId
                }
            });
        }

        // DTO
        public class LoginDto
        {
            public string Email { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
        }

        // ----------------------------
        // 🔁 FORGOT PASSWORD
        // ----------------------------
        [HttpPost("forgot-password")]
        [AllowAnonymous]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);

            // Always return OK to prevent email enumeration
            if (user == null)
                return Ok();

            // Generate secure token
            var rawToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
            var tokenHash = HashToken(rawToken);

            var resetToken = new PasswordResetToken
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                TokenHash = tokenHash,
                ExpiryDate = DateTime.UtcNow.AddHours(1),
                IsUsed = false,
                CreatedAt = DateTime.UtcNow
            };

            _context.PasswordResetTokens.Add(resetToken);
            await _context.SaveChangesAsync();

            var resetLink =
                $"{_config["FrontendUrl"]}/reset-password" +
                $"?token={Uri.EscapeDataString(rawToken)}" +
                $"&email={Uri.EscapeDataString(dto.Email)}";

            await _emailService.SendAsync(
                dto.Email,
                "Reset your Hustlers Hub password",
                $@"
                Hi {user.FullName},

                Click the link below to reset your password:

                {resetLink}

                This link expires in 1 hour.
                If you did not request this, please ignore this email.
                "
            );

            return Ok();
        }

        // ----------------------------
        // 🔓 RESET PASSWORD
        // ----------------------------
        [HttpPost("reset-password")]
        [AllowAnonymous]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
            if (user == null)
                return BadRequest("Invalid request.");

            var incomingTokenHash = HashToken(dto.Token);

            var tokenEntry = await _context.PasswordResetTokens.FirstOrDefaultAsync(t =>
                t.UserId == user.Id &&
                t.TokenHash == incomingTokenHash &&
                !t.IsUsed &&
                t.ExpiryDate > DateTime.UtcNow
            );

            if (tokenEntry == null)
                return BadRequest("Invalid or expired token.");

            user.PasswordHash = _passwordHasher.HashPassword(user, dto.NewPassword);
            tokenEntry.IsUsed = true;

            await _context.SaveChangesAsync();

            return Ok("Password reset successful.");
        }

        // ----------------------------
        // 🔐 TOKEN HASH HELPER
        // ----------------------------
        private static string HashToken(string token)
        {
            using var sha = SHA256.Create();
            var bytes = sha.ComputeHash(Encoding.UTF8.GetBytes(token));
            return Convert.ToBase64String(bytes);
        }
    }

    // ----------------------------
    // DTOs
    // ----------------------------
    public class RegisterDto
    {
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public int UserType { get; set; } // 0=Customer,1=Business
    }

    public class LoginDto
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class ForgotPasswordDto
    {
        public string Email { get; set; } = string.Empty;
    }

    public class ResetPasswordDto
    {
        public string Email { get; set; } = string.Empty;
        public string Token { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }
}
