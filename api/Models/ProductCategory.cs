using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations.Schema;
using api.Dtos;


namespace api.Models
{
    [Table("ProductCategories")]

    public class ProductCategory
    
    {  public int CategoryId { get; set; }  // Primary Key
        public string CategoryName { get; set; }

        // Navigation Property
        public ICollection<Product> Products { get; set; }  // One-to-many relationship

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
//CREATE TABLE ProductCategories(
//CategoryId INT IDENTITY (1,1) PRIMARY KEY,
//CategoryName VARCHAR(50)
//);
