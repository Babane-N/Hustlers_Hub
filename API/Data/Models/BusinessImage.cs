using API.Data.Models;

public class BusinessImage
{
    public Guid Id { get; set; }
    public Guid BusinessId { get; set; }
    public string ImageUrl { get; set; } = string.Empty;

    public Business Business { get; set; }
}
