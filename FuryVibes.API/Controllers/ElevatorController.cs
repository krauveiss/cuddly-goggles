using FuryVibes.Application.ElevatorFeatures;
using FuryVibes.Contracts;
using FuryVibes.Domain.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FuryVibes.Controllers;

[ApiController]
[Route("api/admin")]
public class ElevatorController : Controller
{
    [HttpGet("elevator")]
    public async Task<IActionResult> GetElevator([FromServices] GetElevatorUseCase  useCase )
    {
        return Ok(await useCase.Execute());
    }
    [HttpPut("elevator/start")]
    public async Task<IActionResult> StartElevator([FromServices] StartupElevatorUseCase  useCase)
    {
        await useCase.Execute();
        return Ok();
    }
    [HttpPut("elevator/cancel")]
    public async Task<IActionResult> CancelElevator([FromServices] CancelElevatorUseCase  useCase)
    {
        await useCase.Execute();
        return Ok();
    }
    [HttpPost("elevator")]
    public async Task<IActionResult> CreateElevator(CreateElevatorDto dto,
        [FromServices] CreateElevatorUseCase  useCase)
    {
        await useCase.Execute(dto);
        return Ok();
    }
}