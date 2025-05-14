using Microsoft.AspNetCore.Mvc;
using api.Data;
using api.Mapper;
using Microsoft.EntityFrameworkCore;  // Ensure the Mapper is included

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

        [HttpGet("{id}")]
        public IActionResult GetCartById(int id)
        {
            var cart = _context.Carts
                               .Include(c => c.Users)  // Eagerly load the related User
                               .Include(c => c.Transactions)  // Eagerly load the related Transaction
                               .FirstOrDefault(c => c.CartId == id);

            if (cart == null)
            {
                return NotFound();
            }

            return Ok(cart.ToCartDto());  // Map to CartDto
        }
//      [HttpPost("checkout")]
// public IActionResult Checkout([FromBody] CheckoutRequest request)
// {
//     var user = _context.Users.FirstOrDefault(u => u.UserId == request.UserId);
//     if (user == null) return BadRequest("User not found.");

//     var cart = _context.Carts
//         .Where(c => c.UserId == user.UserId && c.TransactionId == 0)
//         .OrderByDescending(c => c.DateCreated)
//         .FirstOrDefault();

//     if (cart == null) return BadRequest("Cart not found.");

//     var cartProducts = _context.CartProducts
//         .Where(cp => cp.CartId == cart.CartId)
//         .ToList();

//     if (!cartProducts.Any())
//         return BadRequest("Cart is empty.");

//     decimal totalCost = 0;
//     var stockErrors = new List<string>();

//     foreach (var cp in cartProducts)
//     {
//         var product = _context.Products.FirstOrDefault(p => p.ProductId == cp.ProductId);
//         if (product == null || product.Stock < cp.Quantity)
//         {
//             stockErrors.Add($"Product '{product?.ProductName ?? "Unknown"}' is out of stock.");
//             continue;
//         }

//         totalCost += product.Price * cp.Quantity;
//     }

//     if (stockErrors.Any())
//         return BadRequest(new { message = "Insufficient stock", errors = stockErrors });

//     if (user.WalletBalance < totalCost)
//         return BadRequest(new { message = "Insufficient wallet balance." });

//     user.WalletBalance -= totalCost;

//     foreach (var cp in cartProducts)
//     {
//         var product = _context.Products.First(p => p.ProductId == cp.ProductId);
//         product.Stock -= cp.Quantity;
//     }

//     var transaction = new Transaction
//     {
//         UserId = user.UserId,
//         TransactionDate = DateTime.UtcNow,
//         OrderType = request.DeliveryMethod
//     };

//     _context.Transactions.Add(transaction);
//     _context.SaveChanges();

//     cart.TransactionId = transaction.TransactionId;
//     _context.SaveChanges();

//     return Ok(new { message = "Checkout completed successfully!" });
// }

    }
}
