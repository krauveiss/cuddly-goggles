using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using FuryVibes.Infrastructure;
using Microsoft.IdentityModel.Tokens;

public class AdminVerifyMiddleware
{
    private readonly RequestDelegate _next;
    private readonly UserApiService _userService;

    public AdminVerifyMiddleware(RequestDelegate next, UserApiService  userService)
    {
        this._next = next;
        _userService = userService;
    }
 
    public async Task InvokeAsync(HttpContext context)
    {
        var authHeader = context.Request.Headers["Authorization"].FirstOrDefault();
        var token = authHeader.Substring("Bearer ".Length).Trim();
        var principal = ValidateToken(token);
        
        if (principal == null)
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            await context.Response.WriteAsync("Неверный токен");
            return;
        }
        
        context.User = principal;
        
        var userIdClaim = principal.FindFirst(ClaimTypes.NameIdentifier) ?? principal.FindFirst("sub");
        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            await context.Response.WriteAsync("User ID not found in token");
            return;
        }

        if (await _userService.IsUserAdmin(userId))
        {
            context.Response.StatusCode = 403;
            await context.Response.WriteAsync("У вас нет прав доступа");
        }
        else
        {
            await _next.Invoke(context);
        }
    }
    private ClaimsPrincipal? ValidateToken(string token)
    {
        try
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes("_secretKey");

            var validationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = false, 
                ValidateAudience = false, 
                ValidateLifetime = false,
                ClockSkew = TimeSpan.Zero
            };

            var principal = tokenHandler.ValidateToken(token, validationParameters, out var validatedToken);
            return principal;
        }
        catch
        {
            return null;
        }
    }
}