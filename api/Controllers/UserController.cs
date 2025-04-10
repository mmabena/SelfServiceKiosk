using Microsoft.AspNetCore.Mvc;
using api.Data;  //ApplicationDBContext is here
using api.Models; //User and UserDto are here
using api.Dtos; //UserRegistrationDto, UserLoginDto are here
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using BCrypt.Net; 
using System.Text.RegularExpressions;

namespace api.Controllers
{
    [Route("api/user")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly ApplicationDBContext _context;
       
        // Constructor to inject ApplicationDBContext
        public UserController(ApplicationDBContext context)
        {
            _context = context;
           
        }

        // GET: api/user
        [HttpGet]
        public IActionResult GetAll()
        {
            var users = _context.Users
                                .ToList()
                                .Select(user => user.ToUserDto()) // Mapping each User to UserDto
                                .ToList();

            return Ok(users); // Return the list of UserDto objects
        }

        // GET: api/user/{id}
        [HttpGet("{id}")]
        public IActionResult GetById([FromRoute] int id)
        {
            var user = _context.Users.Find(id);

            if (user == null)
            {
                return NotFound(); // Return 404 if user not found
            }

            return Ok(user.ToUserDto()); // Map the found user to UserDto and return
        }

       // POST: api/user/register
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] UserRegistrationDto registrationDto)
        {
            // Validate input
            if (string.IsNullOrEmpty(registrationDto.Username) || string.IsNullOrEmpty(registrationDto.Password))
            {//change this to ensure no fields are left empty
                return BadRequest("Username and password are required.");
            }

            // Password validation
            if (!IsValidPassword(registrationDto.Password))
            {
                return BadRequest("Password does not meet the required criteria. It should have at least 8 characters, including uppercase, lowercase, numbers, and special characters.");
            }

            // Check if username is already taken
            var existingUser = await _context.Users
                .FirstOrDefaultAsync(u => u.Username == registrationDto.Username);

            if (existingUser != null)
            {
                return BadRequest("Username is already taken.");
            }

            // Create a new user
            var user = new User
            {
                Username = registrationDto.Username,
                FirstName = registrationDto.FirstName,
                LastName = registrationDto.LastName,
                Email = registrationDto.Email,
                Role = string.IsNullOrEmpty(registrationDto.Role) ? "user" : registrationDto.Role // Default to 'user' role
            };

            // Hash the password using bcrypt
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(registrationDto.Password);

            // Save the new user to the database
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Return the created user (minus the password)
            return CreatedAtAction("GetById", new { id = user.UserId }, user.ToUserDto());
        }

        // Password validation logic
        private bool IsValidPassword(string password)
        {
            //validation rules
            var hasUpperCase = new Regex(@"[A-Z]");
            var hasLowerCase = new Regex(@"[a-z]");
            var hasDigit = new Regex(@"[0-9]");
            var hasSpecialChar = new Regex(@"[\W_]");
            var hasMinLength = password.Length >= 8;

            return hasUpperCase.IsMatch(password) && hasLowerCase.IsMatch(password) && 
                   hasDigit.IsMatch(password) && hasSpecialChar.IsMatch(password) && hasMinLength;
        }

        // POST: api/user/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] UserLoginDto loginDto)
        {
            // Validate input
            if (string.IsNullOrEmpty(loginDto.Username) || string.IsNullOrEmpty(loginDto.Password))
            {
                return BadRequest("Username and password are required.");
            }

            // Find the user by username
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Username == loginDto.Username);

            if (user == null)
            {
                return Unauthorized("Invalid username or password.");
            }

            // Check if the entered password matches the stored hash
            bool isPasswordValid = BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash);

            if (!isPasswordValid)
            {
                return Unauthorized("Invalid username or password.");
            }

            return Ok("Login successful.");
        }

        // ROLE-BASED AUTHORIZATION
        [Authorize(Roles = "SuperUser")]
        [HttpGet("superuser")]
        public IActionResult GetSuperUserData()
        {
            return Ok("This is superuser data.");
        }

        [Authorize(Roles = "User")]
        [HttpGet("user")]
        public IActionResult GetUserData()
        {
            return Ok("This is user data.");
        }
 // POST: api/user/update
[HttpPut("{id}")]
public async Task<IActionResult> UpdateUserData([FromRoute] int id, [FromBody] UserUpdateDto updateDto)
{
    // Find the user by ID
    var user = await _context.Users.FindAsync(id);

    // Check if the user exists
    if (user == null)
    {
        return NotFound("User not found.");
    }

    // Validate the input data (this can be expanded as needed)
    if (string.IsNullOrEmpty(updateDto.Username) || string.IsNullOrEmpty(updateDto.Email)||string.IsNullOrEmpty(updateDto.FirstName)||string.IsNullOrEmpty(updateDto.LastName))
    {
        return BadRequest("Fields cannot be left empty.");
    }

    // Update user fields with the new data
    user.Username = updateDto.Username;
    user.FirstName = updateDto.FirstName;
    user.LastName = updateDto.LastName;
    user.Email = updateDto.Email;
    user.PasswordHash=updateDto.Password;
    user.Role = updateDto.Role;

    // Check if a new password is provided and passes the password parameters
    if (!string.IsNullOrEmpty(updateDto.Password)&&IsValidPassword(user.PasswordHash))
    {
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(updateDto.Password); // Hash the new password
    }
    //Do not allow the user to be updated unless the new updated meets the parameters
   else   
    {
     return BadRequest("Password does not meet the required criteria. It should have at least 8 characters, including uppercase, lowercase, numbers, and special characters.");

    }

    // Save changes to the database
    await _context.SaveChangesAsync();
    

    return Ok("User successfully updated"); // Return updated user data
}

       //Deleting users
[HttpDelete("{id}")]
public async Task<IActionResult> DeleteUser([FromRoute] int id)
{
    // Find the user by ID
    var user = await _context.Users.FindAsync(id);

    // Check if the user exists
    if (user == null)
    {
        return NotFound("User not found.");
    }

    // Remove the user from the database
    _context.Users.Remove(user);
    await _context.SaveChangesAsync();

    return Ok("User has been successfully deleted.");
}


    }
}
