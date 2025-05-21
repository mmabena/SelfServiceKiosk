using api.DTOs;
using api.Models;


namespace api.Mapper
{
public static class TransactionMapper
{
    public static TransactionDto ToTransactionDto(this Transaction transaction)
    {
        return new TransactionDto
        {
            TransactionId = transaction.TransactionId,
            TransactionDate = transaction.TransactionDate,
            OrderType = transaction.OrderType,
            TotalAmount = transaction.TotalAmount,
            User = transaction.User?.ToUserDto(),
            Cart = transaction.Cart?.ToCartDto(includeTransaction: false) // prevent circular reference
        };
    }
}

}
