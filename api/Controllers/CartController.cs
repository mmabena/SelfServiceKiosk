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
        private readonly ILogger<CartController> _logger;


        public CartController(ApplicationDBContext context,ILogger<CartController> logger)
        {
            _context = context;
              _logger = logger;
        }
        // Get cart by CartId
 [HttpGet("{cartId}")]
public async Task<IActionResult> GetCartByIdAsync(int cartId)
{
    var cart = await _context.Carts
        .Include(c => c.CartProducts)
            .ThenInclude(cp => cp.Product)
        .Include(c => c.Transaction)
        .Include(c => c.User)
            .ThenInclude(u => u.Wallet)
        .FirstOrDefaultAsync(c => c.CartId == cartId);

    if (cart == null)
        return NotFound("Cart not found.");

    var cartDto = new CartDto
    {
        CartId = cart.CartId,
        DateCreated = cart.DateCreated,

        Transaction = cart.Transaction == null ? null : new TransactionDto
        {
            TransactionId = cart.Transaction.TransactionId,
            TotalAmount = cart.Transaction.TotalAmount,
            TransactionDate = cart.Transaction.TransactionDate,
            OrderType = cart.Transaction.OrderType
        },

        User = cart.User == null ? null : new UserDto
        {
            UserId = cart.User.UserId,
            Username = cart.User.Username,
            FirstName = cart.User.FirstName,
            LastName = cart.User.LastName,
            Email = cart.User.Email,
          
            Wallet = cart.User.Wallet == null ? null : new WalletDto
            {
                UserId = cart.User.Wallet.UserId,
                Balance = cart.User.Wallet.Balance
            }
        },

        CartProducts = cart.CartProducts?.Select(cp => new CartProductDto
        {
            CartProductId = cp.CartProductId,
            CartId = cp.CartId,
            ProductId = cp.ProductId,
            Quantity = cp.Quantity,
            Product = cp.Product == null ? null : new ProductDto
            {
                ProductId = cp.Product.ProductId,
                ProductName = cp.Product.ProductName,
                ProductDescription = cp.Product.ProductDescription,
                UnitPrice = cp.Product.UnitPrice,
                Available = cp.Product.Available,
                Quantity = cp.Product.Quantity,
                ProductImage = cp.Product.ProductImage,
                CategoryId = cp.Product.CategoryId,
                IsActive = cp.Product.IsActive
            }
        }).ToList()
    };

    return Ok(cartDto);
}

        // Get active cart for a user
        [HttpGet("active/{userId}")]
        public async Task<IActionResult> GetActiveCartAsync(int userId)
        {
            var cart = await _context.Carts
                .Include(c => c.CartProducts)
                    .ThenInclude(cp => cp.Product)
                .FirstOrDefaultAsync(c => c.UserId == userId && c.TransactionId == null);

            return cart == null
                ? BadRequest(new { message = "No active cart found." })
                : Ok(cart);
        }

        // Add product to cart with one CartProductId for all products
[HttpPost("addProduct")]
public async Task<IActionResult> AddProductToCartAsync([FromBody] CartProductDto request)
{
    if (request == null || request.CartId == 0 || request.ProductId == 0 || request.Quantity <= 0)
        return BadRequest("Invalid cart or product information provided.");

    // Load cart including its products
    var cart = await _context.Carts
                             .Include(c => c.CartProducts)
                             .FirstOrDefaultAsync(c => c.CartId == request.CartId);

    if (cart == null)
        return BadRequest("Cart not found.");

    // Find the product
    var product = await _context.Products.FindAsync(request.ProductId);
    if (product == null)
        return BadRequest("Product not found.");

    // Check stock availability
     if (product.Quantity < request.Quantity)
       return BadRequest("Insufficient stock for the requested product quantity.");

    // Check if product is already in the cart
    var existingCartProduct = cart.CartProducts.FirstOrDefault(cp => cp.ProductId == request.ProductId);

    if (existingCartProduct == null)
    {
        var newCartProduct = new CartProduct
        {
            CartProductId = request.CartProductId,
            CartId = request.CartId,
            ProductId = request.ProductId,
            Quantity = request.Quantity
            // CartProductId is auto-generated
        };

        _context.CartProducts.Add(newCartProduct);
        await _context.SaveChangesAsync();

        return Ok(new { CartId = request.CartId, ProductId = request.ProductId, Quantity = request.Quantity });
    }
    else
    {
        existingCartProduct.Quantity += request.Quantity;

        await _context.SaveChangesAsync();

        return Ok(new { CartId = request.CartId, ProductId = request.ProductId, Quantity = existingCartProduct.Quantity });
    }
}


        // Update product quantity in cart
     [HttpPut("update-product-quantity")]
