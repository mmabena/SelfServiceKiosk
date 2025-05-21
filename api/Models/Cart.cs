
namespace api.Models
{
    public class Cart
    {
        public int CartId { get; set; }
        public int UserId { get; set; }
        public DateTime DateCreated { get; set; }

        public int? TransactionId { get; set; }

        // Navigation
        public User User { get; set; }
        public Transaction Transaction { get; set; }  // Many-to-one back reference

        public ICollection<CartProduct> CartProducts { get; set; }
    }
}
