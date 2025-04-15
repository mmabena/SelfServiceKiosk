using api.Controllers;
using api.Data;
using api.Dtos;
using api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Moq;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Xunit;
using System;

namespace api.Tests
{
    public class ProductControllerTests : IDisposable
    {
        private readonly ApplicationDBContext _context;
        private readonly ProductController _controller;

        public ProductControllerTests()
        {
            var options = new DbContextOptionsBuilder<ApplicationDBContext>()
                .UseInMemoryDatabase(databaseName: "ProductTestDb")
                .Options;

            _context = new ApplicationDBContext(options);
            _context.Database.EnsureDeleted();
            _context.Database.EnsureCreated();

            SeedData();
            _controller = new ProductController(_context);
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
        public void GetAll_ShouldReturnProductsWithImageUrl()
        {
            var result = _controller.GetAll();

            var okResult = Assert.IsType<OkObjectResult>(result);
            var products = Assert.IsAssignableFrom<IEnumerable<ProductDto>>(okResult.Value);

            Assert.Single(products);
            var product = products.First();
            Assert.NotNull(product.ProductImage);
            Assert.Contains("http://localhost:5219/ProductImages", product.ProductImage);
        }

        [Fact]
        public void GetById_ValidId_ReturnsProductWithImageUrl()
        {
            var result = _controller.GetById(1001);

            var okResult = Assert.IsType<OkObjectResult>(result);
            var product = Assert.IsType<ProductDto>(okResult.Value);

            Assert.Equal("Chips", product.ProductName);
            Assert.NotNull(product.ProductImage);
            Assert.Contains("http://localhost:5219/ProductImages", product.ProductImage);
        }

        [Fact]
        public void GetById_InvalidId_ReturnsNotFound()
        {
            var result = _controller.GetById(9999);

            var notFound = Assert.IsType<NotFoundObjectResult>(result);
            Assert.Equal("Product not found.", notFound.Value);
        }

        [Fact]
        public async Task DeleteProduct_ValidId_RemovesProduct()
        {
            var result = await _controller.DeleteProduct(1001);

            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal("Product has been successfully deleted.", okResult.Value);

            Assert.Null(_context.Products.Find(1001));
        }

        [Fact]
        public async Task DeleteProduct_InvalidId_ReturnsNotFound()
        {
            var result = await _controller.DeleteProduct(9999);

            var notFound = Assert.IsType<NotFoundObjectResult>(result);
            Assert.Equal("Product not found.", notFound.Value);
        }

        [Fact]
        public async Task AddProduct_ValidData_AddsProductWithImageUrl()
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

            var result = await _controller.AddProduct(dto, mockFile.Object);

            var createdResult = Assert.IsType<CreatedAtActionResult>(result);
            var product = Assert.IsType<ProductDto>(createdResult.Value);

            Assert.Equal("Cookies", product.ProductName);
            Assert.NotNull(product.ProductImage);
            Assert.Contains("http://localhost:5219/ProductImages", product.ProductImage);
        }

        [Fact]
        public async Task UpdateProduct_ValidId_UpdatesDataWithImageUrl()
        {
            var dto = new ProductDto
            {
                ProductName = "Chips Updated",
                ProductDescription = "Tasty snack with salt",
                UnitPrice = 11.50m,
                Available = "Yes",
                Quantity = 120,
                CategoryId = 1000
            };

            var mockFile = new Mock<IFormFile>();
            mockFile.Setup(f => f.FileName).Returns("chips_updated.jpg");
            mockFile.Setup(f => f.Length).Returns(100);
            mockFile.Setup(f => f.OpenReadStream()).Returns(new MemoryStream(new byte[100]));

            var result = await _controller.UpdateProduct(1001, dto, mockFile.Object);

            var okResult = Assert.IsType<OkObjectResult>(result);
            var actualMessage = okResult.Value.ToString();

            Assert.Equal("Product successfully updated.", actualMessage?.Trim());

            var updatedProduct = _context.Products.FirstOrDefault(p => p.ProductId == 1001);
            Assert.NotNull(updatedProduct);
            Assert.Contains("/ProductImages", updatedProduct.ProductImage);
        }

        // Cleanup logic to remove files created during tests
        public void Dispose()
        {
            var path = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "ProductImages");
            if (Directory.Exists(path))
            {
                Directory.Delete(path, true);
            }
        }
    }
}
