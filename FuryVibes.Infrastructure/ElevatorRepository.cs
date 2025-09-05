using FuryVibes.Application;
using FuryVibes.Domain.Models;
using Microsoft.EntityFrameworkCore;

namespace FuryVibes.Infrastructure;



public class ElevatorRepository : IElevatorReposiotory
{
    private readonly LaravelContext _context;

    public ElevatorRepository(LaravelContext context)
    {
        _context = context;
    }
    public async Task SaveElevator(Elevator elevator)
    {
        _context.Elevators.Update(elevator);
        await _context.SaveChangesAsync();
    }

    public async Task<Elevator> GetElevator()
    {
        return await _context.Elevators.FirstAsync();
    }

    public async Task CreateElevator(Elevator elevator)
    {
        await _context.Elevators.AddAsync(elevator);
        await _context.SaveChangesAsync();
    }
}