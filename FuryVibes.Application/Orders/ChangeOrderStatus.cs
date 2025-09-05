namespace FuryVibes.Application.Orders;

public class ChangeOrderStatus
{
    private readonly IOrdersReposiotory _ordersReposiotory;
    private readonly string[] _statuses = new []{"cancelled", "pending", "in_progress", "delivered"};
    public ChangeOrderStatus(IOrdersReposiotory ordersReposiotory)
    {
        _ordersReposiotory = ordersReposiotory;
    }

    public async Task Execute(string newStatus, ulong id)
    {
        if(!_statuses.Contains(newStatus.ToLower().Trim()))
            throw new InvalidOperationException("Invalid order status");
        var order = await _ordersReposiotory.GetOrder(id);
        order.Status = newStatus.ToLower().Trim();
        await _ordersReposiotory.SaveOrder(order);
    }
}