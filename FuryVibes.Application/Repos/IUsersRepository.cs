using FuryVibes.Domain.Models;

namespace FuryVibes.Application;

public interface IUsersRepository
{
    public Task<User> GetUserAsync(ulong userId);
    public Task<List<User>> GetUsersAsync();
    
    public Task SaveUserAsync(User user);
    
    
}