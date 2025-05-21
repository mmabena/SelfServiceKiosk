
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using api.DTOs;
using api.Data;
using api.Models;


namespace api.Controllers
{
    [Route("api/wallet")]
    [ApiController]
     
        
    public class WalletController:ControllerBase
    {    private readonly ApplicationDBContext _context;
           public WalletController(ApplicationDBContext context)
        {
            _context = context;
          
        }
        
[HttpPost("add")]
public async Task<IActionResult> AddToWallet([FromBody] WalletDto dto)
{
    if (dto == null)
        return BadRequest("Missing request body.");

    if (dto.Balance > 1000 || dto.Balance <= 0)
        return BadRequest("Amount must be between R0.01 and R1000.");

    var wallet = await _context.Wallets.FirstOrDefaultAsync(w => w.UserId == dto.UserId);

    if (wallet == null)
    {
        // Create a new wallet
        wallet = new Wallet
        {
            UserId = dto.UserId,
            Balance = dto.Balance
        };
        _context.Wallets.Add(wallet);
    }
    else
    {
        // Update existing wallet
        wallet.Balance += dto.Balance;
    }

    await _context.SaveChangesAsync();

    return Ok(new { balance = wallet.Balance });
}


               
   [HttpGet("{userId}")]
public async Task<IActionResult> GetWalletByUserId(int userId)
{
    var wallet = await _context.Wallets.FirstOrDefaultAsync(w => w.UserId == userId);
    if (wallet == null)
        return NotFound(new { message = "Wallet not found." }); // ✅ Return a JSON object

    return Ok(new { balance = wallet.Balance });
}





    }
}