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
var allowedOrigins = new[]
{
    // Production Frontend
    "https://orange-island-06039b303.7.azurestaticapps.net",
    "https://hustlerhub.co.za",
    "https://www.hustlerhub.co.za",

    // Azure API
    "https://hustlershub-b4gsheczcebvgbew.southafricanorth-01.azurewebsites.net",

    // Angular Local Development
    "http://localhost:4200",
    "https://localhost:4200",

    // Capacitor Mobile
    "http://localhost",
    "https://localhost"
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
// FILE STORAGE (LOCAL + AZURE)
// =====================================================

// Ensure wwwroot exists
var webRootPath =
    app.Environment.WebRootPath ??
    Path.Combine(
        app.Environment.ContentRootPath,
        "wwwroot"
    );

Directory.CreateDirectory(webRootPath);

// Azure App Service provides HOME.
// Local development falls back to a local uploads folder.
var homePath = Environment.GetEnvironmentVariable("HOME");

string uploadsPath;

if (!string.IsNullOrWhiteSpace(homePath))
{
    // Azure persistent storage
    uploadsPath = Path.Combine(
        homePath,
        "site",
        "uploads"
    );
}
else
{
    // Local development storage
    uploadsPath = Path.Combine(
        app.Environment.ContentRootPath,
        "uploads"
    );
}

Directory.CreateDirectory(uploadsPath);

Console.WriteLine($"Uploads path: {uploadsPath}");

// =====================================================
// PIPELINE
// =====================================================

// Swagger
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// =====================================================
// CORS
// =====================================================
app.UseCors("AllowFrontend");

// =====================================================
// STATIC FILES
// =====================================================

// wwwroot
app.UseStaticFiles();

// uploads folder
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(uploadsPath),
    RequestPath = "/uploads"
});

// =====================================================
// AUTHENTICATION / AUTHORIZATION
// =====================================================
app.UseAuthentication();
app.UseAuthorization();

// =====================================================
// CONTROLLERS
// =====================================================
app.MapControllers();

app.Run();