using System.ComponentModel.DataAnnotations.Schema;

namespace api.Models
{
  [Table("UserRoles")]
   public class UserRole
  {
    public int UserRoleId { get; set; }
    public string RoleName { get; set; } = string.Empty;
    public ICollection<User> Users { get; set; }
  }
}