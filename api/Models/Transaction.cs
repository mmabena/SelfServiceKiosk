
using System.ComponentModel.DataAnnotations.Schema;

namespace api.Models
{
    [Table("Transactions")]
    public class Transaction
    {
        public int TransactionId { get; set; }  

        public int UserId { get; set; }  
        public DateTime TransactionDate { get; set; } 
        public string OrderType { get; set; }  

       
        public User User { get; set; }  

        
        public ICollection<Cart> Carts { get; set; } 

      
        public Transaction()
        {
            Carts = new List<Cart>();  
        }
    }
}
