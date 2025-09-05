using FuryVibes.Contracts;

namespace FuryVibes.Application.Orders;

public class GetOrderUseCase
{
    private readonly IOrdersReposiotory _ordersReposiotory;

    public GetOrderUseCase(IOrdersReposiotory ordersReposiotory)
    {
        _ordersReposiotory = ordersReposiotory;
    }

    public async Task<OrderDto> Execute(ulong orderId)
    {
        var order =  await _ordersReposiotory.GetOrder(orderId);
        if (order == null)
        {
            throw new NullReferenceException("Order not found");
        }

        var cargosDto = order.Cargos.Select(c => new CargoDto()
        {
            Id = c.Id,
            OrderId = c.OrderId,
            CreatedAt = c.CreatedAt,
            Size = c.Size,
            Type = c.Type,
            Title = c.Title,
            UpdatedAt = c.UpdatedAt,
            Weight = c.Weight,
        }).ToList();

        var orderDto = new OrderDto()
        {
            Id = order.Id,
            CreatedAt = order.CreatedAt,
            Cargos = cargosDto,
            Date = order.Date,
            TypeDelivery = order.TypeDelivery,
            Place = order.Place,
            Price = order.Price,
            Status = order.Status,
            UpdatedAt = order.UpdatedAt,
            UserId = order.UserId,
        };
        
        return orderDto;

    }
}