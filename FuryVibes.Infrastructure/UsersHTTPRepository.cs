using System.Text.Json;
using FuryVibes.Application;
using FuryVibes.Domain;

namespace FuryVibes.Infrastructure;

public class UsersHTTPRepository : IUserRepository
{
    private readonly HttpClient _client = new HttpClient();
    private readonly string _baseUrl = "http://172.20.179.205:80/php/api/";
    
    public async Task<Admin> GetAdminAsync(int userId)
    {
        try
        {
            var response = await _client.GetAsync(_baseUrl + "user");
        
            response.EnsureSuccessStatusCode();
        
            var json = await response.Content.ReadAsStringAsync();
            var admin = JsonSerializer.Deserialize<Admin>(json);
        
            return admin;
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            throw;
        }
        
    }
}