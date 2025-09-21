using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API.Migrations
{
    /// <inheritdoc />
    public partial class AddBookingDetail : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Bookings_Users_ProviderId",
                table: "Bookings");

            migrationBuilder.RenameColumn(
                name: "ProviderId",
                table: "Bookings",
                newName: "BusinessId");

            migrationBuilder.RenameIndex(
                name: "IX_Bookings_ProviderId",
                table: "Bookings",
                newName: "IX_Bookings_BusinessId");

            migrationBuilder.AddColumn<string>(
                name: "ContactNumber",
                table: "Bookings",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Bookings",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "Latitude",
                table: "Bookings",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Location",
                table: "Bookings",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "Longitude",
                table: "Bookings",
                type: "float",
                nullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Bookings_Businesses_BusinessId",
                table: "Bookings",
                column: "BusinessId",
                principalTable: "Businesses",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Bookings_Businesses_BusinessId",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "ContactNumber",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "Latitude",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "Location",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "Longitude",
                table: "Bookings");

            migrationBuilder.RenameColumn(
                name: "BusinessId",
                table: "Bookings",
                newName: "ProviderId");

            migrationBuilder.RenameIndex(
                name: "IX_Bookings_BusinessId",
                table: "Bookings",
                newName: "IX_Bookings_ProviderId");

            migrationBuilder.AddForeignKey(
                name: "FK_Bookings_Users_ProviderId",
                table: "Bookings",
                column: "ProviderId",
                principalTable: "Users",
                principalColumn: "Id");
        }
    }
}
