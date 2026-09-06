public class BusinessCreateDto
{
    public string BusinessName { get; set; } = string.Empty;

    public string Category { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string Location { get; set; } = string.Empty;

    public Guid UserId { get; set; }

    public IFormFile? Logo { get; set; }

    public double? Latitude { get; set; }

    public double? Longitude { get; set; }

    public string BusinessType { get; set; } = "unverified";

    public string? RegistrationNumber { get; set; }
}