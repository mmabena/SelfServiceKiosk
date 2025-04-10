using api.Dtos;
using api.Models;

namespace api.Mapper
{
    public static class ProductMapper
    {
        public static ProductDto ToProductDto(this Product productModel)
        {
            return new ProductDto
            {
                //ProductId = productModel.ProductId,
                ProductName = productModel.ProductName,
                ProductDescription = productModel.ProductDescription,
                UnitPrice = productModel.UnitPrice,
                Available = productModel.Available,
                Quantity = productModel.Quantity,
                ProductImage = productModel.ProductImage,
                // Access CategoryId from the related ProductCategory
                CategoryId = productModel.ProductCategories?.CategoryId ?? 0 // Handle null with safe navigation
            };
        }
    }
}
