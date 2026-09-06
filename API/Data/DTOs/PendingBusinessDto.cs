public class PendingBusinessDto
{
    public Guid Id { get; set; }

    public string BusinessName { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string LogoUrl { get; set; } = string.Empty;

    public string OwnerName { get; set; } = string.Empty;

    public bool IsCipcRegistered { get; set; }

    public string? CipcNumber { get; set; }
}
