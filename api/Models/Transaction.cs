using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace api.Models
{
    [Table("Transactions")]
    public class Transaction
    {
        public int TransactionId { get; set; }  // Primary Key

        public int UserId { get; set; }  // Foreign Key to User
        public DateTime TransactionDate { get; set; }  // Date of the transaction
        public string OrderType { get; set; }  // Type of order (for example, "Purchase", "Refund", etc.)

        // Foreign Key relationship to User
        public User User { get; set; }  // Navigation property to User

        // Navigation property for one-to-many relationship with Cart
        public ICollection<Cart> Carts { get; set; }  // A Transaction can have multiple Cart entries

        // Constructor to ensure the collection is never null
        public Transaction()
        {
            Carts = new List<Cart>();  // Initialize the collection to avoid null reference exceptions
        }
    }
}