public async Task<IActionResult> UpdateProductQuantityAsync([FromBody] UpdateCartProductQuantityDto dto)
{
    if (dto.Quantity <= 0)
        return BadRequest("Quantity must be greater than 0.");

    var user = await _context.Users.FindAsync(dto.UserId);
    if (user == null)
        return BadRequest("User not found.");

    var cart = await _context.Carts
        .Include(c => c.CartProducts)
        .ThenInclude(cp => cp.Product)
        .FirstOrDefaultAsync(c => c.UserId == dto.UserId && c.TransactionId == null);

    if (cart == null)
        return BadRequest("No active cart found.");

    var cartProduct = cart.CartProducts.FirstOrDefault(cp => cp.ProductId == dto.ProductId);
    if (cartProduct == null)
        return BadRequest("Product not found in cart.");

    var product = cartProduct.Product;
    if (product == null || product.Quantity + cartProduct.Quantity < dto.Quantity)
    {
        return BadRequest($"Insufficient stock. Only {product.Quantity + cartProduct.Quantity} available (including current cart quantity).");
    }

    // Adjust product stock
    int stockDifference = dto.Quantity - cartProduct.Quantity;
    product.Quantity -= stockDifference;
    cartProduct.Quantity = dto.Quantity;

    await _context.SaveChangesAsync();

    return Ok(new { message = "Product quantity updated." });
}


        // Remove product from cart
[HttpDelete("remove-product")]
public async Task<IActionResult> RemoveProductFromCart([FromBody] RemoveProductRequest request)
{
    try
    {
        var cartProduct = await _context.CartProducts
            .FirstOrDefaultAsync(cp => cp.CartId == request.CartId && cp.ProductId == request.ProductId);

        if (cartProduct == null)
            return NotFound("Cart product not found.");

        _context.CartProducts.Remove(cartProduct);
        await _context.SaveChangesAsync();

        return Ok("Product removed from cart.");
    }
    catch (Exception ex)
    {
        _logger.LogError($"Error removing product: {ex.Message}");
        return StatusCode(500, "Internal server error.");
    }
}



        // Create new cart
        [HttpPost("create")]
        public async Task<IActionResult> CreateCartAsync([FromBody] CreateCartDto request)
        {
            if (request?.UserId == 0)
                return BadRequest("Invalid user information provided.");

            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == request.UserId);
            if (user == null)
                return BadRequest("User not found.");

            var cart = new Cart
            {
                UserId = request.UserId,
                DateCreated = DateTime.UtcNow,
                CartProducts = new List<CartProduct>()
            };

            _context.Carts.Add(cart);
            await _context.SaveChangesAsync();

            return Ok(new CreateCartDto
            {
                CartId = cart.CartId,
                DateCreated = cart.DateCreated,
                UserId = user.UserId
            });
        }
    }
public class RemoveProductRequest
{
    public int CartId { get; set; }
    public int ProductId { get; set; }
}
public class UpdateCartProductQuantityDto
{
    public int UserId { get; set; }
    public int ProductId { get; set; }
    public int Quantity { get; set; }
}



}
