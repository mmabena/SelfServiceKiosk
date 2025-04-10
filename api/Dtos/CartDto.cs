using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
namespace api.Dtos
{
    public class CartDto
    {
        public int CartId { get; set; }  // Primary Key
        public DateTime DateCreated { get; set; }
        public decimal UnitPrice { get; set; }
        
        // You may choose to include or omit the navigation properties here.
        // If included, they should ideally also be mapped to DTOs (e.g., UserDto, TransactionDto)
        public UserDto User { get; set; }  // Navigation Property (Optional)
        public TransactionDto Transaction { get; set; }  // Navigation Property (Optional)
    }
}
