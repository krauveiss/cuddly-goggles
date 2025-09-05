using FuryVibes.Domain.Models;

namespace FuryVibes.Application.Users;

public interface IAdminRepository
{
    public Task CreateAdmin(Admin admin);
    public Task<Admin> GetAdminById(string name);
}