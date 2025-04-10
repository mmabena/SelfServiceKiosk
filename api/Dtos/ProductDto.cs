using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;

namespace api.Dtos
{
     public class ProductDto
    {
        public int? ProductId { get; set; } // Not required during creation

        public string ProductName { get; set; }

        public string ProductDescription { get; set; }

        public decimal UnitPrice { get; set; }

        public string Available { get; set; }

        public int? Quantity { get; set; }

        public string ProductImage { get; set; }

        public int CategoryId { get; set; } // Foreign key to Category
    }
}