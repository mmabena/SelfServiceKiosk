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
    // Don't reupload to Cloudinary, just use the passed ProductImage
    if (string.IsNullOrEmpty(productModel.ProductImage))
    {
        productModel.ProductImage = "https://example.com/default-image.jpg";
    }

    await _context.Products.AddAsync(productModel);
    await _context.SaveChangesAsync();

    return productModel;
}



 public async Task<Product?> UpdateAsync(int id, ProductDto productDto)
{
    var product = await _context.Products.FirstOrDefaultAsync(x => x.ProductId == id);
    if (product == null)
        return null;

    // Update product details
    product.ProductName = productDto.ProductName;
    product.ProductDescription = productDto.ProductDescription;
    product.UnitPrice = productDto.UnitPrice;
    product.Available = productDto.Available;
    product.Quantity = productDto.Quantity;
    product.CategoryId = productDto.CategoryId;

    // Only update the image if a new URL is provided, otherwise keep the existing one
    if (!string.IsNullOrEmpty(productDto.ProductImage))
    {
        product.ProductImage = productDto.ProductImage;
    }

    await _context.SaveChangesAsync();
    return product;
}


        }
    }

