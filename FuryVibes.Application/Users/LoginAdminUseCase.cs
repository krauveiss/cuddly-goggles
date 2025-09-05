using FuryVibes.Application.Users;
using Microsoft.AspNetCore.Identity;
using ScoreHub_Infrastructure;

namespace FuryVibes.Controllers;

public class LoginAdminUseCase
{
    private readonly IAdminRepository _repository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtProvider _jwtProvider;

    public LoginAdminUseCase(IAdminRepository repository, IPasswordHasher passwordHasher, IJwtProvider jwtProvider)
    {
        _repository = repository;
        _passwordHasher = passwordHasher;
        _jwtProvider = jwtProvider;
    }

    public async Task<string> Execute(LoginUserDto loginUserDto)
    {
        var user = await _repository.GetAdminById(loginUserDto.Name);

        if (user == null)
        {
            throw new Exception("User not found");
        }

        if (!_passwordHasher.Verify(user.Password, loginUserDto.Password))
        {
            throw new Exception("Failed to login");
        }

        var token = _jwtProvider.GenerateToken(user);
        return token;
    }
}