using API.Data.Models;
using Microsoft.EntityFrameworkCore;

namespace API.Data
{
    public class HustlersHubDbContext : DbContext
    {
        public HustlersHubDbContext(DbContextOptions<HustlersHubDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Business> Businesses { get; set; }
        public DbSet<Review> Reviews { get; set; }
        public DbSet<BusinessImage> BusinessImages { get; set; }
        public DbSet<Booking> Bookings { get; set; }
        public DbSet<Promotion> Promotions { get; set; }
        public DbSet<Comment> Comments { get; set; }
        public DbSet<PromotionImage> PromotionImages { get; set; }
        public DbSet<PasswordResetToken> PasswordResetTokens { get; set; }



        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Decimal precision for Price and similar properties
            modelBuilder.Entity<Business>()
                .Property(s => s.Price)
                .HasColumnType("decimal(18,2)");

            // Booking relationships
            modelBuilder.Entity<Booking>()
                .HasOne(b => b.Customer)
                .WithMany()
                .HasForeignKey(b => b.CustomerId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<Booking>()
                .HasOne(b => b.Business)
                .WithMany()
                .HasForeignKey(b => b.BusinessId)
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
                .IsRequired(false)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
