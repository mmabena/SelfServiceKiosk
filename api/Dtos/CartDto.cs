using System;

namespace api.DTOs
{
    public class CartDto
    {
        public int CartId { get; set; }
        public DateTime DateCreated { get; set; }

        // Navigation properties (optional)
        public UserDto User { get; set; }
        public TransactionDto Transaction { get; set; }
    }
}