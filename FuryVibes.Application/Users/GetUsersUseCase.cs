using FuryVibes.Contracts;

namespace FuryVibes.Application.Users;

public class GetUsersUseCase
{
    private readonly IUsersRepository _usersRepository;

    public GetUsersUseCase(IUsersRepository usersRepository)
    {
        _usersRepository = usersRepository;
    }

    public async Task<List<UserDto>> Execute()
    {
        var users = (await _usersRepository.GetUsersAsync()).Select(u=> new UserDto()
        {
            CreatedAt = u.CreatedAt,
            Email = u.Email,
            EmailVerifiedAt = u.EmailVerifiedAt,
            Id = u.Id,
            Name = u.Name,
            Role = u.Role,
            Tg = u.Tg,
            UpdatedAt = u.UpdatedAt
        }).ToList();
        return users;
    }
}