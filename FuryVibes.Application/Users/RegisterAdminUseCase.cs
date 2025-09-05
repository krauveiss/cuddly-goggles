using FuryVibes.Controllers;
using FuryVibes.Domain.Models;
using ScoreHub_Infrastructure;

namespace FuryVibes.Application.Users;

public class RegisterAdminUseCase
{
    private readonly IAdminRepository _repository;
    private readonly IPasswordHasher _passwordHasher;

    public RegisterAdminUseCase(IAdminRepository repository, IPasswordHasher passwordHasher)
    {
        _repository = repository;
        _passwordHasher = passwordHasher;
    }
    public async Task Execute(RegisterUserDto dto)
    {
        var hashedPassword = _passwordHasher.Generate(dto.Password);

        var admin = new Admin()
        {
            CreatedAt = DateTime.Now,
            Login = dto.Name,
            Password = hashedPassword,
        };
        
        await _repository.CreateAdmin(admin);
    }
}