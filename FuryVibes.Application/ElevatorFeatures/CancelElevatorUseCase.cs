namespace FuryVibes.Application.ElevatorFeatures;

public class CancelElevatorUseCase
{
    private readonly IElevatorReposiotory _elevatorReposiotory;
    public CancelElevatorUseCase(IElevatorReposiotory elevatorReposiotory)
    {
        _elevatorReposiotory = elevatorReposiotory;
    }

    public async Task Execute()
    {
        var elevator = await _elevatorReposiotory.GetElevator();
        elevator.Status = "canceled";
        await _elevatorReposiotory.SaveElevator(elevator);
    }
}