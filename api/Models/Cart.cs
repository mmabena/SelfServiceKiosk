using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace api.Models
{
    public class Cart

    {
         public int CartId { get; set; }  // Primary Key
        public int UserId { get; set; }
        public int TransactionId { get; set; }
        public DateTime DateCreated { get; set; }
        public decimal UnitPrice { get; set; }

        // Foreign Key relationships
        public User Users { get; set; }  // Navigation Property to User
        public Transaction Transactions { get; set; }  // Navigation Property to Transaction
        public ICollection<CartProduct> CartProducts { get; set; }  // One-to-many relationship
    }
    }

//CREATE TABLE Cart(
//CartId INT IDENTITY(1,1)  PRIMARY KEY,
//UserId INT,
//TransactionId INT,
//DateCreated DATETIME,
//UnitPrice MONEY,
//FOREIGN KEY (TransactionId) REFERENCES Transactions(TransactionId),
//FOREIGN KEY (UserId) REFERENCES Users(UserId));
