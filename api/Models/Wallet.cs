using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using api.Dtos;

namespace api.Models
{
    public class Wallet
    {
        public int UserId { get; set; }
        public decimal Balance { get; set; }
        public User Users { get; set; }

        // Map Wallet to WalletDto
       
    }
}
