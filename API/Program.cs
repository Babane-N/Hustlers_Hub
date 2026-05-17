using API.Data;
using API.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// =====================================================
// DATABASE
// =====================================================
var connectionString =
    builder.Configuration.GetConnectionString("DefaultConnection");

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
        options.JsonSerializerOptions.Converters
            .Add(new JsonStringEnumConverter());
    });

// =====================================================
// SWAGGER
// =====================================================
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// =====================================================
// CORS
// =====================================================

// Web + Angular + Capacitor Mobile Origins
var allowedOrigins = new[]
{
    // Production Web
    "https://agreeable-grass-0e90e7a03.7.azurestaticapps.net",
    "https://hustlershub.tech",
    "https://www.hustlershub.tech",

    // Azure API
    "https://hustlerhub-cea4bhbjdrgfdefb.southafricanorth-01.azurewebsites.net",

    // Angular Local Development
    "http://localhost:4200",
    "https://localhost:4200",

    // Capacitor Android/iOS WebView
    "https://localhost",
    "http://localhost"
};

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy
            .WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

var app = builder.Build();

// =====================================================
// AZURE PERSISTENT UPLOADS STORAGE
// =====================================================

// Ensure wwwroot exists
var webRootPath =
    app.Environment.WebRootPath
    ?? Path.Combine(
        app.Environment.ContentRootPath,
        "wwwroot"
    );

Directory.CreateDirectory(webRootPath);

// Persistent uploads path (survives deployments)
var uploadsPath = Path.Combine(
    Environment.GetEnvironmentVariable("HOME")
        ?? "D:\\home",
    "site",
    "uploads"
);

// Ensure uploads folder exists
Directory.CreateDirectory(uploadsPath);

// =====================================================
// PIPELINE ORDER
// =====================================================

// Swagger
app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();

// =====================================================
// CORS
// =====================================================
app.UseCors("AllowFrontend");

// =====================================================
// STATIC FILES
// =====================================================

// Serve normal wwwroot files
app.UseStaticFiles();

// Serve persistent uploads folder
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
        uploadsPath
    ),
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