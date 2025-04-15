using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace api.Migrations
{
    /// <inheritdoc />
    public partial class AddUserRoleTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
{
    // First, create the UserRoles table
    migrationBuilder.CreateTable(
        name: "UserRoles",
        columns: table => new
        {
            UserRoleId = table.Column<int>(type: "int", nullable: false)
                .Annotation("SqlServer:Identity", "1, 1"),
            RoleName = table.Column<string>(type: "nvarchar(max)", nullable: false)
        },
        constraints: table =>
        {
            table.PrimaryKey("PK_UserRoles", x => x.UserRoleId);
        });

    // Second, seed the initial roles
    migrationBuilder.InsertData(
        table: "UserRoles",
        columns: new[] { "UserRoleId", "RoleName" },
        values: new object[] { 1, "User" });
        
    migrationBuilder.InsertData(
        table: "UserRoles",
        columns: new[] { "UserRoleId", "RoleName" },
        values: new object[] { 2, "SuperUser" });
        

    // Third, add the UserRoleId column to Users table
    migrationBuilder.AddColumn<int>(
        name: "UserRoleId",
        table: "Users",
        type: "int",
        nullable: false,
        defaultValue: 1); // Default to User role (ID 1)
        
    // Fourth, execute SQL to set UserRoleId based on existing Role values
    migrationBuilder.Sql(@"
        UPDATE Users SET UserRoleId = 1 WHERE Role = 'User' OR Role IS NULL;
        UPDATE Users SET UserRoleId = 2 WHERE Role = 'SuperUser';
       
    ");
    
    // Fifth, create index for foreign key
    migrationBuilder.CreateIndex(
        name: "IX_Users_UserRoleId",
        table: "Users",
        column: "UserRoleId");
        
    // Sixth, add foreign key constraint
    migrationBuilder.AddForeignKey(
        name: "FK_Users_UserRoles_UserRoleId",
        table: "Users",
        column: "UserRoleId",
        principalTable: "UserRoles",
        principalColumn: "UserRoleId",
        onDelete: ReferentialAction.Restrict);
        
    // Finally, drop the old Role column as it's no longer needed
    migrationBuilder.DropColumn(
        name: "Role",
        table: "Users");
}
    }
}
