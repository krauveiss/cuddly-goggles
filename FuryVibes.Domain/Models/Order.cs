namespace FuryVibes.Domain.Models;

public partial class Order
{
    public ulong Id { get; set; }

    public ulong UserId { get; set; }

    public string Status { get; set; } = null!;

    public string Place { get; set; } = null!;

    public string Date { get; set; } = null!;

    public string TypeDelivery { get; set; } = null!;

    public double Price { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual ICollection<Cargo> Cargos { get; set; } = new List<Cargo>();
}
