using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace api.Migrations
{
    /// <inheritdoc />
    public partial class FixedTransactionCartCascade : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "UnitPrice",
                table: "Carts");

            migrationBuilder.AddColumn<int>(
                name: "CartId",
                table: "Transactions",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<decimal>(
                name: "TotalAmount",
                table: "Transactions",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AlterColumn<int>(
                name: "TransactionId",
                table: "Carts",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_CartId",
                table: "Transactions",
                column: "CartId",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Transactions_Carts_CartId",
                table: "Transactions",
                column: "CartId",
                principalTable: "Carts",
                principalColumn: "CartId",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Transactions_Carts_CartId",
                table: "Transactions");

            migrationBuilder.DropIndex(
                name: "IX_Transactions_CartId",
                table: "Transactions");

            migrationBuilder.DropColumn(
                name: "CartId",
                table: "Transactions");

            migrationBuilder.DropColumn(
                name: "TotalAmount",
                table: "Transactions");

            migrationBuilder.AlterColumn<int>(
                name: "TransactionId",
                table: "Carts",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "UnitPrice",
                table: "Carts",
                type: "money",
                nullable: false,
                defaultValue: 0m);
        }
    }
}
