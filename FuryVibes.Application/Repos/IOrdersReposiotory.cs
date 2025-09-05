using FuryVibes.Domain.Models;

namespace FuryVibes.Application;

public interface IOrdersReposiotory
{
    public Task<Order> GetOrder(ulong id);
    public Task<List<Order>> GetOrders();
    public Task SaveOrder(Order order);
    public Task DeleteOrder(ulong id);
    
    
}