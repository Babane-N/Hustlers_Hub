using API.Data;
using API.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// =====================================================
// DATABASE
// =====================================================
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<HustlersHubDbContext>(options =>
{
    options.UseSqlServer(connectionString);
});

// =====================================================
// SERVICES
// =====================================================
builder.Services.AddSingleton<JwtService>();
builder.Services.AddScoped<IEmailService, EmailService>();

// =====================================================
// CONTROLLERS
// =====================================================
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

// =====================================================
// SWAGGER
// =====================================================
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// =====================================================
// CORS
// =====================================================
var allowedOrigins = new[]
{
    "https://agreeable-grass-0e90e7a03.7.azurestaticapps.net",
    "https://hustlershub.tech",
    "https://www.hustlershub.tech",
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

// =====================================================
// SAFE WWWROOT + UPLOADS (AZURE FIX)
// =====================================================
var webRootPath = app.Environment.WebRootPath
                  ?? Path.Combine(app.Environment.ContentRootPath, "wwwroot");

var uploadsPath = Path.Combine(webRootPath, "uploads");

// Ensure folders exist
Directory.CreateDirectory(webRootPath);
Directory.CreateDirectory(uploadsPath);

// =====================================================
// PIPELINE ORDER (IMPORTANT)
// =====================================================

// Swagger (dev only recommended, but kept as-is)
app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();

// IMPORTANT: CORS early
app.UseCors("AllowFrontend");

// =====================================================
// STATIC FILES (FIX FOR LOGOS)
// =====================================================
app.UseStaticFiles(); // serves wwwroot

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(uploadsPath),
    RequestPath = "/uploads"
});

// =====================================================
// AUTH
// =====================================================
app.UseAuthentication();
app.UseAuthorization();

// =====================================================
// CONTROLLERS
// =====================================================
app.MapControllers();

app.Run();