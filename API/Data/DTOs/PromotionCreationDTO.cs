using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;  // <-- Add this
using Microsoft.AspNetCore.Http;


using API.Data.Models;

public class PromotionCreateDto
{
    [Required]
    public string Title { get; set; }

    [Required]
    public string Description { get; set; }

    [Required]
    public string Category { get; set; }

    [Required]
    public Guid PostedById { get; set; }

    public bool IsBoosted { get; set; } = false;

    public DateTime ExpiresAt { get; set; }

    // Support multiple images
    public List<IFormFile>? Images { get; set; }
}