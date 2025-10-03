using System.ComponentModel.DataAnnotations.Schema;

namespace api.Models
{
    [Table("Wallets")]
    public class Wallet
    {
        public int UserId { get; set; }
        public decimal Balance { get; set; }
        public User Users { get; set; }

    }
}
