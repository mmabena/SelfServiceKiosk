using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using api.Data; 
using api.Models; 
using api.Dtos; 


namespace api.Controllers
{
    [Route("api/productcategory")]
    [ApiController]
    public class ProductCategoryController : ControllerBase
    {
        private readonly ApplicationDBContext _context;

        // Constructor for injecting ApplicationDBContext
        public ProductCategoryController(ApplicationDBContext context)
        {
            _context = context;
        }

        // GET: api/productcategory
        // Fetch all product categories
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var categories = await _context.ProductCategories
                                .ToListAsync();

            var categoryDtos = categories.Select(c => c.ToProductCategoryDto()).ToList();

            return Ok(categoryDtos);  // Return the list of categories as DTOs

        }

        // GET: api/productcategory/{id}
        // Fetch a specific product category by ID
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById([FromRoute] int id)
        {
            var category = await _context.ProductCategories
                .FirstOrDefaultAsync(c => c.CategoryId == id)
                .ConfigureAwait(false);

            if (category == null)
            {
                return NotFound("Product Category not found.");
            }

            return Ok(category.ToProductCategoryDto()); // Return the category DTO
        }

        // POST: api/productcategory
        // Create a new product category
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ProductCategoryDto categoryDto)
        {
            if (categoryDto == null)
            {
                return BadRequest("Invalid data.");
            }

            // Check if category already exists by name (optional)
            var existingCategory = await _context.ProductCategories
                .FirstOrDefaultAsync(c => c.CategoryName == categoryDto.CategoryName)
                .ConfigureAwait(false);

            if (existingCategory != null)
            {
                return BadRequest("Category with this name already exists.");
            }

            // Create a new ProductCategory entity
            var category = new ProductCategory
            {
                CategoryName = categoryDto.CategoryName
            };

            // Add to the context
            _context.ProductCategories.Add(category);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetById", new { id = category.CategoryId }, category.ToProductCategoryDto()); // Return created category as DTO
        }

        // PUT: api/productcategory/{id}
        // Update an existing product category
        [HttpPut("{id}")]
        public async Task<IActionResult> Update([FromRoute] int id, [FromBody] ProductCategoryDto categoryDto)
        {
            if (categoryDto == null)
            {
                return BadRequest("Invalid data.");
            }

            // Find the category by ID
            var category = await _context.ProductCategories
                .FirstOrDefaultAsync(c => c.CategoryId == id)
                .ConfigureAwait(false);

            if (category == null)
            {
                return NotFound("Product Category not found.");
            }

            // Update the category
            category.CategoryName = categoryDto.CategoryName;

            // Save changes to the database
            await _context.SaveChangesAsync();

            return Ok("Product Category successfully updated.");
        }

        // DELETE: api/productcategory/{id}
        // Delete a product category by ID
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete([FromRoute] int id)
        {
            var category = await _context.ProductCategories
                .FirstOrDefaultAsync(c => c.CategoryId == id)
                .ConfigureAwait(false);

            if (category == null)
            {
                return NotFound("Product Category not found.");
            }

            // Remove the category from the context
            _context.ProductCategories.Remove(category);
            await _context.SaveChangesAsync();

            return Ok("Product Category successfully deleted.");
        }
    }
}
