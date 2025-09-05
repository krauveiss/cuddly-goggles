namespace FuryVibes.Application.Orders;

public class DeleteOrderUseCase
{
    private readonly IOrdersReposiotory _ordersReposiotory;

    public DeleteOrderUseCase(IOrdersReposiotory  ordersReposiotory)
    {
        _ordersReposiotory = ordersReposiotory;
    }

    public async Task Execute(ulong id)
    {
        await _ordersReposiotory.DeleteOrder(id);
    }
}