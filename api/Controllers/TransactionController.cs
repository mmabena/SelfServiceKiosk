using Microsoft.AspNetCore.Mvc;
using api.Data;
using api.Models;
using api.DTOs;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Collections.Generic;

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
    if (request == null || request.UserId <= 0)
        return BadRequest(new { message = "Invalid request data." });

    try
    {
        var user = _context.Users.Find(request.UserId);
        if (user == null)
            return BadRequest(new { message = "User not found." });

        var cart = _context.Carts
            .Include(c => c.CartProducts)
                .ThenInclude(cp => cp.Product)
            .FirstOrDefault(c => c.UserId == user.UserId && c.TransactionId == null);

        if (cart == null)
            return BadRequest(new { message = "No active cart found." });

        if (!cart.CartProducts.Any())
            return BadRequest(new { message = "Cart is empty." });

        decimal totalCost = 0;
        var errors = new List<string>();

        foreach (var cp in cart.CartProducts)
        {
            if (cp.Product == null || cp.Product.Quantity < cp.Quantity)
            {
                errors.Add($"Insufficient stock for {cp.Product?.ProductName ?? "Unknown"}.");
                continue;
            }

            totalCost += cp.Product.UnitPrice * cp.Quantity;
        }

        if (errors.Any())
            return BadRequest(new { message = "Stock errors", errors });

        var wallet = _context.Wallets.FirstOrDefault(w => w.UserId == user.UserId);
        if (wallet == null)
            return BadRequest(new { message = "User wallet not found." });

        if (wallet.Balance < totalCost)
            return BadRequest(new { message = "Insufficient wallet balance." });

        using (var dbTransaction = _context.Database.BeginTransaction())
        {
            try
            {
                // Deduct wallet
                wallet.Balance -= totalCost;

                // Deduct product quantities
                foreach (var cp in cart.CartProducts)
                {
                    cp.Product.Quantity -= cp.Quantity;
                }

                // Save changes to products and wallet
                _context.SaveChanges();

                // Create transaction WITH CartId assigned
                var transactionRecord = new Transaction
                {
                    UserId = user.UserId,
                    CartId = cart.CartId, // ✅ ensure FK is assigned
                    TransactionDate = DateTime.UtcNow,
                    OrderType = request.DeliveryMethod,
                    TotalAmount = totalCost
                };

                _context.Transactions.Add(transactionRecord);
                _context.SaveChanges(); // must happen before assigning TransactionId to cart

                // Link cart to transaction
                cart.TransactionId = transactionRecord.TransactionId;
                _context.SaveChanges();

                dbTransaction.Commit();

                return Ok(new
                {
                    message = "Checkout successful.",
                    updatedWalletBalance = wallet.Balance,
                    transactionId = transactionRecord.TransactionId
                });
            }
            catch (Exception ex)
            {
                dbTransaction.Rollback();
                return StatusCode(500, new { message = "An error occurred during checkout.", details = ex.Message });
            }
        }
    }
    catch (Exception ex)
    {
        return StatusCode(500, new { message = "Internal server error.", details = ex.Message });
    }
}
[HttpGet("all")]
public IActionResult GetAllTransactions()
{
    try
    {
        var transactions = _context.Transactions
            .OrderByDescending(t => t.TransactionDate)
            .Select(t => new
            {
                t.TransactionId,
                t.UserId,
                t.TransactionDate,
                t.OrderType,
                t.CartId,
                t.TotalAmount
            })
            .ToList();

        return Ok(transactions);
    }
    catch (Exception ex)
    {
        return StatusCode(500, new { message = "Internal server error.", details = ex.Message });
    }
}


// GET: api/transaction/user/{userId}
[HttpGet("user/{userId}")]
public IActionResult GetTransactionsByUser(int userId)
{
    if (userId <= 0)
        return BadRequest(new { message = "Invalid user ID." });

    try
    {
        var user = _context.Users.Find(userId);
        if (user == null)
            return NotFound(new { message = "User not found." });

        var transactions = _context.Transactions
            .Include(t => t.Cart)
                .ThenInclude(c => c.CartProducts)
                    .ThenInclude(cp => cp.Product)
            .Where(t => t.UserId == userId)
            .OrderByDescending(t => t.TransactionDate)
            .Select(t => new 
            {
              t.TransactionId,
                t.UserId,
                t.TransactionDate,
                t.OrderType,
                t.CartId,
                t.TotalAmount,
                CartProducts = t.Cart.CartProducts.Select(cp => new {
                    cp.ProductId,
                    ProductName = cp.Product.ProductName,
                    cp.Quantity,
                    UnitPrice = cp.Product.UnitPrice,
                    Subtotal = cp.Quantity * cp.Product.UnitPrice
                })
            })
            .ToList();

        return Ok(transactions);
    }
    catch (Exception ex)
    {
        return StatusCode(500, new { message = "Internal server error.", details = ex.Message });
    }
}

    }
}
