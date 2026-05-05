using API.Data;
using API.Services;
using Google;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// ---------------------------
// ✅ Database Configuration (Azure SQL with SQL Authentication)
// ---------------------------

// Load connection string from appsettings.json
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// Configure EF Core (no access tokens or Azure credentials)
builder.Services.AddDbContext<HustlersHubDbContext>(options =>
{
    options.UseSqlServer(connectionString);
});


// ---------------------------
// ✅ Controllers with JSON enum as string
// ---------------------------
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

// ---------------------------
// ✅ Swagger (enabled in all environments)
// ---------------------------
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSingleton<JwtService>();
builder.Services.AddScoped<IEmailService, EmailService>();


// ---------------------------
// ✅ CORS Configuration
// ---------------------------
var allowedOrigins = new[]
{
    "https://agreeable-grass-0e90e7a03.7.azurestaticapps.net",
    "https://hustlerhub-cea4bhbjdrgfdefb.southafricanorth-01.azurewebsites.net",
    "https://localhost:4200",
    "http://localhost:4200"
};

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials());
});

var app = builder.Build();

// ---------------------------
// ✅ Middleware Pipeline
// ---------------------------

app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");

// Serve static and uploaded files
app.UseStaticFiles();

var uploadsPath = Path.Combine(builder.Environment.WebRootPath, "uploads");

if (!Directory.Exists(uploadsPath))
{
    Directory.CreateDirectory(uploadsPath);
}



app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// ✅ SPA fallback (for Angular/React routing)
app.MapFallbackToFile("index.html");

app.Run();
