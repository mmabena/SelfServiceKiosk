
using System.ComponentModel.DataAnnotations.Schema;

namespace api.Models
{
    [Table("Transactions")]
    public class Transaction
    {
        public int TransactionId { get; set; }
        public int UserId { get; set; }
        public int CartId { get; set; }

        public DateTime TransactionDate { get; set; } = DateTime.UtcNow;
        public string OrderType { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }

        // Navigation
        public User User { get; set; }
        public Cart Cart { get; set; } 
    }
}
