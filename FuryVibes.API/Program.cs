using System.Text;
using FuryVibes.Application;
using FuryVibes.Infrastructure;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.EntityFrameworkCore;


var builder = WebApplication.CreateBuilder(args);
var configuration = builder.Configuration;

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddControllers();
builder.Services.AddDbContext<AppDbContext>(options => 
    options.UseMySql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        new  MySqlServerVersion(new Version(8, 0, 43))));

builder.Services.AddSingleton<UserApiService>();
var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

app.UseAuthentication();
app.UseAuthorization();
//app.UseMiddleware<AdminVerifyMiddleware>();


app.MapControllers();

app.Run();