

using api.DTOs;
using api.Models;

namespace api.Mapper
{
    public static class UserMapper
     {  
     
        public static  UserDto ToUserDto(this User userModel)
        {
            return new UserDto
            {
                UserId = userModel.UserId,
                Username = userModel.Username,
                FirstName = userModel.FirstName,
                LastName = userModel.LastName,
                Email = userModel.Email,
                Role = userModel.UserRole?.RoleName, 
                IsActive=userModel.IsActive, 
                Wallet = userModel.Wallet?.ToWalletDto(),
                Carts = userModel.Carts?.Select(cart => cart.ToCartDto()).ToList(),
                Transactions = userModel.Transactions?.Select(transaction => transaction.ToTransactionDto()).ToList()
            };
        }
    
}
}