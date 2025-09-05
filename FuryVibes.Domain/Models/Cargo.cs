namespace FuryVibes.Domain.Models;

public partial class Cargo
{
    public ulong Id { get; set; }

    public ulong OrderId { get; set; }

    public string Title { get; set; } = null!;

    public decimal Weight { get; set; }

    public string Size { get; set; } = null!;

    public string Type { get; set; } = null!;

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual Order Order { get; set; } = null!;
}
