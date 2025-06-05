
namespace api.Models
{
    public class Cart
    {
        public int CartId { get; set; }
        public int UserId { get; set; }
        public DateTime DateCreated { get; set; }

        public int? TransactionId { get; set; }

       
        public User User { get; set; }
        public Transaction Transaction { get; set; }  

        public ICollection<CartProduct> CartProducts { get; set; }
    }
}
