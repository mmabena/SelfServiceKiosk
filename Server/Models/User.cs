using System.ComponentModel.DataAnnotations.Schema;

namespace api.Models
{
    [Table("Users")]
    public class User
    {
        public int UserId { get; set; }
        public int UserRoleId { get; set; }
        public string Username { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
        public UserRole UserRole { get; set; }
        public Wallet Wallet { get; set; }
        public ICollection<Cart> Carts { get; set; }
        public ICollection<Transaction> Transactions { get; set; }

    }
}

