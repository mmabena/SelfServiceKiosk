using System.Linq;
using Microsoft.AspNetCore.Mvc;
using api.Data;
using api.Models;
using api.Dtos;
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
    }
}
