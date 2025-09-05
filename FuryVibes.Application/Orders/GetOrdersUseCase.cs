using FuryVibes.Contracts;

namespace FuryVibes.Application.Orders;

public class GetOrdersUseCase
{
    private readonly IOrdersReposiotory _ordersReposiotory;

    public GetOrdersUseCase(IOrdersReposiotory ordersReposiotory)
    {
        _ordersReposiotory = ordersReposiotory;
    }

    public async Task<List<OrderDto>> Execute()
    {
        var orders =  await _ordersReposiotory.GetOrders();
        if (orders == null)
        {
            throw new NullReferenceException("No orders found");
        }
        
        var orderDtos = new List<OrderDto>();
        
        foreach (var order in orders)
        {
            
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
            orderDtos.Add(orderDto);
        }
        return orderDtos;
    }
}