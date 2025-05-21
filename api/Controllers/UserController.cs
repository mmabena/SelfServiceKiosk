using Microsoft.AspNetCore.Mvc;
using api.Data;
using api.Models;
using api.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using api.Mapper;

namespace api.Controllers
{
    [Route("api/user")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly ApplicationDBContext _context;
        private readonly IConfiguration _configuration;

        public UserController(ApplicationDBContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        // GET: api/user
        [HttpGet]
        public IActionResult GetAll()
        {   
            var users = _context.Users
                                .Include(u => u.UserRole) // Include UserRole data
                                .ToList()
                                .Select(user => user.ToUserDto()) // Mapping each User to UserDto
                                .ToList();

            return Ok(users); // Return the list of UserDto objects
        }

        // GET: api/user/{id}
        [HttpGet("{id}")]
        public IActionResult GetById([FromRoute] int id)
        {
            var user = _context.Users
                        .Include(u => u.UserRole) // Include UserRole data
                        .FirstOrDefault(u => u.UserId == id);

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
            if (string.IsNullOrWhiteSpace(registrationDto.Username) ||
                string.IsNullOrWhiteSpace(registrationDto.Password) ||
                string.IsNullOrWhiteSpace(registrationDto.Email) ||
                string.IsNullOrWhiteSpace(registrationDto.FirstName) ||
                string.IsNullOrWhiteSpace(registrationDto.LastName))
            {
                return BadRequest("All fields are required and cannot be empty.");
            }

            if (!IsValidEmail(registrationDto.Email))
            {
                return BadRequest("Email must be a valid @singular.co.za address.");
            }

            if (!IsValidPassword(registrationDto.Password))
            {
                return BadRequest("Password must be at least 8 characters long, including uppercase, lowercase, number, and special character.");
            }

            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Username == registrationDto.Username);
            if (existingUser != null)
            {
                return BadRequest("Username is already taken.");
            }

            string roleName = string.IsNullOrEmpty(registrationDto.Role) ? "User" : registrationDto.Role;
            var userRole = await _context.UserRoles.FirstOrDefaultAsync(r => r.RoleName == roleName);

            if (userRole == null)
            {
                userRole = new UserRole { RoleName = roleName };
                _context.UserRoles.Add(userRole);
                await _context.SaveChangesAsync();
            }

            var user = new User
            {
                Username = registrationDto.Username,
                FirstName = registrationDto.FirstName,
                LastName = registrationDto.LastName,
                Email = registrationDto.Email,
                UserRoleId = userRole.UserRoleId,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(registrationDto.Password)
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

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
            var hasMinLength = password.Length >= 8;  // At least 8 characters

            return hasUpperCase.IsMatch(password) && hasLowerCase.IsMatch(password) &&
                   hasDigit.IsMatch(password) && hasSpecialChar.IsMatch(password) && hasMinLength;
        }

        private bool IsValidEmail(string email)
        {
            // Must end with @singular.co.za
            return Regex.IsMatch(email, @"^[^@\s]+@singular\.co\.za$", RegexOptions.IgnoreCase);
        }

       // POST: api/user/login
[HttpPost("login")]
public async Task<IActionResult> Login([FromBody] UserLoginDto loginDto)
{
    if (string.IsNullOrEmpty(loginDto.Username) || string.IsNullOrEmpty(loginDto.Password))
    {
        return BadRequest("Username and password are required.");
    }
    //var loginResult=await _userRepository.LoginAsync(loginDto);

    // Look for the user by username
    var user = await _context.Users
        .Include(u => u.UserRole)  // Include role if needed
        .FirstOrDefaultAsync(u => u.Username == loginDto.Username);

    if (user == null || !BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash))
    {
        // Incorrect username or password
        return Unauthorized("Invalid username or password.");
    }

    // Prepare token claims
    var claims = new[]
    {
        new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
        new Claim(ClaimTypes.Name, user.Username),
        new Claim(ClaimTypes.Role, user.UserRoleId.ToString()), // Role as ID for policies
        new Claim("roleName", user.UserRole?.RoleName ?? "User") // Optional: role name
    };

    // Get secret key from appsettings.json
    var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
    var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

    var token = new JwtSecurityToken(
        issuer: _configuration["Jwt:Issuer"],
        audience: _configuration["Jwt:Audience"],
        claims: claims,
        expires: DateTime.UtcNow.AddHours(2),
        signingCredentials: creds);

    var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

    return Ok(new
    {
        message = "Login successful",
        token = tokenString,
        user = user.ToUserDto()  // Optionally include user details if needed
    });
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

        // PUT: api/user/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUserData([FromRoute] int id, [FromBody] UserUpdateDto updateDto)
        {
            var user = await _context.Users.Include(u => u.UserRole).FirstOrDefaultAsync(u => u.UserId == id);
            if (user == null)
            {
                return NotFound("User not found.");
            }

            // Required fields validation
            if (string.IsNullOrWhiteSpace(updateDto.Username) ||
                string.IsNullOrWhiteSpace(updateDto.Email) ||
                string.IsNullOrWhiteSpace(updateDto.FirstName) ||
                string.IsNullOrWhiteSpace(updateDto.LastName))
            {
                return BadRequest("All fields are required and cannot be empty.");
            }

            // Email must be @singular.co.za
            if (!IsValidEmail(updateDto.Email))
            {
                return BadRequest("Email must be a valid @singular.co.za address.");
            }

            // Handle role change if needed
            if (!string.IsNullOrEmpty(updateDto.Role) &&
                (user.UserRole == null || user.UserRole.RoleName != updateDto.Role))
            {
                var userRole = await _context.UserRoles.FirstOrDefaultAsync(r => r.RoleName == updateDto.Role);
                if (userRole == null)
                {
                    userRole = new UserRole { RoleName = updateDto.Role };
                    _context.UserRoles.Add(userRole);
                    await _context.SaveChangesAsync();
                }

                user.UserRoleId = userRole.UserRoleId;
            }

            // Update user fields
            user.Username = updateDto.Username;
            user.FirstName = updateDto.FirstName;
            user.LastName = updateDto.LastName;
            user.Email = updateDto.Email;

            if (!string.IsNullOrWhiteSpace(updateDto.Password))
            {
                if (!IsValidPassword(updateDto.Password))
                {
                    return BadRequest("Password must be at least 8 characters long, including uppercase, lowercase, number, and special character.");
                }

                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(updateDto.Password);
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "User successfully updated", user = user.ToUserDto() });
        }

        // DELETE: api/user/{id}
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
        // POST: api/user/validate
[HttpPost("validate")]
public IActionResult ValidateToken([FromBody] string token)
{
    try
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]);
        tokenHandler.ValidateToken(token, new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidIssuer = _configuration["Jwt:Issuer"],
            ValidAudience = _configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(key)
        }, out SecurityToken validatedToken);

        // If the token is valid
        return Ok(new { message = "Token is valid." });
    }
    catch (Exception ex)
    {
        return Unauthorized(new { message = "Token is invalid.", error = ex.Message });
    }
}


        // GET: api/user/roles
        [HttpGet("roles")]
        public async Task<IActionResult> GetAllRoles()
        {
            var roles = await _context.UserRoles
                .Select(r => new { r.UserRoleId, r.RoleName })
                .ToListAsync();

            return Ok(roles);
        }
    }
}
