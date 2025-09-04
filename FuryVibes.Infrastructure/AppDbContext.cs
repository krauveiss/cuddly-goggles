using FuryVibes.Contracts;
using FuryVibes.Domain;
using Microsoft.EntityFrameworkCore;

namespace FuryVibes.Infrastructure;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
    }
}