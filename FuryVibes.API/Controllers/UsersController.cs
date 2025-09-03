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
        return Ok(await _userRepository.GetAdminAsync(userId)); // ТЕСТОВО
    }
}