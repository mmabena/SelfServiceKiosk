using api.Controllers;
using api.Data;
using api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;
using api.Dtos;
using Xunit;

namespace api.Tests
{
   public class ProductControllerTests
{
    private readonly ApplicationDBContext _context;
    private readonly ProductController _controller;

    public ProductControllerTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDBContext>()
            .UseInMemoryDatabase(databaseName: "TestDb")
            .Options;

        _context = new ApplicationDBContext(options);
        _controller = new ProductController(_context);

        _context.Database.EnsureDeleted(); // Clear any previous data
        _context.Database.EnsureCreated(); // Recreate the schema

        SeedData(); // Preload some test data
    }

    private void SeedData()
{
    // Ensure the Category does not already exist, using a unique CategoryId
    var category = new ProductCategory
    {
        CategoryId = 1000, // Manually ensure a unique CategoryId
        CategoryName = "Snacks"
    };

    if (!_context.ProductCategories.Any(c => c.CategoryId == category.CategoryId))
    {
        _context.ProductCategories.Add(category);
    }

    var product = new Product
    {
        ProductId = 1001, // Manually ensure a unique ProductId
        ProductName = "Chips",
        ProductDescription = "Tasty snack",
        UnitPrice = 10.99m,
        Available = "Yes",
        Quantity = 100,
        ProductImage = "chips.jpg",
        CategoryId = category.CategoryId
    };

    if (!_context.Products.Any(p => p.ProductId == product.ProductId))
    {
        _context.Products.Add(product);
    }

    _context.SaveChanges();

    // Debugging output (remove this in production)
    var productInDb = _context.Products.FirstOrDefault(p => p.ProductId == 1001);
    if (productInDb == null)
    {
        throw new Exception("Product not found after seeding.");
    }
}


    [Fact]
    public void GetAll_ReturnsOkResult_WithProducts()
    {
        var result = _controller.GetAll();

        var okResult = Assert.IsType<OkObjectResult>(result);
        var products = Assert.IsAssignableFrom<IEnumerable<ProductDto>>(okResult.Value);

        Assert.NotEmpty(products);
    }

[Fact]
public void GetById_ValidId_ReturnsProduct()
{
    // Add an assertion to verify if the product is in the database
    var productExists = _context.Products.Any(p => p.ProductId == 1001);
    Assert.True(productExists, "Product with ID 1001 should exist.");

    var result = _controller.GetById(1001); // Use the updated ProductId

    var okResult = Assert.IsType<OkObjectResult>(result);
    var product = Assert.IsType<ProductDto>(okResult.Value);

    Assert.Equal("Chips", product.ProductName);
}


    [Fact]
    public async Task DeleteProduct_ValidId_RemovesProduct()
    {
        var result = await _controller.DeleteProduct(1001); // Use the updated ProductId

        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.Equal("Product has been successfully deleted.", okResult.Value);
        Assert.Null(_context.Products.Find(1001)); // Use the updated ProductId
    }

    [Fact]
    public void GetById_InvalidId_ReturnsNotFound()
    {
        var result = _controller.GetById(9999); // An ID that doesn't exist

        var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
        Assert.Equal("Product not found.", notFoundResult.Value);
    }

    [Fact]
    public async Task DeleteProduct_InvalidId_ReturnsNotFound()
    {
        var result = await _controller.DeleteProduct(9999); // An ID that doesn't exist

        var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
        Assert.Equal("Product not found.", notFoundResult.Value);
    }
}

}
