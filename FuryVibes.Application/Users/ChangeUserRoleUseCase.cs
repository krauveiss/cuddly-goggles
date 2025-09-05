namespace FuryVibes.Application.Users;

public class ChangeUserRoleUseCase
{
    private readonly IUsersRepository _usersRepository;
    private readonly string[] _roles = new string[] { "worker", "user" };

    public ChangeUserRoleUseCase(IUsersRepository usersRepository)
    {
        _usersRepository = usersRepository;
    }
    
    public async Task Execute(ulong id, string newRole)
    {
        if (!_roles.Contains(newRole))
            throw new InvalidOperationException("Invalid role");
        var user = await _usersRepository.GetUserAsync(id);
        user.Role = newRole;
        await _usersRepository.SaveUserAsync(user);
    }
}