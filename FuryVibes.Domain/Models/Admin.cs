namespace FuryVibes.Domain.Models;

public partial class Admin
{
    public ulong Id { get; set; }

    public string Login { get; set; } = null!;

    public string Password { get; set; } = null!;

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}
