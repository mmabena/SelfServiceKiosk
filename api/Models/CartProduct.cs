
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace api.Models
{
    [Table("CartProducts")]

public class CartProduct
{
    public int CartProductId { get; set; } // PK, Identity
    public int ProductId { get; set; }     // FK
    public int CartId { get; set; }        // FK
    public int Quantity { get; set; }

    public Cart Cart { get; set; }
    public Product Product { get; set; }
}

}
