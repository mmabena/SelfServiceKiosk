

namespace api.DTOs
{
    public class TransactionDto
    {
   public int TransactionId { get; set; }
        public DateTime TransactionDate { get; set; }
        public string OrderType { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }      
       
        public UserDto User { get; set; }        
        public CartDto Cart { get; set; }
    }
}
