using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using api.Data;
using api.Models;
using api.DTOs;

namespace api.Controllers
{
    [Route("api/cart")]
    [ApiController]
    public class CartController : ControllerBase
    {
        private readonly ApplicationDBContext _context;

        public CartController(ApplicationDBContext context)
        {
            _context = context;
        }

        // Get cart by CartId
        [HttpGet("{id}")]
        public async Task<IActionResult> GetCartByIdAsync(int id)
        {
            var cart = await _context.Carts
                .Include(c => c.CartProducts)
                    .ThenInclude(cp => cp.Product)
                .Include(c => c.Transaction)
                .FirstOrDefaultAsync(c => c.CartId == id);

            return cart == null ? NotFound("Cart not found.") : Ok(cart);
        }

        // Get active cart for a user
        [HttpGet("active/{userId}")]
        public async Task<IActionResult> GetActiveCartAsync(int userId)
        {
            var cart = await _context.Carts
                .Include(c => c.CartProducts)
                    .ThenInclude(cp => cp.Product)
                .FirstOrDefaultAsync(c => c.UserId == userId && c.TransactionId == 0); // Active cart without transaction

            return cart == null
                ? BadRequest(new { message = "No active cart found." })
                : Ok(cart);
        }
[HttpPost("addProduct")]
public async Task<IActionResult> AddProductToCartAsync([FromBody] CartProductDto request)
{
    // Validate if the request data is valid
    if (request?.CartId == 0 || request?.ProductId == 0 || request?.Quantity <= 0)
        return BadRequest("Invalid cart or product information provided.");

    // Fetch the cart from the database
    var cart = await _context.Carts
                              .Include(c => c.CartProducts)
                              .FirstOrDefaultAsync(c => c.CartId == request.CartId);

    if (cart == null)
        return BadRequest("Cart not found.");

    // Fetch the product from the database to validate it exists
    var product = await _context.Products.FindAsync(request.ProductId);
    if (product == null)
        return BadRequest("Product not found.");

    // Check if the product already exists in the cart
    var existingCartProduct = cart.CartProducts
                                  .FirstOrDefault(cp => cp.ProductId == request.ProductId);

    if (existingCartProduct != null)
    {
        // If the product exists in the cart, just update the quantity
        existingCartProduct.Quantity += request.Quantity;
    }
    else
    {
        // If the product doesn't exist in the cart, add a new cart product
        var newCartProduct = new CartProduct
        {
            CartId = request.CartId,
            ProductId = request.ProductId,
            Quantity = request.Quantity
        };
        cart.CartProducts.Add(newCartProduct);
    }

    // Save changes to the database
    await _context.SaveChangesAsync();

    // Return a response with the updated cart product information
    var cartProductDto = new CartProductDto
    {
        CartProductId = cart.CartProducts.Last().CartProductId,  // Access the CartProductId from the last item in the CartProducts collection
        CartId = cart.CartId,
        ProductId = request.ProductId,
        Quantity = request.Quantity
    };

    return Ok(cartProductDto);  // Respond with the added/updated cart product info
}


        // Update product quantity in cart
        [HttpPut("update-product-quantity")]
        public async Task<IActionResult> UpdateProductQuantityAsync([FromBody] Dictionary<string, object> body)
        {
            if (!body.ContainsKey("userId") || !body.ContainsKey("productId") || !body.ContainsKey("quantity"))
                return BadRequest("Missing required fields: userId, productId, or quantity.");

            int userId = Convert.ToInt32(body["userId"]);
            int productId = Convert.ToInt32(body["productId"]);
            int quantity = Convert.ToInt32(body["quantity"]);

            if (quantity <= 0)
                return BadRequest("Quantity must be greater than 0.");

            var user = await _context.Users.FindAsync(userId);
            if (user == null) return BadRequest("User not found.");

            var cart = await _context.Carts
                .Include(c => c.CartProducts)
                .FirstOrDefaultAsync(c => c.UserId == userId && c.TransactionId == 0);

            if (cart == null)
                return BadRequest("No active cart found.");

            var cartProduct = cart.CartProducts.FirstOrDefault(cp => cp.ProductId == productId);
            if (cartProduct == null)
                return BadRequest("Product not found in cart.");

            var product = await _context.Products.FindAsync(productId);
            if (product == null || product.Quantity < quantity)
                return BadRequest("Insufficient stock available.");

            // Update the quantity
            cartProduct.Quantity = quantity;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Product quantity updated." });
        }

        // Remove product from cart
        [HttpDelete("remove-product")]
        public async Task<IActionResult> RemoveProductFromCartAsync([FromBody] Dictionary<string, object> body)
        {
            if (!body.ContainsKey("userId") || !body.ContainsKey("productId"))
                return BadRequest("Missing required fields: userId or productId.");

            int userId = Convert.ToInt32(body["userId"]);
            int productId = Convert.ToInt32(body["productId"]);

            var user = await _context.Users.FindAsync(userId);
            if (user == null) return BadRequest("User not found.");

            var cart = await _context.Carts
                .Include(c => c.CartProducts)
                .FirstOrDefaultAsync(c => c.UserId == userId && c.TransactionId == 0);

            if (cart == null)
                return BadRequest("No active cart found.");

            var cartProduct = cart.CartProducts.FirstOrDefault(cp => cp.ProductId == productId);
            if (cartProduct == null)
                return BadRequest("Product not found in cart.");

            cart.CartProducts.Remove(cartProduct);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Product removed from cart." });
        }

      [HttpPost("create")]
public async Task<IActionResult> CreateCartAsync([FromBody] CreateCartDto request)
{
    // Validate if the UserId exists in the request body
    if (request?.UserId == 0)
        return BadRequest("Invalid user information provided.");

    // Fetch the user from the database based on the UserId
    var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == request.UserId);
    if (user == null)
        return BadRequest("User not found.");

    // Create a new cart, using the UserId from the request DTO
    var cart = new Cart
    {
        UserId = request.UserId,
        DateCreated = DateTime.UtcNow, // Automatically set DateCreated to current date and time
        CartProducts = new List<CartProduct>() // Start with an empty cart
    };

    // Add the new cart to the database
    _context.Carts.Add(cart);
    await _context.SaveChangesAsync();

    // Return the created cart DTO with just the required fields
    return Ok(new CreateCartDto
    {
        CartId = cart.CartId,
        DateCreated = cart.DateCreated,
        UserId = user.UserId // Only return the UserId
    });
}

    }
}
