using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using api.Data;
using api.Models;
using api.Dtos;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using System.IO;
using System;

namespace api.Controllers
{
    [Route("api/product")]
    [ApiController]
    public class ProductController : ControllerBase
    {
         private readonly ApplicationDBContext _context;
  

public ProductController(ApplicationDBContext context)
{
    _context = context;
  
}

        // GET: api/product
        [HttpGet]
        public IActionResult GetAll()
        {
            var products = _context.Products
                                   .ToList()
                                   .Select(product => 
                                   {
                                       var productDto = product.ToProductDto();
                                       productDto.ProductImage = GetImageUrl(product.ProductImage); // Add image URL to product DTO
                                       return productDto;
                                   })
                                   .ToList();

            return Ok(products);
        }

        // GET: api/product/{id}
        [HttpGet("{id}")]
        public IActionResult GetById([FromRoute] int id)
        {
            var product = _context.Products.Find(id);

            if (product == null)
            {
                return NotFound("Product not found.");
            }

            var productDto = product.ToProductDto();
            productDto.ProductImage = GetImageUrl(product.ProductImage); // Add image URL to product DTO

            return Ok(productDto);
        }

        // GET: api/product/byCategory?name=Electronics
// GET: api/product/byCategory?name=Electronics
[HttpGet("byCategory")]
public IActionResult GetProductsByCategory([FromQuery] string name)
{
    if (string.IsNullOrWhiteSpace(name))
    {
        return BadRequest("Category name is required.");
    }

    var productsFromDb = _context.Products
        .Where(p => p.ProductCategories.CategoryName.ToLower() == name.ToLower())
        .ToList(); // Query executed here

    if (!productsFromDb.Any())
    {
        return NotFound($"No products found under category '{name}'.");
    }

    // Now safe to use instance method
    var products = productsFromDb.Select(p => new ProductDto
    {
        ProductId = p.ProductId,
        ProductName = p.ProductName,
        ProductDescription = p.ProductDescription,
        UnitPrice = p.UnitPrice,
        Available = p.Available,
        Quantity = p.Quantity,
        CategoryId = p.CategoryId,
        ProductImage = GetImageUrl(p.ProductImage)
    }).ToList();

    return Ok(products);
}


        // DELETE: api/product/{id}
        [Authorize(Policy = "RequireSuperUser")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct([FromRoute] int id)
        {
            var product = await _context.Products.FindAsync(id);

            if (product == null)
            {
                return NotFound("Product not found.");
            }
          

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();

            return Ok("Product has been successfully deleted.");
        }

        // POST: api/product/addProduct
        [Authorize(Policy = "RequireSuperUser")]
        [HttpPost("addProduct")]
        public async Task<IActionResult> AddProduct([FromForm] ProductDto productDto, IFormFile? imageFile)
        {
            try
            {
                // Validate product data
                if (string.IsNullOrEmpty(productDto.ProductName) || productDto.ProductName.Length > 50)
                    return BadRequest("Invalid product name.");
                if (string.IsNullOrEmpty(productDto.ProductDescription) || productDto.ProductDescription.Length > 200)
                    return BadRequest("Invalid description.");
                if (productDto.UnitPrice <= 0)
                    return BadRequest("Price must be positive.");
                if (string.IsNullOrEmpty(productDto.Available) || productDto.Available.Length > 50)
                    return BadRequest("Invalid availability.");
                if (productDto.Quantity < 0)
                    return BadRequest("Quantity cannot be negative.");

                // Check if category exists
                var categoryExists = await _context.ProductCategories
                    .AnyAsync(c => c.CategoryId == productDto.CategoryId);

                if (!categoryExists)
                    return BadRequest("The specified category does not exist.");

                string? imagePath = null;

                if (imageFile != null && imageFile.Length > 0)
                {
                    // File upload logic
                    var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "ProductImages");
                    Directory.CreateDirectory(uploadsFolder);

                    var uniqueFileName = Guid.NewGuid().ToString() + Path.GetExtension(imageFile.FileName);
                    var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await imageFile.CopyToAsync(stream);
                    }

                    imagePath = $"/ProductImages/{uniqueFileName}";
                }

                // Create new product
                var product = new Product
                {
                    ProductName = productDto.ProductName,
                    ProductDescription = productDto.ProductDescription,
                    UnitPrice = productDto.UnitPrice,
                    Available = productDto.Available,
                    Quantity = productDto.Quantity,
                    ProductImage = imagePath,
                    CategoryId = productDto.CategoryId
                };

                _context.Products.Add(product);
                await _context.SaveChangesAsync();

                // Return product with image URL
                var productResult = product.ToProductDto();
                productResult.ProductImage = GetImageUrl(product.ProductImage);

                return CreatedAtAction("GetById", new { id = product.ProductId }, productResult);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // PUT: api/product/{id}
       [Authorize(Policy = "RequireSuperUser")]
[HttpPut("{id}")]
public async Task<IActionResult> UpdateProduct([FromRoute] int id, [FromForm] ProductDto productDto, IFormFile? imageFile)
{
    if (!ModelState.IsValid)
    {
        return BadRequest(ModelState);
    }

    var product = await _context.Products.FindAsync(id);

    if (product == null)
    {
        return NotFound("Product not found.");
    }

    // Update product details
    product.ProductName = productDto.ProductName;
    product.ProductDescription = productDto.ProductDescription;
    product.UnitPrice = productDto.UnitPrice;
    product.Available = productDto.Available;
    product.Quantity = productDto.Quantity;
    product.CategoryId = productDto.CategoryId;

    // Handle image file upload
    if (imageFile != null && imageFile.Length > 0)
    {
        try
        {
            // Delete old image if it exists
            if (!string.IsNullOrEmpty(product.ProductImage))
            {
                var oldImagePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", product.ProductImage.TrimStart('/'));
                // Use System.IO.File to avoid conflict with ControllerBase.File()
                if (System.IO.File.Exists(oldImagePath))
                {
                    System.IO.File.Delete(oldImagePath);  // Delete old image from server
                }
            }

            // Save new image
            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "ProductImages");
            Directory.CreateDirectory(uploadsFolder);

            var uniqueFileName = Guid.NewGuid().ToString() + Path.GetExtension(imageFile.FileName);
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await imageFile.CopyToAsync(stream);
            }

            product.ProductImage = $"/ProductImages/{uniqueFileName}";
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error uploading file: {ex.Message}");
        }
    }

    // Save updated product
    await _context.SaveChangesAsync();

    return Ok("Product successfully updated.");
}

     public static string GetImageUrl(string imageName)
{
    return $"https://yourdomain.com/images/{imageName}";
}
}
}


