using System.Text;
using System.Text.Json;
using FuryVibes.Application;
using FuryVibes.Contracts;
using FuryVibes.Domain;

namespace FuryVibes.Infrastructure;

public class UserApiService 
{
    private readonly HttpClient _client = new HttpClient();
    private readonly string _baseUrl = "http://172.20.179.169:80/php/api/admin/"; 
    private readonly string _headerTelegram = "X-Telegram-Bot-Api-Secret-Token";
    private readonly string _token = "123";
    
    public async Task<UserDto> GetUserAsync(int userId)
    {
        try
        {
            _client.DefaultRequestHeaders.Add(_headerTelegram, _token);
            var response = await _client.GetAsync(_baseUrl + $"user/{userId}");
        
            var json = await response.Content.ReadAsStringAsync();
            var admin = JsonSerializer.Deserialize<UserDto>(json);
        
            return admin;
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            throw;
        }
    }
    
    public async Task<List<UserDto>> GetUsersAsync()
    {
        try
        {
            _client.DefaultRequestHeaders.Add(_headerTelegram, _token);
            _client.DefaultRequestHeaders.Add("Accept","application/json");
            var response = await _client.GetAsync(_baseUrl + $"users");
        
            var json = await response.Content.ReadAsStringAsync();
            var users = JsonSerializer.Deserialize<List<List<UserDto>>>(json);
        
            return users[0];
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            throw;
        }
    }
    
    public async Task BanUserAsync(int userId)
    {
        try
        {
            _client.DefaultRequestHeaders.Add(_headerTelegram, _token);
            _client.DefaultRequestHeaders.Add("Accept","application/json");
            var json = JsonSerializer.Serialize(userId);
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            
            var response = await _client.PutAsync(_baseUrl + $"ban", content );
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            throw;
        }
    }

    public async Task<bool> IsUserAdmin(int userId)
    {
        try
        {
            _client.DefaultRequestHeaders.Add(_headerTelegram, _token);
            _client.DefaultRequestHeaders.Add("Accept","application/json");
            var json = JsonSerializer.Serialize(userId);
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            
            var response = await _client.PutAsync(_baseUrl + $"is-admin", content );
            return response.IsSuccessStatusCode;
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            throw;
        }
    }
}