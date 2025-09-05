using FuryVibes.Application.Users;
using FuryVibes.Domain.Models;
using Microsoft.EntityFrameworkCore;

namespace FuryVibes.Infrastructure;

public class AdminRepository : IAdminRepository
{
    private readonly LaravelContext _context;

    public AdminRepository(LaravelContext context)
    {
        _context = context;
    }
    public async Task CreateAdmin(Admin admin)
    {
        await _context.Admins.AddAsync(admin);
        await _context.SaveChangesAsync();
    }

    public Task<Admin> GetAdminById(string name)
    {
        return _context.Admins.FirstOrDefaultAsync(a => a.Login == name);
    }
}