

namespace api.DTOs
{
    public class CartProductDto
    {
        public int CartProductId { get; set; }
        public int CartId { get; set; }
        public int ProductId { get; set; }
        public int Quantity { get; set; } // Quantity of product in cart
    }
}
