

namespace api.DTOs
{
    public class UserDto
    {
        public int UserId { get; set; }

        public string Username { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public WalletDto Wallet { get; set; }
        public ICollection<CartDto> Carts { get; set; }
        public ICollection<TransactionDto> Transactions { get; set; }
        public bool IsActive { get; set; } 
    }
}
