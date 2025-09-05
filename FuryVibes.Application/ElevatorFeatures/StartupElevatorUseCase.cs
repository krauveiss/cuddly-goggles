namespace FuryVibes.Application.ElevatorFeatures;

public class StartupElevatorUseCase
{
    private readonly IElevatorReposiotory _elevatorReposiotory;
    private readonly string[] _statuses = new []{ "pending", "in_progress","delivered", "canceled" };
    public StartupElevatorUseCase(IElevatorReposiotory elevatorReposiotory)
    {
        _elevatorReposiotory = elevatorReposiotory;
    }

    public async Task Execute()
    {
        var elevator = await _elevatorReposiotory.GetElevator();
        elevator.Status = "in_progress";
        await _elevatorReposiotory.SaveElevator(elevator);
    }
}