using Xunit;
using Microsoft.EntityFrameworkCore;
using api.Controllers;
using api.Data;
using api.DTOs;
using api.Models;
using Microsoft.AspNetCore.Mvc;


public class WalletControllerTests
{
    private ApplicationDBContext GetInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDBContext>()
            .UseInMemoryDatabase(databaseName: "WalletDbTest")
            .Options;
        return new ApplicationDBContext(options);
    }

    [Fact]
    public async Task AddToWallet_CreatesNewWallet_WhenWalletDoesNotExist()
    {
        // Arrange
        var context = GetInMemoryDbContext();
        var controller = new WalletController(context);
        var dto = new WalletDto { UserId = 1, Balance = 100 };

        // Act
        var result = await controller.AddToWallet(dto) as OkObjectResult;

        // Assert
        Assert.NotNull(result);
        Assert.Equal(200, result.StatusCode);
        dynamic body = result.Value;
        Assert.Equal(100, (decimal)body.balance);

        var wallet = await context.Wallets.FirstOrDefaultAsync(w => w.UserId == 1);
        Assert.NotNull(wallet);
        Assert.Equal(100, wallet.Balance);
    }

    [Fact]
    public async Task AddToWallet_UpdatesWallet_WhenWalletExists()
    {
        // Arrange
        var context = GetInMemoryDbContext();
        context.Wallets.Add(new Wallet { UserId = 2, Balance = 50 });
        await context.SaveChangesAsync();

        var controller = new WalletController(context);
        var dto = new WalletDto { UserId = 2, Balance = 50 };

        // Act
        var result = await controller.AddToWallet(dto) as OkObjectResult;

        // Assert
        Assert.NotNull(result);
        Assert.Equal(200, result.StatusCode);
        dynamic body = result.Value;
        Assert.Equal(100, (decimal)body.balance);

        var wallet = await context.Wallets.FirstOrDefaultAsync(w => w.UserId == 2);
        Assert.NotNull(wallet);
        Assert.Equal(100, wallet.Balance);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-10)]
    [InlineData(1500)]
    public async Task AddToWallet_ReturnsBadRequest_ForInvalidAmount(decimal amount)
    {
        // Arrange
        var context = GetInMemoryDbContext();
        var controller = new WalletController(context);
        var dto = new WalletDto { UserId = 3, Balance = amount };

        // Act
        var result = await controller.AddToWallet(dto) as BadRequestObjectResult;

        // Assert
        Assert.NotNull(result);
        Assert.Equal(400, result.StatusCode);
        Assert.Equal("Amount must be between R0.01 and R1000.", result.Value);
    }

    [Fact]
    public async Task AddToWallet_ReturnsBadRequest_WhenDtoIsNull()
    {
        // Arrange
        var context = GetInMemoryDbContext();
        var controller = new WalletController(context);

        // Act
        var result = await controller.AddToWallet(null) as BadRequestObjectResult;

        // Assert
        Assert.NotNull(result);
        Assert.Equal(400, result.StatusCode);
        Assert.Equal("Missing request body.", result.Value);
    }

    [Fact]
    public async Task GetWalletByUserId_ReturnsWallet_WhenExists()
    {
        // Arrange
        var context = GetInMemoryDbContext();
        context.Wallets.Add(new Wallet { UserId = 10, Balance = 250 });
        await context.SaveChangesAsync();

        var controller = new WalletController(context);

        // Act
        var result = await controller.GetWalletByUserId(10) as OkObjectResult;

        // Assert
        Assert.NotNull(result);
        dynamic body = result.Value;
        Assert.Equal(250, (decimal)body.balance);
    }

    [Fact]
    public async Task GetWalletByUserId_ReturnsNotFound_WhenWalletDoesNotExist()
    {
        // Arrange
        var context = GetInMemoryDbContext();
        var controller = new WalletController(context);

        // Act
        var result = await controller.GetWalletByUserId(999) as NotFoundObjectResult;

        // Assert
        Assert.NotNull(result);
        Assert.Equal(404, result.StatusCode);
        dynamic body = result.Value;
        Assert.Equal("Wallet not found.", (string)body.message);
    }
}
