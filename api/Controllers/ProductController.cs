using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using api.Data;
using api.Models;
using api.Dtos;

namespace api.Controllers
{
[Route("api/product")]
[ApiController]
public class ProductController : ControllerBase
{
    private readonly ApplicationDBContext _context;

    // Constructor for injecting ApplicationDBContext
    public ProductController(ApplicationDBContext context)
    {
        _context = context;
    }

    // GET: api/product
    // Display all products
    [HttpGet]
    public IActionResult GetAll()
    {
        var products = _context.Products
                               .ToList()
                               .Select(product => product.ToProductDto())
                               .ToList();

        return Ok(products);
    }

    // Fetch product by id
    [HttpGet("{id}")]
    public IActionResult GetById([FromRoute] int id)
    {
        var product = _context.Products.Find(id);

        if (product == null)
        {
            return NotFound("Product not found.");
        }

        return Ok(product.ToProductDto()); // Mapping to DTO
    }

    // Fetch products by category name
[HttpGet("byCategory")]
public IActionResult GetProductsByCategory([FromQuery] string name)
{
    if (string.IsNullOrWhiteSpace(name))
    {
        return BadRequest("Category name is required.");
    }
    //scalable because a select statement to dto is used which avoids loading full entity trees and only retrieves matching products.
    var products = _context.Products
        .Where(p => p.ProductCategories.CategoryName.ToLower() == name.ToLower())
        .Select(p => p.ToProductDto())
        .ToList();

    if (!products.Any())
    {
        return NotFound($"No products found under category '{name}'.");
    }

    return Ok(products);
}


    // Delete product by product id
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

    // Add product to the database
    // POST: api/product/addProduct
   [HttpPost("addProduct")]
public async Task<IActionResult> AddProduct([FromBody] ProductDto productDto)
{
    // Validate input data manually
    if (string.IsNullOrEmpty(productDto.ProductName))
    {
        return BadRequest("Product name is required.");
    }

    if (productDto.ProductName.Length > 50)
    {
        return BadRequest("Product name cannot exceed 50 characters.");
    }

    if (string.IsNullOrEmpty(productDto.ProductDescription))
    {
        return BadRequest("Product description is required.");
    }

    if (productDto.ProductDescription.Length > 200)
    {
        return BadRequest("Product description cannot exceed 200 characters.");
    }

    if (productDto.UnitPrice <= 0)
    {
        return BadRequest("Unit price must be a positive value.");
    }

    if (string.IsNullOrEmpty(productDto.Available))
    {
        return BadRequest("Availability status is required.");
    }

    if (productDto.Available.Length > 50)
    {
        return BadRequest("Availability status cannot exceed 50 characters.");
    }

    if (productDto.Quantity < 0)
    {
        return BadRequest("Quantity cannot be negative.");
    }

    if (!string.IsNullOrEmpty(productDto.ProductImage) && productDto.ProductImage.Length > 255)
    {
        return BadRequest("Product image URL cannot exceed 255 characters.");
    }

    // Validate if the category exists
    var categoryExists = await _context.ProductCategories
        .AnyAsync(c => c.CategoryId == productDto.CategoryId);

    if (!categoryExists)
    {
        return BadRequest("The specified category does not exist.");
    }

    // Create a new product object
    var product = new Product
    {
        ProductName = productDto.ProductName,
        ProductDescription = productDto.ProductDescription,
        UnitPrice = productDto.UnitPrice,
        Available = productDto.Available,
        Quantity = productDto.Quantity,
        ProductImage = productDto.ProductImage, // Assuming image is a URL or file path
        CategoryId = productDto.CategoryId // This will now safely reference an existing category
    };

    // Save the new product to the database
    try
    {
        _context.Products.Add(product);
        await _context.SaveChangesAsync();
        return CreatedAtAction("GetById", new { id = product.ProductId }, product.ToProductDto());
    }
    catch (DbUpdateException ex)
    {
        // Handle any exceptions related to database constraints
        return StatusCode(500, $"Internal server error: {ex.Message}");
    }
}

    // Update product in the database
    // PUT: api/product/update
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateProduct([FromRoute] int id, [FromBody] ProductDto productDto)
    {
        // Check if model state is valid
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState); // Return validation errors
        }

        var product = await _context.Products.FindAsync(id);

        if (product == null)
        {
            return NotFound("Product not found.");
        }

        product.ProductName = productDto.ProductName;
        product.ProductDescription = productDto.ProductDescription;
        product.UnitPrice = productDto.UnitPrice;
        product.Available = productDto.Available;
        product.Quantity = productDto.Quantity;
        product.ProductImage = productDto.ProductImage;
        product.CategoryId = productDto.CategoryId;

        await _context.SaveChangesAsync();

        return Ok("Product successfully updated");
    }
}
 }

