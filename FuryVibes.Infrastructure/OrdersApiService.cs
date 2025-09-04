using System.Text.Json;
using FuryVibes.Contracts;
using FuryVibes.Domain;

namespace FuryVibes.Infrastructure;

public class OrdersApiService
{
    private readonly HttpClient _client = new HttpClient();
    private readonly string _baseUrl = "http://172.20.179.169:80/php/api/admin/"; 
    private readonly string _headerTelegram = "X-Telegram-Bot-Api-Secret-Token";
    private readonly string _token = "123";
    
    public async Task<OrderDto> GetOrderAsync(int orderId)
    {
        try
        {
            _client.DefaultRequestHeaders.Add(_headerTelegram, _token);
            var response = await _client.GetAsync(_baseUrl + $"order/{orderId}");
        
            var json = await response.Content.ReadAsStringAsync();
            var order = JsonSerializer.Deserialize<OrderDto>(json);
        
            return order;
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            throw;
        }
    }
    
    public async Task<List<OrderDto>> GetOrdersAsync(int orderId)
    {
        try
        {
            _client.DefaultRequestHeaders.Add(_headerTelegram, _token);
            var response = await _client.GetAsync(_baseUrl + $"orders");
        
            var json = await response.Content.ReadAsStringAsync();
            var orders = JsonSerializer.Deserialize<List<OrderDto>>(json);
        
            return orders;
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            throw;
        }
    }
    
    public async Task CancelOrderAsync(int orderId)
    {
        try
        {
            _client.DefaultRequestHeaders.Add(_headerTelegram, _token);
            var response = await _client.GetAsync(_baseUrl + $"order/{orderId}/cancel");
        
            var json = await response.Content.ReadAsStringAsync();
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            throw;
        }
    }
}