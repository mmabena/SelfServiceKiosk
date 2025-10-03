using api.DTOs;
using api.Models;

namespace api.Mapper
{
    public static class ProductMapper
    {
    public static ProductDto ToProductDto(this Product productModel)
{
    return new ProductDto
    {
       
        ProductName = productModel.ProductName,
        ProductDescription = productModel.ProductDescription,
        UnitPrice = productModel.UnitPrice,
        Available = productModel.Available,
        Quantity = productModel.Quantity,
        ProductImage = productModel.ProductImage,
        CategoryId = productModel.ProductCategories?.CategoryId ?? 0,
        IsActive = productModel.IsActive
    };
}

    }
}
