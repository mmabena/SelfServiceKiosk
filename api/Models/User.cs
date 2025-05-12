
using api.Dtos;
using api.Mapper;



namespace api.Models
{
    public class User
    {
        public int UserId { get; set; }
        public string Username { get; set; }  // Unique username
        public string PasswordHash { get; set; }  // Password hash
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }

        // Foreign Key to the UserRole table
        public int UserRoleId { get; set; }
        public UserRole UserRole { get; set; }  // Navigation property

        // Navigation properties for other relationships
        public Wallet Wallet { get; set; }
        public ICollection<Cart> Carts { get; set; }
        public ICollection<Transaction> Transactions { get; set; }

        // Map User entity to UserDto (excluding password)
        public UserDto ToUserDto()
        {
            return new UserDto
            {
                UserId = this.UserId,
                Username = this.Username,
                FirstName = this.FirstName,
                LastName = this.LastName,
                Email = this.Email,
                Role = this.UserRole?.RoleName,  // Map Role from UserRole
                Wallet = this.Wallet?.ToWalletDto(),
                Carts = this.Carts?.Select(cart => cart.ToCartDto()).ToList(),
                Transactions = this.Transactions?.Select(transaction => transaction.ToTransactionDto()).ToList()
            };
        }
    }
}

// namespace api.Models- new namespace that takes userrole id as a foreign key
// {
//     public class User
//     {
//         
//     }
// }

  //    public int UserId { get; set; }
    //     public string Username { get; set; }  // Unique username
    //     public string PasswordHash { get; set; }  // Password hash
    //     public string FirstName { get; set; }
    //     public string LastName { get; set; }
    //     public string Email { get; set; }
    //     public string Role { get; set; }  // Add Role to User

    //     // Navigation properties
    //     public Wallet Wallet { get; set; }
    //     public ICollection<Cart> Carts { get; set; }
    //     public ICollection<Transaction> Transactions { get; set; }

    //     // Map User entity to UserDto (excluding password)
    //     public UserDto ToUserDto()
    //     {
    //         return new UserDto
    //         {
    //             UserId = this.UserId,
    //             Username=this.Username,
    //             FirstName = this.FirstName,
    //             LastName = this.LastName,
    //             Email = this.Email,
    //             Role=this.Role,
    //             Wallet = this.Wallet?.ToWalletDto(), // Safely map Wallet
    //             Carts = this.Carts?.Select(cart => cart.ToCartDto()).ToList(), // Safely map Carts
    //             Transactions = this.Transactions?.Select(transaction => transaction.ToTransactionDto()).ToList() // Safely map Transactions
    //         };
    //     }