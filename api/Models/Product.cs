using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema; // Add this for the Column attribute
using System.Linq;
using System.Threading.Tasks;
using api.Dtos;

namespace api.Models
{
 [Table("Products")]

public class Product
{
    public int ProductId { get; set; }  // Primary Key
    public int CategoryId { get; set; }//foreign key
        public string ProductName { get; set; }
        public string ProductDescription { get; set; }
        
        public string Available { get; set; }
     
        public string ProductImage { get; set; }
        public decimal UnitPrice { get; set; }
        public int? Quantity { get; set; }
        
        
        public ProductCategory ProductCategories { get; set; } // Navigation Property
          public ICollection<CartProduct> CartProducts { get; set; } // Navigation property for CartProducts
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
                CategoryId = this.CategoryId
            };

          }

    }
    
}


//CREATE TABLE Products (
  //  ProductId INT IDENTITY(1,1) PRIMARY KEY, -- This defines the ProductId as the primary key and auto-increments
    //ProductName VARCHAR(50),
    //ProductDescription VARCHAR(50),
    //UnitPrice MONEY,
    //Avaiable VARCHAR(50),
    //Quantity INT NULL,
    //ProductImage VARCHAR(50)
//);