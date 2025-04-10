using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace api.Dtos
{
    public class WalletDto
    {
        public int UserId { get; set; }
        public decimal Balance { get; set; }

        // Optionally, include the user's information (if required)
        public UserDto User { get; set; }
    }
}
