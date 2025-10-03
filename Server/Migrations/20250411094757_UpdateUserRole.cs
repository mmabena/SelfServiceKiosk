#nullable disable

using Microsoft.EntityFrameworkCore.Migrations;

namespace api.Migrations
{
    public partial class UpdateUserRole : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Update User with UserId = 3 to have the SuperUser role (UserRoleId = 2)
            migrationBuilder.Sql("UPDATE Users SET UserRoleId = 2 WHERE UserId = 3");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // If you need to roll back, you can reverse the role update (set to previous value, if needed)
            // Here, we're assuming the previous role for UserId = 3 was 1, but change that based on your requirements
            migrationBuilder.Sql("UPDATE Users SET UserRoleId = 1 WHERE UserId = 3");
        }
    }
}
