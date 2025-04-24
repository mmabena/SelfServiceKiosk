using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using api.Dtos;
using api.Models;
using Microsoft.AspNetCore.Http; // For IFormFile

namespace api.Interfaces
{
    public interface IProductRepository
    {
        Task<List<Product>> GetAllAsync();
        Task<Product?> GetByIdAsync(int id);
        
        // Create product method now takes an optional IFormFile for the image
        Task<Product> CreateAsync(Product productModel, IFormFile imageFile);  // Accept image file for creation
        
        // Update product method now takes an optional IFormFile for the image (to update the image if provided)
        Task<Product?> UpdateAsync(int id, ProductDto productDto, IFormFile? imageFile = null);  // Accept image file for updating
        
        Task<Product?> DeleteAsync(int id);
        Task<List<Product>> GetByCategoryAsync(string category);
    }
}
