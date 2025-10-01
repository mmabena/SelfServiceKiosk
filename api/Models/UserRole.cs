

namespace api.Models
{
   public class UserRole
     {
        public int UserRoleId { get; set; } 
        public string RoleName { get; set; } = string.Empty;
        public ICollection<User> Users { get; set; }
    }
}