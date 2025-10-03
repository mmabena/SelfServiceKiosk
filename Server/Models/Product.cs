
using System.ComponentModel.DataAnnotations.Schema; 
using api.DTOs;

namespace api.Models
{
 [Table("Products")]

public class Product
{
        public int ProductId { get; set; }  
        public int CategoryId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string ProductDescription { get; set; } = string.Empty;        
        public string Available { get; set; } = string.Empty;     
        public string ProductImage { get; set; } = string.Empty;
        public decimal UnitPrice { get; set; }
        public int? Quantity { get; set; }
        public bool IsActive { get; set; } = true;       
        
        public ProductCategory ProductCategories { get; set; } 
        public ICollection<CartProduct> CartProducts { get; set; } 
        public ProductDto ToProductDto()
          {
            return new ProductDto
            {
                ProductId = this.ProductId,
                ProductName = this.ProductName,
                ProductDescription = this.ProductDescription,
                UnitPrice = this.UnitPrice,
                Available = this.Available,
                Quantity = this.Quantity,
                ProductImage = this.ProductImage,
                CategoryId = this.CategoryId,
                IsActive = this.IsActive

            };

          }

    }
    
}


