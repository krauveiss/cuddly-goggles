using FuryVibes.Application;
using Microsoft.AspNetCore.Mvc;

namespace FuryVibes.Controllers;

[ApiController]
public class UsersController : Controller
{
    private readonly IUserRepository _userRepository;

    public UsersController(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    [HttpGet("admin/{userId}")]
    public async Task<IActionResult> GetAdminAsync(int userId)
    {
        var context = HttpContext;
        return Ok(await _userRepository.GetUsersAsync()); 
    }
}