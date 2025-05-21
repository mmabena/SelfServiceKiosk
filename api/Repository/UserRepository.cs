using api.Data;
using api.DTOs;
using api.Models;
using api.Interfaces;
using Microsoft.EntityFrameworkCore;
using api.Mapper;


namespace api.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly ApplicationDBContext _context;

        public UserRepository(ApplicationDBContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<UserDto>> GetAllAsync()
        {
            return await _context.Users
                .Include(u => u.UserRole)
                .Select(u => u.ToUserDto())
                .ToListAsync();
        }

        public async Task<UserDto> GetByIdAsync(int id)
        {
            var user = await _context.Users
                .Include(u => u.UserRole)
                .FirstOrDefaultAsync(u => u.UserId == id);

            return user?.ToUserDto();
        }

        public async Task<UserDto> RegisterAsync(UserRegistrationDto dto)
        {
            if (await _context.Users.AnyAsync(u => u.Username == dto.Username))
                return null; // Username exists

            var roleName = string.IsNullOrWhiteSpace(dto.Role) ? "User" : dto.Role;

            if (roleName != "User" && roleName != "SuperUser")
                throw new ArgumentException("Invalid role. Must be 'User' or 'SuperUser'.");

            var role = await _context.UserRoles.FirstOrDefaultAsync(r => r.RoleName == roleName);
            if (role == null) return null;

            var newUser = new User
            {
                Username = dto.Username,
                Email = dto.Email,
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                UserRoleId = role.UserRoleId
            };

            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();

            return newUser.ToUserDto();
        }

        public async Task<UserDto> LoginAsync(UserLoginDto dto)
        {
            var user = await _context.Users
                .Include(u => u.UserRole)
                .FirstOrDefaultAsync(u => u.Username == dto.Username);

            if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
                return null;

            return user.ToUserDto();
        }

        public async Task<UserDto> UpdateUserAsync(int id, UserUpdateDto dto)
        {
            var user = await _context.Users
                .Include(u => u.UserRole)
                .FirstOrDefaultAsync(u => u.UserId == id);

            if (user == null) return null;

            if (!string.IsNullOrWhiteSpace(dto.Role) && dto.Role != user.UserRole?.RoleName)
            {
                if (dto.Role != "User" && dto.Role != "SuperUser")
                    throw new ArgumentException("Invalid role name.");

                var newRole = await _context.UserRoles.FirstOrDefaultAsync(r => r.RoleName == dto.Role);
                if (newRole == null) return null;

                user.UserRoleId = newRole.UserRoleId;
            }

            user.Username = dto.Username;
            user.Email = dto.Email;
            user.FirstName = dto.FirstName;
            user.LastName = dto.LastName;

            if (!string.IsNullOrWhiteSpace(dto.Password))
            {
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);
            }

            await _context.SaveChangesAsync();
            return user.ToUserDto();
        }

        public async Task<bool> DeleteUserAsync(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return false;

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<UserRole>> GetRolesAsync()
        {
            return await _context.UserRoles.ToListAsync();
        }
    }
}
