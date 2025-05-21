

namespace api.DTOs
{
    public class UserUpdateDto
    {
          public string Username { get; set; }
        public string Password { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string Role { get; set; }  // New field for Role (optional, could default to "user")
    }
}