using System.Linq;
using Microsoft.AspNetCore.Mvc;
using api.Data;
using api.Models;
using api.Dtos;
using api.Mapper;  // Make sure to include the Mapper

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

        // GET: api/transaction/{id}
        [HttpGet("{id}")]
        public IActionResult GetById([FromRoute] int id)
        {
            var transaction = _context.Transactions
                .Where(t => t.TransactionId == id)
                .FirstOrDefault();  // Find transaction by ID

            if (transaction == null)
            {
                return NotFound();  // Return 404 if not found
            }

            return Ok(transaction.ToTransactionDto());  // Map and return TransactionDto
        }

        // GET: api/transaction
        [HttpGet]
        public IActionResult GetAll()
        {
            var transactions = _context.Transactions
                .Select(transaction => transaction.ToTransactionDto())  // Mapping each transaction to TransactionDto
                .ToList();

            return Ok(transactions);  // Return the list of TransactionDto objects
        }
    }
}
