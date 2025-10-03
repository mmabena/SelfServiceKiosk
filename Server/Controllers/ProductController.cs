
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using api.Data;
using api.Models;
using api.Interfaces;
using api.DTOs;



namespace api.Controllers
{
    [Route("api/product")]
    [ApiController]
    public class ProductController : ControllerBase
    {

        private readonly IProductRepository _productRepo;
        private readonly ApplicationDBContext _context;

        public ProductController(ApplicationDBContext context, IProductRepository productRepo)
        {
            _context = context;
            _productRepo = productRepo;

        }
        [HttpGet("activeProducts")]
        public IActionResult GetActiveProducts()
        {
            var products = _context.Products
                .Where(p => p.IsActive && p.Available.ToLower() != "no")
                .ToList();

            return Ok(products);
        }
        // PUT: api/product/{id}/toggle-active
        [Authorize(Policy = "RequireSuperUser")]
        [HttpPut("{id}/toggle-active")]
        public async Task<IActionResult> ToggleProductActive([FromRoute] int id)
        {
            var product = await _productRepo.GetByIdAsync(id);
            if (product == null)
                return NotFound("Product not found.");

            product.IsActive = !product.IsActive;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Product active status toggled.", isActive = product.IsActive });
        }



        // GET: api/product
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var products = await _productRepo.GetAllAsync();

            if (products == null || !products.Any())
            {
                return NotFound("No products found.");
            }

            var productDtos = products.Select(product => product.ToProductDto()).ToList();

            foreach (var productDto in productDtos)
            {
                if (!string.IsNullOrEmpty(productDto.ProductImage))
                {
                    productDto.ProductImage = GetImageUrl(productDto.ProductImage);
                }
            }

            return Ok(productDtos);
        }

        // Generate image URL
        private static string GetImageUrl(string imagePath)
        {
            // Only append base URL if it's not already a full URL
            if (string.IsNullOrWhiteSpace(imagePath)) return string.Empty;
            return imagePath.StartsWith("http") ? imagePath : $"https://res.cloudinary.com/djmafre5k/image/upload/{imagePath}";
        }

        // GET: api/product/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById([FromRoute] int id)
        {
            var product = await _productRepo.GetByIdAsync(id);

            if (product == null)
            {
                return NotFound("Product not found.");
            }

            var productDto = product.ToProductDto();
            productDto.ProductImage = GetImageUrl(product.ProductImage); // Add image URL to product DTO

            return Ok(productDto);
        }

