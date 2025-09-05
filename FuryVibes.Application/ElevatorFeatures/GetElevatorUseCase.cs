using FuryVibes.Domain.Models;

namespace FuryVibes.Application.ElevatorFeatures;

public class GetElevatorUseCase
{
    private readonly IElevatorReposiotory _elevatorReposiotory;

    public GetElevatorUseCase(IElevatorReposiotory elevatorReposiotory)
    {
        _elevatorReposiotory = elevatorReposiotory;
    }

    public async Task<Elevator> Execute()
    {
        var elevator = await _elevatorReposiotory.GetElevator();
        return elevator;
    }
}