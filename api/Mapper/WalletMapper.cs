

using api.DTOs;
using api.Models;


namespace api.Mapper
{
    public static class WalletMapper
    {
        public static WalletDto ToWalletDto(this Wallet wallet)
        {
            return new WalletDto
            {
                UserId = wallet.UserId,
                Balance = wallet.Balance,
           
            };
            
        }
    }
}
