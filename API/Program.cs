using API.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();

// Configure Entity Framework and SQL Server connection
builder.Services.AddDbContext<HustlersHubDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Configure Swagger for API documentation
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Enable CORS for development (allow Angular frontend to access API)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy => policy
            .WithOrigins("http://localhost:4200", "https://localhost:4200")
            .AllowAnyHeader()
            .AllowAnyMethod());
});


var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Use HTTPS redirection
app.UseHttpsRedirection();

// Use CORS policy for frontend communication
app.UseCors("AllowAll");

// Authorization middleware
app.UseAuthorization();

// Map controller routes
app.MapControllers();

// Run the application
app.Run();
