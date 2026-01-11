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

        // ----------------------------
        // 🔐 REGISTER
        // ----------------------------
        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<IActionResult> Register([FromBody] RegisterUserDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
                return BadRequest("Email and password are required.");

            if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
                return BadRequest("Email is already registered.");

            var user = new User
            {
                Id = Guid.NewGuid(),
                FullName = dto.FullName,
                Email = dto.Email,
                PhoneNumber = dto.PhoneNumber,
                UserType = dto.UserType,
                CreatedAt = DateTime.UtcNow,
                AuthProvider = "Local"
            };

            user.PasswordHash = _passwordHasher.HashPassword(user, dto.Password);

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var token = _jwtService.GenerateToken(user.Id.ToString(), user.UserType.ToString());

            return Ok(new
            {
                userId = user.Id,
                email = user.Email,
                role = user.UserType.ToString(),
                token
            });
        }

        // ----------------------------
        // 🔑 LOGIN
        // ----------------------------
        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
            if (user == null)
                return Unauthorized("Invalid email or password.");

            var result = _passwordHasher.VerifyHashedPassword(
                user,
                user.PasswordHash,
                dto.Password
            );

            if (result != PasswordVerificationResult.Success)
                return Unauthorized("Invalid email or password.");

            var token = _jwtService.GenerateToken(user.Id.ToString(), user.UserType.ToString());

            return Ok(new
            {
                userId = user.Id,
                email = user.Email,
                role = user.UserType.ToString(),
                token
            });
        }

        // ----------------------------
        // 🔁 FORGOT PASSWORD
        // ----------------------------
        [HttpPost("forgot-password")]
        [AllowAnonymous]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);

            // Always return OK (do not reveal user existence)
            if (user == null)
                return Ok();

            var token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
            var tokenHash = HashToken(token);

            var resetToken = new PasswordResetToken
            {
                UserId = user.Id,
                TokenHash = tokenHash,
                ExpiryDate = DateTime.UtcNow.AddHours(1),
                IsUsed = false
            };

            _context.PasswordResetTokens.Add(resetToken);
            await _context.SaveChangesAsync();

            var resetLink =
                $"{_config["FrontendUrl"]}/reset-password?token={Uri.EscapeDataString(token)}&email={Uri.EscapeDataString(dto.Email)}";

            await _emailService.SendAsync(
                dto.Email,
                "Reset your Hustlers Hub password",
                $"Click the link below to reset your password:\n\n{resetLink}\n\nThis link expires in 1 hour."
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

            var tokenEntry = await _context.PasswordResetTokens
                .Where(t =>
                    t.UserId == user.Id &&
                    !t.IsUsed &&
                    t.ExpiryDate > DateTime.UtcNow)
                .OrderByDescending(t => t.CreatedAt)
                .FirstOrDefaultAsync();

            if (tokenEntry == null)
                return BadRequest("Invalid or expired token.");

            var incomingTokenHash = HashToken(dto.Token);

            if (tokenEntry.TokenHash != incomingTokenHash)
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
    public class RegisterUserDto
    {
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public UserType UserType { get; set; }
    }

    public class LoginRequestDto
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
