﻿using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace API.Data.Models
{
    public class Service
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public string Title { get; set; }

        [Required]
        public string Description { get; set; }

        public string? ImageUrl { get; set; }

        [Required]
        public decimal Price { get; set; }

        [Required]
        public int DurationMinutes { get; set; }

        public string Category { get; set; }

        [Required]
        public Guid BusinessId { get; set; }

        [ForeignKey("BusinessId")]
        public Business Business { get; set; }
    }

}
