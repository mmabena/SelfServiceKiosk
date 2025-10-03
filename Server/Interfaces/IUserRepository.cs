
using api.Models;
using api.DTOs;

namespace api.Interfaces
{
    public interface IUserRepository
    {  Task<IEnumerable<UserDto>> GetAllAsync();
        Task<UserDto> GetByIdAsync(int id);
        Task<UserDto> RegisterAsync(UserRegistrationDto registrationDto);
        Task<UserDto> LoginAsync(UserLoginDto loginDto);
        Task<UserDto> UpdateUserAsync(int id, UserUpdateDto dto);
        Task<bool> DeleteUserAsync(int id);
        Task<IEnumerable<UserRole>> GetRolesAsync();
        
    }
}