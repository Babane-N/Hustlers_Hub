using API.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// ---------------------------
// ✅ Database
// ---------------------------
builder.Services.AddDbContext<HustlersHubDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// ---------------------------
// ✅ Controllers with JSON enum as string
// ---------------------------
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

// ---------------------------
// ✅ Swagger for development/testing
// ---------------------------
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ---------------------------
// ✅ CORS Configuration
// ---------------------------

var allowedOrigins = new[]
{
    "https://purple-water-01a0ea703.3.azurestaticapps.net", // Frontend (Azure Static Web App)
    "https://hustlershub-g3cjffaea3axckg3.southafricanorth-01.azurewebsites.net", // Backend App (optional)
    "https://localhost:4200",
    "http://localhost:4200"
};

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials()); // ✅ optional if using authentication cookies or tokens
});

var app = builder.Build();

// ---------------------------
// ✅ Middleware
// ---------------------------

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Enforce HTTPS
app.UseHttpsRedirection();

// ✅ Apply CORS before authorization
app.UseCors("AllowFrontend");

// Serve static files (wwwroot)
app.UseStaticFiles();

// Serve uploaded images from /Uploads
var uploadsPath = Path.Combine(builder.Environment.ContentRootPath, "Uploads");
if (!Directory.Exists(uploadsPath))
{
    Directory.CreateDirectory(uploadsPath);
}

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(uploadsPath),
    RequestPath = "/uploads"
});

app.UseAuthorization();

app.MapControllers();

app.Run();
