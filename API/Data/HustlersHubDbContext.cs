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

        public DbSet<Promotion> Promotions { get; set; }      // 🆕 Added
        public DbSet<Comment> Comments { get; set; }          // 🆕 Added

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Booking relationships
            modelBuilder.Entity<Booking>()
                .HasOne(b => b.Customer)
                .WithMany()
                .HasForeignKey(b => b.CustomerId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<Booking>()
                .HasOne(b => b.ServiceProvider)
                .WithMany()
                .HasForeignKey(b => b.ProviderId)
                .OnDelete(DeleteBehavior.NoAction);

            // Review relationships
            modelBuilder.Entity<Review>()
                .HasOne(r => r.User)
                .WithMany()
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<Review>()
                .HasOne(r => r.Business)
                .WithMany(b => b.Reviews)
                .HasForeignKey(r => r.BusinessId)
                .OnDelete(DeleteBehavior.NoAction);

            // Promotion relationships
            modelBuilder.Entity<Promotion>()
                .HasOne(p => p.PostedBy)
                .WithMany()
                .HasForeignKey(p => p.PostedById)
                .OnDelete(DeleteBehavior.NoAction);

            // Comment relationships
            modelBuilder.Entity<Comment>()
                .HasOne(c => c.User)
                .WithMany()
                .HasForeignKey(c => c.UserId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<Comment>()
                .HasOne(c => c.Promotion)
                .WithMany()
                .HasForeignKey(c => c.PromotionId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
