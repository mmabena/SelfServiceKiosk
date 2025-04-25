using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using api.Data;
using api.Models;
using api.Dtos;
using api.Interfaces;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using System.Net;

namespace api.Repository
{
    public class ProductRepository : IProductRepository
    {
        private readonly ApplicationDBContext _context;
        private readonly Cloudinary _cloudinary;
        private readonly ILogger<ProductRepository> _logger;

        public ProductRepository(ApplicationDBContext context, Cloudinary cloudinary, ILogger<ProductRepository> logger)
        {
            _context = context;
            _cloudinary = cloudinary;
            _logger = logger;
        }

        public async Task<List<Product>> GetAllAsync()
        {
            return await _context.Products.ToListAsync();
        }

        public async Task<Product?> GetByIdAsync(int id)
        {
            return await _context.Products.FindAsync(id);
        }

        public async Task<Product?> DeleteAsync(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
                return null;

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();
            return product;
        }

        public async Task<List<Product>> GetByCategoryAsync(string category)
        {
            return await _context.Products
                .Where(p => p.ProductCategories.CategoryName.ToLower() == category.ToLower())
                .ToListAsync();
        }

public async Task<Product> CreateAsync(Product productModel, IFormFile? imageFile)
{
    string? imageUrl = null;

    // Only attempt image upload if an image file is provided
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

        if (uploadResult.StatusCode == HttpStatusCode.OK)
        {
            imageUrl = uploadResult.SecureUrl.ToString();
            Console.WriteLine("Image URL after upload: " + imageUrl); // Debugging image URL
        }
        else
        {
            throw new Exception("Image upload to Cloudinary failed.");
        }
    }

    // If no image was uploaded, assign a default placeholder image
    if (string.IsNullOrEmpty(imageUrl))
    {
        imageUrl = "https://example.com/default-image.jpg"; // Use a placeholder if no image is uploaded
    }

    productModel.ProductImage = imageUrl; // Set the ProductImage URL

    // Save the product to the database
    await _context.Products.AddAsync(productModel);
    await _context.SaveChangesAsync();

    Console.WriteLine("Product saved with Image URL: " + productModel.ProductImage); // Log the image URL after saving
    return productModel;
}



        public async Task<Product?> UpdateAsync(int id, ProductDto productDto, IFormFile? imageFile = null)
        {
            var product = await _context.Products.FirstOrDefaultAsync(x => x.ProductId == id);
            if (product == null)
                return null;

            product.ProductName = productDto.ProductName;
            product.ProductDescription = productDto.ProductDescription;
            product.UnitPrice = productDto.UnitPrice;
            product.Available = productDto.Available;
            product.Quantity = productDto.Quantity;
            product.CategoryId = productDto.CategoryId;

            if (imageFile != null)
            {
                var imageUrl = await UploadImageOrDefault(imageFile);
                product.ProductImage = imageUrl;
            }

            await _context.SaveChangesAsync();
            return product;
        }

        private async Task<string> UploadImageOrDefault(IFormFile? imageFile)
        {
            // If no file is provided, return a default image URL
            if (imageFile == null || imageFile.Length == 0)
            {
                _logger.LogWarning("No image file was provided for upload.");
                return "https://res.cloudinary.com/djmafre5k/image/upload/v1714000000/default-product.jpg";  // Fallback image
            }

            // Upload the image to Cloudinary if a file is provided
            var uploadResult = await UploadImageToCloudinary(imageFile);
            return uploadResult?.SecureUrl.ToString() ?? "https://res.cloudinary.com/djmafre5k/image/upload/v1714000000/default-product.jpg";
        }

        private async Task<ImageUploadResult?> UploadImageToCloudinary(IFormFile imageFile)
        {
            try
            {
                if (imageFile == null || imageFile.Length == 0)
                {
                    _logger.LogWarning("No image file was provided for upload.");
                    return null;
                }

                // Optional: Check content type
                var validTypes = new[] { "image/jpeg", "image/png", "image/webp" };
                if (!validTypes.Contains(imageFile.ContentType.ToLower()))
                {
                    _logger.LogWarning("Invalid image type: {ContentType}", imageFile.ContentType);
                    return null;
                }

                await using var stream = imageFile.OpenReadStream();
                var uploadParams = new ImageUploadParams
                {
                    File = new FileDescription(imageFile.FileName, stream),
                    Folder = "ProductImages",
                    UseFilename = true,
                    UniqueFilename = true,
                    Overwrite = false
                };

                var result = await _cloudinary.UploadAsync(uploadParams);

                if (result.StatusCode != System.Net.HttpStatusCode.OK)
                {
                    _logger.LogError("Cloudinary upload failed. Status: {Status}, Error: {Error}",
                        result.StatusCode, result.Error?.Message);
                    return null;
                }

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception occurred while uploading image to Cloudinary.");
                return null;
            }
        }
    }
}
