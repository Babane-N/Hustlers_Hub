using API.Data;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// ✅ Configure Entity Framework and SQL Server connection
builder.Services.AddDbContext<HustlersHubDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// ✅ Add Controllers with enum as string conversion
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

// ✅ Enable Swagger for API documentation
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ✅ Configure CORS — allow both production & local origins
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
        policy.WithOrigins(
            // ✅ Production Frontend (Azure Static Web App)
            "https://purple-water-01a0ea703.3.azurestaticapps.net",

            // ✅ (Optional) Staging or alternative Azure URL
            "https://hustlershub-g3cjffaea3axckg3.southafricanorth-01.azurewebsites.net",

            // ✅ Local Angular app
            "https://localhost:4200",
            "http://localhost:4200"
        )
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials() // only if you use cookies or authorization headers
    );
});

var app = builder.Build();

// ✅ Middleware setup
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// ✅ Serve static files (e.g., uploaded images)
app.UseStaticFiles();

// ✅ Apply CORS globally
app.UseCors("AllowFrontend");

app.UseAuthorization();

app.MapControllers();

app.Run();
