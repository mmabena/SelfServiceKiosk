

using System.ComponentModel.DataAnnotations.Schema;



namespace api.Models
{
    [Table("CartProducts")]

public class CartProduct
{
    public int CartProductId { get; set; }
    public int ProductId { get; set; }    
    public int CartId { get; set; }       
    public int Quantity { get; set; }
    public Cart Cart { get; set; }
    public Product Product { get; set; }
}

}
