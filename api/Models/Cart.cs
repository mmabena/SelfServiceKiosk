

namespace api.Models
{
    public class Cart

    {
         public int CartId { get; set; }  
        public int UserId { get; set; }
        public int TransactionId { get; set; }
        public DateTime DateCreated { get; set; }
        public decimal UnitPrice { get; set; }

    
        public User Users { get; set; }  
        public Transaction Transactions { get; set; }  
        public ICollection<CartProduct> CartProducts { get; set; }  
    }
    }


