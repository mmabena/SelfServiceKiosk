using api.Controllers;
using api.Data;
using api.DTOs;
using api.Models;
using api.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;



namespace api.Tests
{
 public class ProductControllerTests : IDisposable
    {
        private readonly ApplicationDBContext _context;
        private readonly ProductController _controller;
        private readonly Mock<IProductRepository> _mockRepo;


        public ProductControllerTests()
        {
            var options = new DbContextOptionsBuilder<ApplicationDBContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new ApplicationDBContext(options);
            _context.Database.EnsureCreated();

            SeedData();

            _mockRepo = new Mock<IProductRepository>();
            _mockRepo.Setup(repo => repo.GetAllAsync()).ReturnsAsync(_context.Products.ToList());

            _controller = new ProductController(_context, _mockRepo.Object);
        }
        public void Dispose()
{
    _context?.Dispose();
}

        private void SeedData()
        {
            var category = new ProductCategory
            {
                CategoryId = 1000,
                CategoryName = "Snacks"
            };

            _context.ProductCategories.Add(category);

            _context.Products.Add(new Product
            {
                ProductId = 1001,
                ProductName = "Chips",
                ProductDescription = "Tasty snack",
                UnitPrice = 10.99m,
                Available = "Yes",
                Quantity = 100,
                ProductImage = "/ProductImages/chips.jpg",
                CategoryId = 1000
            });

            _context.SaveChanges();
        }

      [Fact]
public async Task GetAll_ShouldReturnProductsWithCloudinaryImageUrl()
{
    var result = await _controller.GetAll();

    var okResult = Assert.IsType<OkObjectResult>(result);
    var products = Assert.IsAssignableFrom<IEnumerable<ProductDto>>(okResult.Value);

    Assert.Single(products);
    var product = products.First();
    Assert.NotNull(product.ProductImage);
    Assert.StartsWith("https://res.cloudinary.com/", product.ProductImage);
}

[Fact]
public void GetById_ValidId_ReturnsProductWithCloudinaryImageUrl()
{
    var result = _controller.GetById(1001);

    var okResult = Assert.IsType<OkObjectResult>(result);
    var product = Assert.IsType<ProductDto>(okResult.Value);

    Assert.Equal("Chips", product.ProductName);
    Assert.NotNull(product.ProductImage);
    Assert.StartsWith("https://res.cloudinary.com/", product.ProductImage);
}

[Fact]
public async Task AddProduct_ValidData_AddsProductWithCloudinaryImageUrl()
{
    var dto = new ProductDto
    {
        ProductName = "Cookies",
        ProductDescription = "Delicious cookies",
        UnitPrice = 15.50m,
        Available = "Yes",
        Quantity = 50,
        CategoryId = 1000
    };

    var mockFile = new Mock<IFormFile>();
    mockFile.Setup(f => f.FileName).Returns("cookies.jpg");
    mockFile.Setup(f => f.Length).Returns(100);
    mockFile.Setup(f => f.OpenReadStream()).Returns(new MemoryStream(new byte[100]));

    // Simulate Cloudinary URL returned in product after upload
    _mockRepo.Setup(r => r.CreateAsync(It.IsAny<Product>(), It.IsAny<IFormFile>()))
             .ReturnsAsync((Product product, IFormFile file) =>
             {
                 product.ProductId = 2001;
                 product.ProductImage = "https://res.cloudinary.com/demo/image/upload/sample.jpg";
                 return product;
             });

    var result = await _controller.AddProduct(dto);

    var createdResult = Assert.IsType<CreatedAtActionResult>(result);
    var product = Assert.IsType<ProductDto>(createdResult.Value);

    Assert.Equal("Cookies", product.ProductName);
    Assert.StartsWith("https://res.cloudinary.com/", product.ProductImage);
}

[Fact]
public async Task UpdateProduct_ValidId_UpdatesDataWithCloudinaryImageUrl()
{
    var dto = new ProductDto
    {
        ProductName = "Chips Updated",
        ProductDescription = "Tasty snack with salt",
        UnitPrice = 11.50m,
        Available = "Yes",
        Quantity = 120,
        CategoryId = 1000,
        ProductImage = "https://res.cloudinary.com/demo/image/upload/updated.jpg"
    };

    _mockRepo.Setup(r => r.UpdateAsync(1001, dto))
             .ReturnsAsync((int id, ProductDto productDto) =>
             {
                 var product = _context.Products.First(p => p.ProductId == id);
                 product.ProductImage = productDto.ProductImage;
                 return product;
             });

    var result = await _controller.UpdateProduct(1001, dto);

    var okResult = Assert.IsType<OkObjectResult>(result);
    Assert.Equal("Product successfully updated.", okResult.Value);

    var updatedProduct = _context.Products.FirstOrDefault(p => p.ProductId == 1001);
    Assert.NotNull(updatedProduct);
    Assert.StartsWith("https://res.cloudinary.com/", updatedProduct.ProductImage);
}
    }
}
