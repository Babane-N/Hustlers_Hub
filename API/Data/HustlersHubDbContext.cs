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
        public DbSet<Conversation> Conversations { get; set; }
        public DbSet<Message> Messages { get; set; }



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

            // Conversation -> Customer
            modelBuilder.Entity<Conversation>()
                .HasOne(c => c.Customer)
                .WithMany()
                .HasForeignKey(c => c.CustomerId)
                .OnDelete(DeleteBehavior.NoAction);

            // Conversation -> Business
            modelBuilder.Entity<Conversation>()
                .HasOne(c => c.Business)
                .WithMany()
                .HasForeignKey(c => c.BusinessId)
                .OnDelete(DeleteBehavior.NoAction);

            // Prevent duplicate customer/business conversations
            modelBuilder.Entity<Conversation>()
                .HasIndex(c => new { c.CustomerId, c.BusinessId })
                .IsUnique();

            // Message -> Conversation
            modelBuilder.Entity<Message>()
                .HasOne(m => m.Conversation)
                .WithMany(c => c.Messages)
                .HasForeignKey(m => m.ConversationId)
                .OnDelete(DeleteBehavior.Cascade);

            // Message -> Sender
            modelBuilder.Entity<Message>()
                .HasOne(m => m.Sender)
                .WithMany()
                .HasForeignKey(m => m.SenderId)
                .OnDelete(DeleteBehavior.NoAction);
        }
    }
}
