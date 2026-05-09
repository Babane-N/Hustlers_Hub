using API.Data;
using API.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// ==========================================
// DATABASE CONFIGURATION
// ==========================================
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<HustlersHubDbContext>(options =>
{
    options.UseSqlServer(connectionString);
});

// ==========================================
// SERVICES
// ==========================================
builder.Services.AddSingleton<JwtService>();
builder.Services.AddScoped<IEmailService, EmailService>();

// ==========================================
// CONTROLLERS + JSON SETTINGS
// ==========================================
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

// ==========================================
// SWAGGER
// ==========================================
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ==========================================
// CORS CONFIGURATION
// ==========================================
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
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// ==========================================
// CREATE WWWROOT + UPLOADS FOLDER
// ==========================================
var webRootPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");

if (!Directory.Exists(webRootPath))
{
    Directory.CreateDirectory(webRootPath);
}

var uploadsPath = Path.Combine(webRootPath, "uploads");

if (!Directory.Exists(uploadsPath))
{
    Directory.CreateDirectory(uploadsPath);
}

// ==========================================
// MIDDLEWARE PIPELINE
// ==========================================

// IMPORTANT: CORS must be early
app.UseCors("AllowFrontend");

// Swagger
app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();

// Static files
app.UseStaticFiles();

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(uploadsPath),
    RequestPath = "/uploads"
});

// Authentication / Authorization
app.UseAuthentication();
app.UseAuthorization();

// Controllers
app.MapControllers();

// OPTIONAL:
// Only use this if Angular build files are inside wwwroot
// Otherwise comment it out
// app.MapFallbackToFile("index.html");

app.Run();