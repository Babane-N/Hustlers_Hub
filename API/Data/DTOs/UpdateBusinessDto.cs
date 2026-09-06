public class UpdateBusinessDto
{
    public string Description { get; set; } = string.Empty;

    public string Category { get; set; } = string.Empty;

    public string Location { get; set; } = string.Empty;

    public IFormFile? Logo { get; set; }
}