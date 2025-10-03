
using System.ComponentModel.DataAnnotations.Schema;
using api.DTOs;


namespace api.Models
{
    [Table("ProductCategories")]

    public class ProductCategory
    
    {  public int CategoryId { get; set; }  
        public string CategoryName { get; set; } = string.Empty;

     
        public ICollection<Product> Products { get; set; }  

        public ProductCategoryDto ToProductCategoryDto()
        {
            return new ProductCategoryDto
            {
                CategoryId = this.CategoryId,
                CategoryName=this.CategoryName
                
            };
        }
    }
}
