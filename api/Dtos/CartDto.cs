using System;

namespace api.DTOs
{
    public class CartDto
    {
        public int CartId { get; set; }
        public DateTime DateCreated { get; set; }

        public UserDto User { get; set; }
        public TransactionDto Transaction { get; set; }

        public List<CartProductDto> CartProducts { get; set; }
    }
}