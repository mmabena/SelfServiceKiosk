using api.DTOs;
using api.Models;

namespace api.Mapper
{
  public static class CartMapper
{
    public static CartDto ToCartDto(this Cart cart, bool includeTransaction = true)
    {
        return new CartDto
        {
            CartId = cart.CartId,
            DateCreated = cart.DateCreated,
            User = cart.User?.ToUserDto(),
            Transaction = includeTransaction && cart.Transaction != null
                ? new TransactionDto
                {
                    TransactionId = cart.Transaction.TransactionId,
                    TransactionDate = cart.Transaction.TransactionDate,
                    OrderType = cart.Transaction.OrderType,
                    TotalAmount = cart.Transaction.TotalAmount,
                    User = null,   
                    Cart = null     
                }
                : null
        };
    }
}

}
