using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using FuryVibes.Infrastructure;
using Microsoft.IdentityModel.Tokens;

public class AdminVerifyMiddleware
{
    private readonly RequestDelegate _next;
    private readonly UserApiService _userService;
    private readonly string _secretKey = "FgLGlDh1YdiDXJ4i50Co98D45LPIVLorDz4An69XfXU2EzgoGvMrEfQgUdPkanOv";
    public AdminVerifyMiddleware(RequestDelegate next, UserApiService  userService)
    {
        this._next = next;
        _userService = userService;
    }
 
    public async Task InvokeAsync(HttpContext context)
    {
        var authHeader = context.Request.Headers["Authorization"].FirstOrDefault();
        var token = authHeader.Substring("Bearer ".Length).Trim();

        var userIdClaim = ExtractUserIdFromTokenSimple(token);

        if (!await _userService.IsUserAdmin(userIdClaim.Value))
        {
            context.Response.StatusCode = 403;
            await context.Response.WriteAsync("У вас нет прав доступа");
        }
        else
        {
            await _next.Invoke(context);
        }
    }
    private int? ExtractUserIdFromTokenSimple(string token)
    {
        try
        {
            var parts = token.Split('.');
            if (parts.Length < 2) return null;

            var payload = DecodeJwtPart(parts[1]);
            if (string.IsNullOrEmpty(payload)) return null;

            var subMatch = System.Text.RegularExpressions.Regex.Match(
                payload, 
                "\"sub\"\\s*:\\s*\"?([0-9]+)\"?"
            );

            if (subMatch.Success && int.TryParse(subMatch.Groups[1].Value, out var userId))
            {
                return userId;
            }

            var idMatch = System.Text.RegularExpressions.Regex.Match(
                payload,
                "\"(nameid|userId|id)\"\\s*:\\s*\"?([0-9]+)\"?"
            );

            if (idMatch.Success && int.TryParse(idMatch.Groups[2].Value, out var userId2))
            {
                return userId2;
            }

            return null;
        }
        catch
        {
            return null;
        }
    }
    private string DecodeJwtPart(string base64Url)
    {
        try
        {
            var base64 = base64Url
                .Replace('-', '+')
                .Replace('_', '/');

            switch (base64.Length % 4)
            {
                case 2: base64 += "=="; break;
                case 3: base64 += "="; break;
            }

            var bytes = Convert.FromBase64String(base64);
            return Encoding.UTF8.GetString(bytes);
        }
        catch (Exception ex)
        {
            return null;
        }
    }
}