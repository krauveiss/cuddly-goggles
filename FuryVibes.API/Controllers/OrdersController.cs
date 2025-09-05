using FuryVibes.Application.Orders;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FuryVibes.Controllers;

[ApiController]
[Route("api/admin")]
public class OrdersController : Controller
{
    public OrdersController()
    {
        
    }

    [HttpGet("orders/{orderId}")]
    public async Task<IActionResult> GetOrder(ulong orderId, [FromServices] GetOrderUseCase  getOrderUseCase)
    {
        var order = await getOrderUseCase.Execute(1);
        return Ok(order);
    }
    
    [HttpGet("orders")]
    public async Task<IActionResult> GetOrders([FromServices] GetOrdersUseCase  getOrdersUseCase)
    {
        var orders = await getOrdersUseCase.Execute();
        return Ok(orders);
    }

    [HttpPut("order/{orderId}/status/{status}")]
    public async Task<IActionResult> ChangeStatus(ulong orderId, string status, [FromServices] ChangeOrderStatus changeStatus)
    {
        await changeStatus.Execute(status, orderId);
        return Ok();
    }
    
    [HttpDelete("orders/{orderId}")]
    public async Task<IActionResult> DeleteOrder(ulong orderId, [FromServices] DeleteOrderUseCase  getOrderUseCase)
    {
        await getOrderUseCase.Execute(orderId);
        return Ok();
    }
}