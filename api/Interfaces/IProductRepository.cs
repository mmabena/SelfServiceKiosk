using System.Collections.Generic;
using System.Threading.Tasks;
using api.Dtos;
using api.Models;
using Microsoft.AspNetCore.Http;

namespace api.Interfaces
{
    public interface IProductRepository
    {
        /// <summary>
        /// Retrieves all products from the database.
        /// </summary>
        Task<List<Product>> GetAllAsync();

        /// <summary>
        /// Retrieves a product by its ID.
        /// </summary>
        Task<Product?> GetByIdAsync(int id);

        /// <summary>
        /// Creates a new product and optionally uploads an image file to Cloudinary.
        /// </summary>
        /// <param name="productModel">The product model to be created.</param>
        /// <param name="imageFile">Optional image file to upload.</param>
        Task<Product> CreateAsync(Product productModel, IFormFile? imageFile);

        /// <summary>
        /// Updates an existing product. Optionally updates the image if a file is provided.
        /// </summary>
        /// <param name="id">The product ID to update.</param>
        /// <param name="productDto">DTO containing updated product data.</param>
        /// <param name="imageFile">Optional image file to upload.</param>
        Task<Product?> UpdateAsync(int id, ProductDto productDto, IFormFile? imageFile = null);

        /// <summary>
        /// Deletes a product by its ID.
        /// </summary>
        Task<Product?> DeleteAsync(int id);

        /// <summary>
        /// Retrieves products by category name.
        /// </summary>
        Task<List<Product>> GetByCategoryAsync(string category);
    }
}
