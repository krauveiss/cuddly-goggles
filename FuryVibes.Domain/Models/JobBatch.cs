namespace FuryVibes.Domain.Models;

public partial class JobBatch
{
    public string Id { get; set; } = null!;

    public string Name { get; set; } = null!;

    public int TotalJobs { get; set; }

    public int PendingJobs { get; set; }

    public int FailedJobs { get; set; }

    public string FailedJobIds { get; set; } = null!;

    public string? Options { get; set; }

    public int? CancelledAt { get; set; }

    public int CreatedAt { get; set; }

    public int? FinishedAt { get; set; }
}
