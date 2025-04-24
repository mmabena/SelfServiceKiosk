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

namespace api.Repository
{
    public class ProductRepository : IProductRepository
    {
        private readonly ApplicationDBContext _context;
        private readonly Cloudinary _cloudinary;

        public ProductRepository(ApplicationDBContext context)
        {
            _context = context;

            // Initialize Cloudinary client with your Cloudinary credentials
            var account = new Account(
                "djmafre5k", 
                "365495456384483",  
                "Gvfr5zEo3JZwEFhGJLyUAj7UX74"  
            );
            _cloudinary = new Cloudinary(account);
        }

        // Create product with image uploaded to Cloudinary
        public async Task<Product> CreateAsync(Product productModel, IFormFile imageFile)
        {
            if (imageFile != null)
            {
                // Upload the image to Cloudinary
                var uploadResult = await UploadImageToCloudinary(imageFile);

                // If the upload is successful, get the secure URL of the uploaded image
                if (uploadResult != null)
                {
                    productModel.ProductImage = uploadResult.SecureUrl.ToString();
                }
            }

            await _context.Products.AddAsync(productModel);
            await _context.SaveChangesAsync();

            return productModel;
        }

        // Update product with optional image upload to Cloudinary
        public async Task<Product?> UpdateAsync(int id, ProductDto productDto, IFormFile? imageFile = null)
        {
            var existingProduct = await _context.Products.FirstOrDefaultAsync(x => x.ProductId == id);
            if (existingProduct == null)
            {
                return null;
            }

            existingProduct.ProductName = productDto.ProductName;
            existingProduct.ProductDescription = productDto.ProductDescription;
            existingProduct.UnitPrice = productDto.UnitPrice;
            existingProduct.Available = productDto.Available;
            existingProduct.Quantity = productDto.Quantity;
            existingProduct.CategoryId = productDto.CategoryId;

            // If an image is provided, upload the image to Cloudinary and update the product image URL
            if (imageFile != null)
            {
                // Upload the new image to Cloudinary
                var uploadResult = await UploadImageToCloudinary(imageFile);

                // If the upload is successful, update the product image URL
                if (uploadResult != null)
                {
                    existingProduct.ProductImage = uploadResult.SecureUrl.ToString();
                }
            }

            await _context.SaveChangesAsync();
            return existingProduct;
        }

        // Helper method to upload an image to Cloudinary
        private async Task<ImageUploadResult?> UploadImageToCloudinary(IFormFile imageFile)
        {
            try
            {
                // Convert the image to a byte array for Cloudinary upload
                using (var stream = imageFile.OpenReadStream())
                {
                    var uploadParams = new ImageUploadParams()
                    {
                        File = new FileDescription(imageFile.FileName, stream),
                        UploadPreset = "unsigned_preset", // Replace with your Cloudinary preset
                        Folder = "samples/ecommerce"      // Cloudinary folder path (optional)
                    };

                    var uploadResult = await _cloudinary.UploadAsync(uploadParams);

                    return uploadResult;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error uploading image to Cloudinary: " + ex.Message);
                return null;
            }
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
            var productModel = await _context.Products.FirstOrDefaultAsync(x => x.ProductId == id);
            if (productModel == null)
            {
                return null;
            }

            _context.Products.Remove(productModel);
            await _context.SaveChangesAsync();
            return productModel;
        }

        public async Task<List<Product>> GetByCategoryAsync(string category)
        {
            // Adjust this based on your actual Category field name and model
            return await _context.Products
                .Where(p => p.ProductCategories.CategoryName.ToLower() == category.ToLower())  // Assuming `ProductCategories` has a `CategoryName` field
                .ToListAsync();
        }
    }
}
