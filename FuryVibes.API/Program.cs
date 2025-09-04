using System.Text;
using FuryVibes.Application;
using FuryVibes.Infrastructure;
using Microsoft.AspNetCore.Diagnostics;


var builder = WebApplication.CreateBuilder(args);
var configuration = builder.Configuration;

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddControllers();
builder.Services.AddSingleton<UserApiService>();
var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

app.UseAuthentication();
app.UseAuthorization();
app.UseMiddleware<AdminVerifyMiddleware>();


app.MapControllers();

app.Run();