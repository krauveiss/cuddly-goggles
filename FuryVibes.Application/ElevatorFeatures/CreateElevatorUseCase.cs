using FuryVibes.Contracts;
using FuryVibes.Domain.Models;

namespace FuryVibes.Application.ElevatorFeatures;

public class CreateElevatorUseCase
{
    private readonly IElevatorReposiotory _reposiotory;

    public CreateElevatorUseCase(IElevatorReposiotory reposiotory)
    {
        _reposiotory = reposiotory;
    }

    public async Task Execute(CreateElevatorDto dto)
    {
        var elevator = new Elevator()
        {
            Workload = dto.Workload,
            Status = "pending",
            RemainDistance = 500
        };
       await  _reposiotory.CreateElevator(elevator);
    }
}