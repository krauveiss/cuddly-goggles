using System.Text;
using FuryVibes;
using FuryVibes.Application;
using FuryVibes.Application.ElevatorFeatures;
using FuryVibes.Application.Orders;
using FuryVibes.Application.Users;
using FuryVibes.Controllers;
using FuryVibes.Infrastructure;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using ScoreHub_Infrastructure;


var builder = WebApplication.CreateBuilder(args);
var configuration = builder.Configuration;


/*builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(JwtBearerDefaults.AuthenticationScheme, options =>
    {
        options.TokenValidationParameters = new()
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey =
                new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes("FgLGlDh1YdiDXJ4i50Co98D45LPIVLorDz4An69XfXU2EzgoGvMrEfQgUdPkanOv"))
        }; });

builder.Services.AddAuthorization();*/

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});
builder.Services.AddSwaggerGen();
builder.Services.AddControllers();
builder.Services.AddDbContext<LaravelContext>(options => 
    options.UseMySql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        new  MySqlServerVersion(new Version(8, 0, 43))));
builder.Services.AddScoped<GetOrderUseCase>();
builder.Services.AddScoped<ChangeOrderStatus>();
builder.Services.AddScoped<DeleteOrderUseCase>();
builder.Services.AddScoped<GetOrdersUseCase>();
builder.Services.AddScoped<CancelElevatorUseCase>();
builder.Services.AddScoped<GetElevatorUseCase>();
builder.Services.AddScoped<StartupElevatorUseCase>();
builder.Services.AddScoped<ChangeUserRoleUseCase>();
builder.Services.AddScoped<RegisterAdminUseCase>();
builder.Services.AddScoped<LoginAdminUseCase>();
builder.Services.AddScoped<GetUserUseCase>();
builder.Services.AddScoped<GetUsersUseCase>();
builder.Services.AddScoped<CreateElevatorUseCase>();
builder.Services.AddScoped<IOrdersReposiotory, OrdersRepository>();
builder.Services.AddScoped<IAdminRepository, AdminRepository>();
builder.Services.AddScoped<IElevatorReposiotory, ElevatorRepository>();
builder.Services.AddScoped<IUsersRepository, UsersRepository>();
builder.Services.AddScoped<IPasswordHasher, PasswordHasher>();
builder.Services.AddScoped<IJwtProvider, JwtProvider>();

var app = builder.Build();

app.UseCors("AllowAll");
app.UseSwagger();
app.UseSwaggerUI();

app.UseMiddleware<ErrorHandlingMiddleware>();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();