using FuryVibes.Application;
using FuryVibes.Domain.Models;
using Microsoft.EntityFrameworkCore;

namespace FuryVibes.Infrastructure;

public class UsersRepository : IUsersRepository
{
    private readonly LaravelContext _context;

    public UsersRepository(LaravelContext context)
    {
        _context = context;
    }
    public async Task<User> GetUserAsync(ulong userId)
    {
        return await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
        
    }

    public async Task<List<User>> GetUsersAsync()
    {
        return await _context.Users.ToListAsync();
    }

    public async Task SaveUserAsync(User user)
    {
        _context.Users.Update(user);
        await _context.SaveChangesAsync();
    }
}