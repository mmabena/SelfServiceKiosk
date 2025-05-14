using api.Dtos;
using api.Models;

namespace api.Mapper
{
    public static class CartMapper
    {
        public static CartDto ToCartDto(this Cart cartModel)
        {
            
            return new CartDto
            {
                CartId = cartModel.CartId,
                DateCreated = cartModel.DateCreated,
                UnitPrice = cartModel.UnitPrice,
                
               
                User = cartModel.Users?.ToUserDto(),  
                Transaction = cartModel.Transactions?.ToTransactionDto() 
            };
        }
    }
}
