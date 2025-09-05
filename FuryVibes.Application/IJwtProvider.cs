using FuryVibes.Domain.Models;

namespace ScoreHub_Infrastructure;

public interface IJwtProvider
{
    public string GenerateToken(Admin user);

}