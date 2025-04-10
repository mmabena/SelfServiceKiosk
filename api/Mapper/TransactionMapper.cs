using api.Dtos;
using api.Models;

namespace api.Mapper
{
    public static class TransactionMapper
    {
        public static TransactionDto ToTransactionDto(this Transaction transactionModel)
        {
            return new TransactionDto
            {
                TransactionId = transactionModel.TransactionId,
                TransactionDate = transactionModel.TransactionDate,
                OrderType = transactionModel.OrderType,

                // Map User to UserDto
                User = transactionModel.User?.ToUserDto(),

                // Map Carts to CartDto if they exist
                Carts = transactionModel.Carts?.Select(cart => cart.ToCartDto()).ToList()
            };
        }
    }
}
