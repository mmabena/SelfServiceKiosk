using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using api.Models;
using Microsoft.AspNetCore.Identity;

namespace api.Data
{
    public class ApplicationDBContext : DbContext
    {
        public ApplicationDBContext(DbContextOptions<ApplicationDBContext> dbContextOptions) : base(dbContextOptions)
        {
        }

        // DbSet for each table/entity in the database
        public DbSet<Product> Products { get; set; }
        public DbSet<ProductCategory> ProductCategories { get; set; }
        public DbSet<Cart> Carts { get; set; }
        public DbSet<CartProduct> CartProducts { get; set; }
        public DbSet<Transaction> Transactions { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<UserRole> UserRoles { get; set; }  // Add DbSet for UserRole
        public DbSet<Wallet> Wallets { get; set; }

       protected override void OnModelCreating(ModelBuilder modelBuilder)
       {
            // Defining primary keys
            modelBuilder.Entity<Product>()
                .HasKey(p => p.ProductId);

            modelBuilder.Entity<ProductCategory>()
                .HasKey(c => c.CategoryId);

            modelBuilder.Entity<Cart>()
                .HasKey(c => c.CartId);

            modelBuilder.Entity<CartProduct>()
                .HasKey(cp => new { cp.ProductId, cp.CartId }); // Composite key

            modelBuilder.Entity<Transaction>()
                .HasKey(t => t.TransactionId);

            modelBuilder.Entity<User>()
                .HasKey(u => u.UserId);
                
            modelBuilder.Entity<UserRole>()
                .HasKey(ur => ur.UserRoleId);

            modelBuilder.Entity<Wallet>()
                .HasKey(w => w.UserId);

            // One-to-many relationship between Product and ProductCategory
            modelBuilder.Entity<Product>()
                .HasOne(p => p.ProductCategories)
                .WithMany(c => c.Products)
                .HasForeignKey(p => p.CategoryId);

            // One-to-many relationship between Cart and User
            modelBuilder.Entity<Cart>()
                .HasOne(c => c.Users)
                .WithMany(u => u.Carts)
                .HasForeignKey(c => c.UserId);

            // One-to-many relationship between Cart and Transaction
            modelBuilder.Entity<Cart>()
                .HasOne(c => c.Transactions)
                .WithMany(t => t.Carts)
                .HasForeignKey(c => c.TransactionId)
                .OnDelete(DeleteBehavior.Restrict); // Prevent cascading delete

            // One-to-many relationship between Cart and CartProduct
            modelBuilder.Entity<CartProduct>()
                .HasOne(cp => cp.Products)
                .WithMany(p => p.CartProducts)
                .HasForeignKey(cp => cp.ProductId)
                .OnDelete(DeleteBehavior.Restrict); // Prevent cascading delete

            modelBuilder.Entity<CartProduct>()
                .HasOne(cp => cp.Carts)
                .WithMany(c => c.CartProducts)
                .HasForeignKey(cp => cp.CartId)
                .OnDelete(DeleteBehavior.Restrict); // Prevent cascading delete

            // One-to-one relationship between User and Wallet
            modelBuilder.Entity<Wallet>()
                .HasOne(w => w.Users)
                .WithOne(u => u.Wallet)
                .HasForeignKey<Wallet>(w => w.UserId);

            // Define the User-UserRole relationship
            modelBuilder.Entity<User>()
                .HasOne(u => u.UserRole)
                .WithMany(ur => ur.Users)
                .HasForeignKey(u => u.UserRoleId)
                .OnDelete(DeleteBehavior.Restrict);  // Prevent cascading delete

            // Adding precision for decimal properties
            modelBuilder.Entity<Product>()
                .Property(p => p.UnitPrice)
                .HasColumnType("money"); // Or use HasPrecision if you want to specify precision and scale

            modelBuilder.Entity<Cart>()
                .Property(c => c.UnitPrice)
                .HasColumnType("money");

            modelBuilder.Entity<Wallet>()
                .Property(w => w.Balance)
                .HasColumnType("money");

            // Seed some default user roles
            modelBuilder.Entity<UserRole>()
            .HasData(

                new UserRole { UserRoleId = 1, RoleName = "User" },
                new UserRole { UserRoleId = 2, RoleName = "SuperUser" }
        
            );

            base.OnModelCreating(modelBuilder);
        }
    }
}