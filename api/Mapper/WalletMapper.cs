using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using api.Dtos;
using api.Models;
using Microsoft.Identity.Client;

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
