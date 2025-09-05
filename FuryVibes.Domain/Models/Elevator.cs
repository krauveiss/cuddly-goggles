namespace FuryVibes.Domain.Models;

public partial class Elevator
{
    public ulong Id { get; set; }

    public long Workload { get; set; }

    public string Status { get; set; } = null!;

    public decimal Speed { get; set; }

    public decimal RemainDistance { get; set; }
}
