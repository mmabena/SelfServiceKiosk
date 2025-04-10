using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations.Schema;


namespace api.Models
{
    [Table("CartProducts")]

    public class CartProduct
    {
      public int ProductId { get; set; }  // Foreign Key
        public int CartId { get; set; }  // Foreign Key
        public int Quantity { get; set; }

        // Navigation properties
        public Product Products { get; set; }
        public Cart Carts { get; set; }
    }
}
//CREATE TABLE CartProducts(
//ProductId INT,
//CartId INT,
//Quantity INT,
//FOREIGN KEY (ProductId) REFERENCES Products(ProductId),
//FOREIGN KEY (CartId) REFERENCES Cart(CartId)
//);
