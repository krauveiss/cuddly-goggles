namespace FuryVibes.Application;

public class BanUserUseCase
{
    private readonly IUserRepository _userRepository;

    public BanUserUseCase(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public Task Execute(int userId)
    {
        return Task.CompletedTask;
        
    }
}