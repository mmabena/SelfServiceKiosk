using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace api.Migrations
{
    /// <inheritdoc />
    public partial class SettingUserRole : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
           // Fix existing NULLs
    migrationBuilder.Sql("UPDATE Users SET UserRoleId = 1 WHERE UserRoleId IS NULL");

    // Alter column to be NOT NULL
    migrationBuilder.AlterColumn<int>(
        name: "UserRoleId",
        table: "Users",
        type: "int",
        nullable: false,
        oldClrType: typeof(int),
        oldType: "int",
        oldNullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
