using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API.Migrations
{
    /// <inheritdoc />
    public partial class AddPromotionImages : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ImageUrl",
                table: "Promotions");

            // Remove or comment out the rename:
            // migrationBuilder.RenameColumn(
            //     name: "BusisnssName",
            //     table: "Businesses",
            //     newName: "BusinessName");

            migrationBuilder.CreateTable(
                name: "PromotionImages",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ImageUrl = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PromotionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PromotionImages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PromotionImages_Promotions_PromotionId",
                        column: x => x.PromotionId,
                        principalTable: "Promotions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PromotionImages_PromotionId",
                table: "PromotionImages",
                column: "PromotionId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PromotionImages");

            // Remove or comment out the rename back:
            // migrationBuilder.RenameColumn(
            //     name: "BusinessName",
            //     table: "Businesses",
            //     newName: "BusisnssName");

            migrationBuilder.AddColumn<string>(
                name: "ImageUrl",
                table: "Promotions",
                type: "nvarchar(max)",
                nullable: true);
        }
    }
}
