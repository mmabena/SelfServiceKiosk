

namespace api.DTOs
{
    public class TransactionDto
    {
   public int TransactionId { get; set; }
        public DateTime TransactionDate { get; set; }
        public string OrderType { get; set; }
        public decimal TotalAmount { get; set; }  // Include TotalAmount in DTO
        
        // Navigation property to User (mapped to UserDto)
        public UserDto User { get; set; }

        // Single Cart (mapped to CartDto)
        public CartDto Cart { get; set; }
    }
}
