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
using api.Interfaces;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;

namespace api.Controllers
{
    [Route("api/product")]
    [ApiController]
    public class ProductController : ControllerBase
    {
        private readonly Cloudinary _cloudinary;
        private readonly IProductRepository _productRepo;
        private readonly ApplicationDBContext _context;
        private readonly string _imageUploadPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "ProductImages");

        public ProductController(ApplicationDBContext context, IProductRepository productRepo,Cloudinary cloudinary)
        {
            _context = context;
            _productRepo = productRepo;
             _cloudinary = cloudinary;
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

    return Ok(productDtos);
}

        // Generate image URL
   private static string GetImageUrl(string imageName)
{
    // Cloudinary URL format
    string cloudinaryBaseUrl = "https://res.cloudinary.com/djmafre5k/image/upload/";

    // Assuming that the image name includes the version and other parameters (e.g., after upload to Cloudinary).
    // If your imageName is something like 'image_123.jpg', update accordingly.
    return $"{cloudinaryBaseUrl}{imageName}";
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
        ProductImage = p.ProductImage // Cloudinary URL already stored in DB
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
public async Task<IActionResult> AddProduct([FromForm] ProductDto productDto, IFormFile? imageFile)
{
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

    string? imageUrl = null;

    if (imageFile != null && imageFile.Length > 0)
    {
        var uploadParams = new ImageUploadParams
        {
            File = new FileDescription(imageFile.FileName, imageFile.OpenReadStream()),
            Folder = "ProductImages",
            UseFilename = true,
            UniqueFilename = true,
            Overwrite = false
        };

        var uploadResult = await _cloudinary.UploadAsync(uploadParams);

        if (uploadResult.StatusCode == System.Net.HttpStatusCode.OK)
        {
            imageUrl = uploadResult.SecureUrl.ToString(); // ✅ Cloudinary image URL
        }
        else
        {
            return BadRequest("Failed to upload image to Cloudinary.");
        }
    }

    var product = new Product
    {
        ProductName = productDto.ProductName,
        ProductDescription = productDto.ProductDescription,
        UnitPrice = productDto.UnitPrice,
        Available = productDto.Available,
        Quantity = productDto.Quantity,
        ProductImage = imageUrl,
        CategoryId = productDto.CategoryId
    };

    await _productRepo.CreateAsync(product, null); // Image already uploaded

    var productResult = product.ToProductDto();
    productResult.ProductImage = product.ProductImage;

    return CreatedAtAction("GetById", new { id = product.ProductId }, productResult);
}

// PUT: api/product/{id}
[Authorize(Policy = "RequireSuperUser")]
[HttpPut("{id}")]
public async Task<IActionResult> UpdateProduct([FromRoute] int id, [FromForm] ProductDto productDto, IFormFile? imageFile)
{
    var product = await _productRepo.GetByIdAsync(id);
    if (product == null)
        return NotFound("Product not found.");

    product.ProductName = productDto.ProductName;
    product.ProductDescription = productDto.ProductDescription;
    product.UnitPrice = productDto.UnitPrice;
    product.Available = productDto.Available;
    product.Quantity = productDto.Quantity;
    product.CategoryId = productDto.CategoryId;

    if (imageFile != null && imageFile.Length > 0)
    {
        var uploadParams = new ImageUploadParams
        {
            File = new FileDescription(imageFile.FileName, imageFile.OpenReadStream()),
            Folder = "ProductImages",
            UseFilename = true,
            UniqueFilename = true,
            Overwrite = false
        };

        var uploadResult = await _cloudinary.UploadAsync(uploadParams);

        if (uploadResult.StatusCode == System.Net.HttpStatusCode.OK)
        {
            product.ProductImage = uploadResult.SecureUrl.ToString();
        }
        else
        {
            return BadRequest("Failed to upload image to Cloudinary.");
        }
    }

    await _productRepo.UpdateAsync(id, productDto, null); // Don't pass the image file again

    return Ok("Product successfully updated.");
}
    }
}
