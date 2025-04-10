using api.Dtos;
using api.Models;

namespace api.Mapper
{
    public static class CartMapper
    {
        public static CartDto ToCartDto(this Cart cartModel)
        {
            // Ensure the related entities (User, Transaction) are properly mapped and handled
            return new CartDto
            {
                CartId = cartModel.CartId,
                DateCreated = cartModel.DateCreated,
                UnitPrice = cartModel.UnitPrice,
                
                // Check if related entities are not null before mapping them to their DTOs
                User = cartModel.Users?.ToUserDto(),  // Mapping User to UserDto (Optional)
                Transaction = cartModel.Transactions?.ToTransactionDto()  // Mapping Transaction to TransactionDto (Optional)
            };
        }
    }
}
