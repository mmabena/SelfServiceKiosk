using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace api.Dtos
{
    public class TransactionDto
    {
        public int TransactionId { get; set; }
        public DateTime TransactionDate { get; set; }
        public string OrderType { get; set; }
        
        // Navigation property to User (mapped to UserDto)
        public UserDto User { get; set; }  

        // Optionally, you can include CartDto if you need cart data in the response
        public ICollection<CartDto> Carts { get; set; }
    }
}
