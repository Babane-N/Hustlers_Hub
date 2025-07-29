using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Data;
using API.Data.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly HustlersHubDbContext _context;

        public UsersController(HustlersHubDbContext context)
        {
            _context = context;
        }

        // ✅ LOGIN: api/Users/login
        [HttpPost("login")]
        public async Task<ActionResult<object>> Login([FromBody] LoginRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
                return BadRequest("Email and password are required.");

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == request.Email && u.PasswordHash == request.Password);

            if (user == null)
                return Unauthorized("Invalid email or password.");

            return Ok(new
            {
                token = Guid.NewGuid(),
                role = user.UserType.ToString(), // Convert enum to string
                userId = user.Id,
                email = user.Email
            });
        }

        public class RegisterUserDto
        {
            public string FullName { get; set; } = string.Empty;
            public string Email { get; set; } = string.Empty;
            public string PhoneNumber { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
            public UserType UserType { get; set; }
        }

        // ✅ REGISTER: api/Users
        [HttpPost]
        public async Task<ActionResult<User>> PostUser([FromBody] RegisterUserDto dto)
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
                PasswordHash = dto.Password, // 🔐 Replace with hashing in production
                UserType = dto.UserType,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetUser), new { id = user.Id }, user);
        }



        // ✅ GET ALL: api/Users
        [HttpGet]
        public async Task<ActionResult<IEnumerable<User>>> GetUsers()
        {
            return await _context.Users.ToListAsync();
        }

        // ✅ GET BY ID: api/Users/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<User>> GetUser(Guid id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return NotFound();

            return user;
        }

        // ✅ UPDATE: api/Users/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> PutUser(Guid id, User user)
        {
            if (id != user.Id)
                return BadRequest();

            _context.Entry(user).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UserExists(id))
                    return NotFound();
                else
                    throw;
            }

            return NoContent();
        }

        // ✅ DELETE: api/Users/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(Guid id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return NotFound();

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool UserExists(Guid id)
        {
            return _context.Users.Any(e => e.Id == id);
        }

        // DTO for login
        public class LoginRequest
        {
            public string Email { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
        }
    }
}