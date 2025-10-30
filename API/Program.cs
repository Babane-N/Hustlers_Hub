using API.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// ---------------------------
// ✅ Database Configuration
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
// ✅ Swagger (enabled in all environments)
// ---------------------------
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ---------------------------
// ✅ CORS Configuration
// ---------------------------
var allowedOrigins = new[]
{
    "https://purple-water-01a0ea703.3.azurestaticapps.net",
    "https://hustlershub-g3cjffaea3axckg3.southafricanorth-01.azurewebsites.net",
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

// Swagger always enabled
app.UseSwagger();
app.UseSwaggerUI();

// Enforce HTTPS
app.UseHttpsRedirection();

// Apply CORS before routing
app.UseCors("AllowFrontend");

// Serve static files from wwwroot
app.UseStaticFiles();

// Serve uploaded files from /uploads
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

// Authorization (if needed)
app.UseAuthorization();

// Map API controllers
app.MapControllers();

// ✅ SPA fallback (for Angular/React routing)
app.MapFallbackToFile("index.html");

app.Run();
