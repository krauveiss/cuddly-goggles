using FuryVibes.Application;
using FuryVibes.Domain;
using FuryVibes.Infrastructure;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FuryVibes.Controllers;

[ApiController]
public class UsersController : Controller
{
    private readonly UserApiService _userService;
    private readonly AppDbContext _dbContext;

    public UsersController(UserApiService userService, AppDbContext dbContext)
    {
        _userService = userService;
        _dbContext = dbContext;
    }

    [HttpGet("admin/{userId}")]
    public async Task<IActionResult> GetAdminAsync(int userId)
    {
        return Ok();
    }
    
    [HttpGet("test")]
    public async Task<IActionResult> TestConnection()
    {
        try
        {
            // Проверяем что можем подключиться
            var canConnect = await _dbContext.Database.CanConnectAsync();

            // Проверяем что таблица существует и доступна
            if (_dbContext != null)
            {
                //var userCount = await _dbContext.Users.CountAsync();

                return Ok();
            }
        }
        catch (Exception ex)
        {
            return BadRequest();
        }
        return BadRequest();

    }
}