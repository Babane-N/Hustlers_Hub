using API.Data.Models;
using Microsoft.EntityFrameworkCore;

namespace API.Data
{
    public class HustlersHubDbContext : DbContext
    {
        public HustlersHubDbContext(DbContextOptions<HustlersHubDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Business> Businesses { get; set; }
        public DbSet<Service> Services { get; set; }
        public DbSet<Review> Reviews { get; set; }
        public DbSet<Booking> Bookings { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Booking relationships
            modelBuilder.Entity<Booking>()
                .HasOne(b => b.Customer)
                .WithMany()
                .HasForeignKey(b => b.CustomerId)
                .OnDelete(DeleteBehavior.NoAction); // <- Critical change here

            modelBuilder.Entity<Booking>()
                .HasOne(b => b.ServiceProvider)
                .WithMany()
                .HasForeignKey(b => b.ProviderId)
                .OnDelete(DeleteBehavior.NoAction); // <- Critical change here

            // Review relationships
            modelBuilder.Entity<Review>()
                .HasOne(r => r.User)
                .WithMany()
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.NoAction); // <- Optional but safe

            modelBuilder.Entity<Review>()
                .HasOne(r => r.Business)
                .WithMany(b => b.Reviews)
                .HasForeignKey(r => r.BusinessId)
                .OnDelete(DeleteBehavior.NoAction); // <- Optional but safe
        }

    }
}

