using FuryVibes.Application;
using FuryVibes.Domain.Models;
using Microsoft.EntityFrameworkCore;

namespace FuryVibes.Infrastructure;

public class OrdersRepository : IOrdersReposiotory
{
    private readonly LaravelContext _context;

    public OrdersRepository(LaravelContext context)
    {
        _context = context;
    }
    public async Task<Order> GetOrder(ulong id)
    {
        return await _context.Orders.Include(o=> o.Cargos).FirstOrDefaultAsync(o => o.Id == id);
    }

    public async Task<List<Order>> GetOrders()
    {
        return await _context.Orders.Include(o=> o.Cargos).ToListAsync();
    }

    public async Task SaveOrder(Order order)
    { 
        _context.Orders.Update(order);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteOrder(ulong id)
    {
        var order = _context.Orders.FirstOrDefault(o => o.Id == id);
        _context.Orders.Remove(order);
        await _context.SaveChangesAsync();
    }
}