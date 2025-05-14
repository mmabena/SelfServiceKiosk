
using api.Dtos;
using api.Mapper;



namespace api.Models
{
    public class User
    {
        public int UserId { get; set; }
        public string Username { get; set; }  
        public string PasswordHash { get; set; }  
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }

        
        public int UserRoleId { get; set; }
        public UserRole UserRole { get; set; }  

        
        public Wallet Wallet { get; set; }
        public ICollection<Cart> Carts { get; set; }
        public ICollection<Transaction> Transactions { get; set; }

       
       
    }
}

