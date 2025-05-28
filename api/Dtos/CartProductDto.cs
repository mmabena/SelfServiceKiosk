

namespace api.DTOs
{
    public class CartProductDto
    {
        public int CartProductId { get; set; }
        public int CartId { get; set; }
        public int ProductId { get; set; }
        public int Quantity { get; set; }

        // Add this to include product details (name, price, etc.)
        public ProductDto Product { get; set; }
    }
}
