
using System.ComponentModel.DataAnnotations;

namespace api.DTOs
{
    public class ProductDto
    {
        public int? ProductId { get; set; } 

        [Required(ErrorMessage = "Product name is required.")]
        [StringLength(50, ErrorMessage = "Product name cannot be longer than 50 characters.")]
        public string ProductName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Product description is required.")]
        [StringLength(200, ErrorMessage = "Product description cannot be longer than 200 characters.")]
        public string ProductDescription { get; set; } = string.Empty;

        [Range(0.01, double.MaxValue, ErrorMessage = "Unit price must be greater than zero.")]
        public decimal UnitPrice { get; set; }

        [Required(ErrorMessage = "Availability is required.")]
        [StringLength(50, ErrorMessage = "Availability status cannot be longer than 50 characters.")]
        public string Available { get; set; } = string.Empty;

        [Range(0, int.MaxValue, ErrorMessage = "Quantity cannot be negative.")]
        public int? Quantity { get; set; }

        public string ProductImage { get; set; } = string.Empty; 

        [Required(ErrorMessage = "Category ID is required.")]
        public int CategoryId { get; set; } 
        public bool IsActive {get;set;}
    }
}
