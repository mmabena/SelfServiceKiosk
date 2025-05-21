using Microsoft.AspNetCore.Mvc;
using api.Data;
using api.Models;
using api.DTOs;
using Microsoft.EntityFrameworkCore;


namespace api.Controllers
{
    [Route("api/transaction")]
    [ApiController]
    public class TransactionController : ControllerBase
    {
        private readonly ApplicationDBContext _context;

        // Constructor for injecting ApplicationDBContext
        public TransactionController(ApplicationDBContext context)
        {
            _context = context;
        }

        // POST: api/transaction/checkout
        [HttpPost("checkout")]
        public IActionResult Checkout([FromBody] CheckoutRequestDto request)
        {
            try
            {
                // Step 1: Retrieve the user from the database
                var user = _context.Users.Find(request.UserId);
                if (user == null)
                    return BadRequest("User not found.");

                // Step 2: Retrieve the user's active cart (the one with TransactionId = 0)
                var cart = _context.Carts
                    .Include(c => c.CartProducts)
                        .ThenInclude(cp => cp.Product)
                    .FirstOrDefault(c => c.UserId == user.UserId && c.TransactionId == 0); // Active cart, no transaction yet

                if (cart == null)
                    return BadRequest("No active cart found.");
                if (!cart.CartProducts.Any())
                    return BadRequest("Cart is empty.");

                // Step 3: Calculate the total cost and check product availability
                decimal totalCost = 0;
                var errors = new List<string>();

                foreach (var cp in cart.CartProducts)
                {
                    if (cp.Product == null || cp.Product.Quantity < cp.Quantity)
                    {
                        errors.Add($"Insufficient stock for {cp.Product?.ProductName ?? "Unknown"}.");
                        continue; // Skip to next product
                    }
                    totalCost += cp.Product.UnitPrice * cp.Quantity;
                }

                if (errors.Any())
                    return BadRequest(new { message = "Stock errors", errors });

                // Step 4: Check the user's wallet balance
                var wallet = _context.Wallets.FirstOrDefault(w => w.UserId == user.UserId);
                if (wallet == null)
                    return BadRequest("User wallet not found.");

                if (wallet.Balance < totalCost)
                    return BadRequest("Insufficient wallet balance.");

                // Step 5: Deduct the total cost from the wallet balance
                wallet.Balance -= totalCost;

                // Step 6: Reserve the stock for the products (similar to stock reservation in the frontend logic)
                foreach (var cp in cart.CartProducts)
                {
                    cp.Product.Quantity -= cp.Quantity; // Decrease product quantity based on the cart quantity
                }

                // Step 7: Create a new transaction
                var transaction = new Transaction
                {
                    UserId = user.UserId,
                    TransactionDate = DateTime.UtcNow,
                    OrderType = request.DeliveryMethod, // "A" for Pickup, "B" for Delivery
                    TotalAmount = totalCost
                };

                _context.Transactions.Add(transaction);
                _context.SaveChanges();

                // Step 8: Link the transaction to the cart
                cart.TransactionId = transaction.TransactionId;
                _context.SaveChanges();

                // Step 9: Return the updated wallet balance and transaction details
                return Ok(new 
                { 
                    message = "Checkout successful.",
                    updatedWalletBalance = wallet.Balance,
                    transactionId = transaction.TransactionId
                });
            }
            catch (Exception ex)
            {
                // Log exception (if required)
                return StatusCode(500, new { message = "Internal server error.", details = ex.Message });
            }
        }
    }
}
