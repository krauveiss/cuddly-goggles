using FuryVibes.Domain.Models;

namespace FuryVibes.Application;

public interface IElevatorReposiotory
{
    public Task SaveElevator(Elevator elevator);
    public Task<Elevator> GetElevator();
    
    public Task CreateElevator(Elevator elevator);
    
}