using FuryVibes.Application.Users;
using FuryVibes.Domain;
using FuryVibes.Infrastructure;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FuryVibes.Controllers;

[ApiController]
[Route("api/admin")]
public class UsersController : Controller
{
    public UsersController()
    {
    }

    [HttpGet("users/{userId}")]
    public async Task<IActionResult> GetAdminAsync(ulong userId, [FromServices] GetUserUseCase getUserUseCase)
    {
        var user = await getUserUseCase.Execute(userId);
        return Ok(user);
    }
    
    [HttpGet("users")]
    public async Task<IActionResult> GetUsersAsync([FromServices] GetUsersUseCase getUsersUseCase)
    {
        return Ok(await getUsersUseCase.Execute());
    }

    [HttpPut("users/{userId}/role/{newRole}")]
    public async Task<IActionResult> ChangeRoleAsync(ulong userId, string newRole, [FromServices] ChangeUserRoleUseCase changeUserRoleUseCase)
    {
        await changeUserRoleUseCase.Execute(userId, newRole);
        return Ok();
    }
    
    [HttpPost("/register")]
    public async Task<IActionResult> Register(
        RegisterUserDto dto, 
        [FromServices] RegisterAdminUseCase registerAdminUseCase)
    {  
        await registerAdminUseCase.Execute(dto);
        return Ok();
    }

    [HttpPost("/login")]
    public async Task<IActionResult> Login(
        LoginUserDto dto,
        [FromServices] LoginAdminUseCase loginAdminUseCase )
    {
        var token = await loginAdminUseCase.Execute(dto);
        HttpContext.Response.Cookies.Append("token", token);
        return Ok(token);
    }
    
}