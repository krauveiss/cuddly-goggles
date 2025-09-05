using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using FuryVibes.Domain.Models;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace ScoreHub_Infrastructure;

public class JwtProvider : IJwtProvider
{
    private readonly int _tgTokenLifeTime = 10;
    public string GenerateToken(Admin user)
    {
        Claim[] claims =
        [
            new("userId", user.Id.ToString()),
            new("login", user.Login)
        ];
        
        var signingCredentials = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes("FgLGlDh1YdiDXJ4i50Co98D45LPIVLorDz4An69XfXU2EzgoGvMrEfQgUdPkanOv")),
            SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            claims: claims,
            signingCredentials: signingCredentials,
            expires: DateTime.Now.AddHours(3600));
        
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}