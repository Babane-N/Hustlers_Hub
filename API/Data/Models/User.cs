using System.ComponentModel.DataAnnotations;

namespace API.Data.Models
{
    public class User
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required, MaxLength(100)]
        public string FullName { get; set; }

        [Required, EmailAddress, MaxLength(150)]
        public string Email { get; set; }

        [Required]
        public string PasswordHash { get; set; }

        [MaxLength(10)]
        public string PhoneNumber { get; set; }

        [Required]
        public UserType UserType { get; set; }

        public string? ProfileImage {  get; set; }

        public DateTime? CreatedAt { get; set; }
        public string? AuthProvider { get; set; }  // Google, Facebook, etc.
        public string? ProviderUserId { get; set; }

        //Nevigation
        public ICollection<Business> Businesses { get; set; }
  
    }

    public enum UserType
    {
        Customer,
        Business,
        Admin
    }
}
