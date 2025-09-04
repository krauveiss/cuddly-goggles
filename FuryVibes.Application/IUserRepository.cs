using FuryVibes.Contracts;
using FuryVibes.Domain;

namespace FuryVibes.Application;

public interface IUserRepository
{
    
    public Task<User> GetUserAsync(int userId);
    public Task<List<UserDto>> GetUsersAsync();
}