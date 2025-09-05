using FuryVibes.Contracts;

namespace FuryVibes.Application.Users;

public class GetUserUseCase
{
    private readonly IUsersRepository _usersRepository;

    public GetUserUseCase(IUsersRepository usersRepository)
    {
        _usersRepository = usersRepository;
    }

    public async Task<UserDto> Execute(ulong id)
    {
        var user = await _usersRepository.GetUserAsync(id);
        return new UserDto()
        {
            Name = user.Name,
            CreatedAt = user.CreatedAt,
            Email = user.Email,
            EmailVerifiedAt = user.EmailVerifiedAt,
            Id = user.Id,
            Role = user.Role,
            Tg = user.Tg,
            UpdatedAt = user.UpdatedAt
        };
        
    }
}