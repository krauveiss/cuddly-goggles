using FuryVibes.Domain;

namespace FuryVibes.Application;

public interface IUserRepository
{
    public Task<Admin> GetAdminAsync(int userId);
}