        // GET: api/product/byCategory?name=Electronics
        [HttpGet("byCategory")]
        public async Task<IActionResult> GetProductsByCategory([FromQuery] string name)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                return BadRequest("Category name is required.");
            }

            var products = await _productRepo.GetByCategoryAsync(name);
            var productDtos = products.Select(p => new ProductDto
            {
                ProductId = p.ProductId,
                ProductName = p.ProductName,
                ProductDescription = p.ProductDescription,
                UnitPrice = p.UnitPrice,
                Available = p.Available,
                Quantity = p.Quantity,
                CategoryId = p.CategoryId,
                ProductImage = GetImageUrl(p.ProductImage) // Add image URL
            }).ToList();

            if (!productDtos.Any())
            {
                return NotFound($"No products found under category '{name}'.");
            }

            return Ok(productDtos);
        }

        // DELETE: api/product/{id}
        [Authorize(Policy = "RequireSuperUser")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct([FromRoute] int id)
        {
            var product = await _productRepo.DeleteAsync(id);

            if (product == null)
            {
                return NotFound("Product not found.");
            }

            return Ok("Product has been successfully deleted.");
        }

        // POST: api/product/addProduct
        [Authorize(Policy = "RequireSuperUser")]
        [HttpPost("addProduct")]
        public async Task<IActionResult> AddProduct([FromForm] ProductDto productDto)
        {
            // Manual validation (in addition to DataAnnotations)
            if (string.IsNullOrEmpty(productDto.ProductName) || productDto.ProductName.Length > 50)
                return BadRequest("Invalid product name.");

            if (string.IsNullOrEmpty(productDto.ProductDescription) || productDto.ProductDescription.Length > 200)
                return BadRequest("Invalid description.");

            if (productDto.UnitPrice <= 0)
                return BadRequest("Unit price must be greater than zero.");

            if (string.IsNullOrEmpty(productDto.Available) || productDto.Available.Length > 50)
                return BadRequest("Invalid availability.");

            if (productDto.Quantity == null || productDto.Quantity < 0)
                return BadRequest("Quantity cannot be negative or null.");

            if (productDto.CategoryId <= 0)
                return BadRequest("Invalid category ID.");

            var categoryExists = await _context.ProductCategories
                .AnyAsync(c => c.CategoryId == productDto.CategoryId);
            if (!categoryExists)
                return BadRequest("The specified category does not exist.");

            var product = new Product
            {
                ProductName = productDto.ProductName,
                ProductDescription = productDto.ProductDescription,
                UnitPrice = productDto.UnitPrice,
                Available = productDto.Available,
                Quantity = productDto.Quantity.Value,
                CategoryId = productDto.CategoryId,
                ProductImage = !string.IsNullOrEmpty(productDto.ProductImage)
            ? productDto.ProductImage
            : "https://example.com/default-image.jpg",
                IsActive = productDto.IsActive // ✅ Include this
            };


            var createdProduct = await _productRepo.CreateAsync(product, null);
            var productResult = createdProduct.ToProductDto();
            return CreatedAtAction("GetById", new { id = productResult.ProductId }, productResult);
        }

        // PUT: api/product/{id}
        [Authorize(Policy = "RequireSuperUser")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProduct([FromRoute] int id, [FromForm] ProductDto productDto)
        {
            // Validation (same as AddProduct)
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

            var categoryExists = await _context.ProductCategories.AnyAsync(c => c.CategoryId == productDto.CategoryId);
            if (!categoryExists)
                return BadRequest("The specified category does not exist.");

            // Check if product exists before updating
            var existingProduct = await _productRepo.GetByIdAsync(id);
            if (existingProduct == null)
                return NotFound("Product not found.");

            // Update the product details
            existingProduct.ProductName = productDto.ProductName;
            existingProduct.ProductDescription = productDto.ProductDescription;
            existingProduct.UnitPrice = productDto.UnitPrice;
            existingProduct.Available = productDto.Available;
            existingProduct.Quantity = productDto.Quantity;
            existingProduct.CategoryId = productDto.CategoryId;

            // If a new image is provided (Cloudinary URL), update it
            if (!string.IsNullOrEmpty(productDto.ProductImage))
            {
                existingProduct.ProductImage = productDto.ProductImage; // New image URL
            }

            // Save the changes
            await _context.SaveChangesAsync();

            return Ok(new { message = "Product successfully updated.", product = existingProduct });
        }
        // POST: api/product/release/{id}
        [HttpPost("release/{id}")]
        public async Task<IActionResult> ReleaseReservedProduct([FromRoute] int id, [FromBody] ReserveRequestDto request)
        {
            if (request.Quantity <= 0)
                return BadRequest("Quantity to release must be greater than zero.");

            var product = await _productRepo.GetByIdAsync(id);

            if (product == null)
                return NotFound("Product not found.");

            product.Quantity += request.Quantity;

            // Optionally mark available again
            if (product.Available == "no" && product.Quantity > 0)
                product.Available = "yes";

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = $"Released {request.Quantity} unit(s) of '{product.ProductName}'.",
                updatedStock = product.Quantity
            });
        }

        // POST: api/product/reserve/{id}
        [HttpPost("reserve/{id}")]
        public async Task<IActionResult> ReserveProductQuantity([FromRoute] int id, [FromBody] ReserveRequestDto request)
        {
            if (request.Quantity <= 0)
                return BadRequest("Quantity to reserve must be greater than zero.");

            var product = await _productRepo.GetByIdAsync(id);

            if (product == null)
                return NotFound("Product not found.");

            if (product.Available == "no" || product.Quantity < request.Quantity)
                return BadRequest($"Only {product.Quantity} unit(s) of '{product.ProductName}' available.");

            // Subtract the reserved quantity
            product.Quantity -= request.Quantity;

            // Optionally, mark it unavailable if quantity hits zero
            if (product.Quantity == 0)
                product.Available = "no";

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = $"Reserved {request.Quantity} unit(s) of '{product.ProductName}'.",
                remainingStock = product.Quantity
            });
        }



    }
}
