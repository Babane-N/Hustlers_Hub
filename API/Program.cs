using API.Data;
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

app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");

// Serve static and uploaded files
app.UseStaticFiles();

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

// ✅ SPA fallback (for Angular/React routing)
app.MapFallbackToFile("index.html");

app.Run();
