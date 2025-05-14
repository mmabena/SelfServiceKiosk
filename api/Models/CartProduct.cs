
using System.ComponentModel.DataAnnotations.Schema;


namespace api.Models
{
    [Table("CartProducts")]

    public class CartProduct
    {
      public int ProductId { get; set; }  
        public int CartId { get; set; }  
        public int Quantity { get; set; }

        
        public Product Products { get; set; }
        public Cart Carts { get; set; }
    }
}
