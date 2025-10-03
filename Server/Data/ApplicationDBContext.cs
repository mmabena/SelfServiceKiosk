using Microsoft.EntityFrameworkCore;
using api.Models;

namespace api.Data
{
    public class ApplicationDBContext : DbContext
    {
        public ApplicationDBContext(DbContextOptions<ApplicationDBContext> dbContextOptions)
        : base(dbContextOptions)
        {
            
        }

        public DbSet<Product> Products { get; set; }
        public DbSet<ProductCategory> ProductCategories { get; set; }
        public DbSet<Cart> Carts { get; set; }
        public DbSet<CartProduct> CartProducts { get; set; }
        public DbSet<Transaction> Transactions { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<UserRole> UserRoles { get; set; }
        public DbSet<Wallet> Wallets { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Primary Keys
            modelBuilder.Entity<Product>().HasKey(p => p.ProductId);
            modelBuilder.Entity<ProductCategory>().HasKey(c => c.CategoryId);
            modelBuilder.Entity<Cart>().HasKey(c => c.CartId);
            modelBuilder.Entity<CartProduct>().HasKey(cp => cp.CartProductId);  // CartProductId as Primary Key
            modelBuilder.Entity<Transaction>().HasKey(t => t.TransactionId);
            modelBuilder.Entity<User>().HasKey(u => u.UserId);
            modelBuilder.Entity<UserRole>().HasKey(ur => ur.UserRoleId);
            modelBuilder.Entity<Wallet>().HasKey(w => w.UserId);

            // Product - ProductCategory (Many-to-One)
            modelBuilder.Entity<Product>()
                .HasOne(p => p.ProductCategories)
                .WithMany(c => c.Products)
                .HasForeignKey(p => p.CategoryId);

            // Cart - User (Many-to-One)
            modelBuilder.Entity<Cart>()
                .HasOne(c => c.User)
                .WithMany(u => u.Carts)
                .HasForeignKey(c => c.UserId);

            // Cart - Transaction (Optional Many-to-One)
            modelBuilder.Entity<Cart>()
                .HasOne(c => c.Transaction)
                .WithMany()  // no navigation collection on Transaction
                .HasForeignKey(c => c.TransactionId)
                .OnDelete(DeleteBehavior.Restrict);  // prevent cascade cycles

            // Transaction - Cart (One-to-One)
            modelBuilder.Entity<Transaction>()
                .HasOne(t => t.Cart)
                .WithOne()
                .HasForeignKey<Transaction>(t => t.CartId)
                .OnDelete(DeleteBehavior.Restrict);  // prevent cascade cycles

            // CartProduct - Cart (Many-to-One)
            modelBuilder.Entity<CartProduct>()
                .HasOne(cp => cp.Cart)
                .WithMany(c => c.CartProducts)
                .HasForeignKey(cp => cp.CartId)
                .OnDelete(DeleteBehavior.Restrict);

            // CartProduct - Product (Many-to-One)
            modelBuilder.Entity<CartProduct>()
                .HasOne(cp => cp.Product)
                .WithMany(p => p.CartProducts)
                .HasForeignKey(cp => cp.ProductId)
                .OnDelete(DeleteBehavior.Restrict);

            // User - Wallet (One-to-One)
            modelBuilder.Entity<Wallet>()
                .HasOne(w => w.Users)
                .WithOne(u => u.Wallet)
                .HasForeignKey<Wallet>(w => w.UserId);

            // User - UserRole (Many-to-One)
            modelBuilder.Entity<User>()
                .HasOne(u => u.UserRole)
                .WithMany(ur => ur.Users)
                .HasForeignKey(u => u.UserRoleId)
                .OnDelete(DeleteBehavior.Restrict);

            // Precision setup for monetary values
            modelBuilder.Entity<Product>()
                .Property(p => p.UnitPrice)
                .HasColumnType("money");

            modelBuilder.Entity<Wallet>()
                .Property(w => w.Balance)
                .HasColumnType("money");

            // Optional: Only keep if Cart has a UnitPrice field
            // modelBuilder.Entity<Cart>()
            //     .Property(c => c.UnitPrice)
            //     .HasColumnType("money");

            // Seed data for UserRoles
            modelBuilder.Entity<UserRole>().HasData(
                new UserRole { UserRoleId = 1, RoleName = "User" },
                new UserRole { UserRoleId = 2, RoleName = "SuperUser" }
            );

            base.OnModelCreating(modelBuilder);
        }
    }
}
