/*
  Warnings:

  - Changed the type of `roomType` on the `Room` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "RoomTypeEnum" AS ENUM ('single', 'double', 'suite', 'deluxe');

-- AlterTable
ALTER TABLE "Room" DROP COLUMN "roomType",
ADD COLUMN     "roomType" "RoomTypeEnum" NOT NULL;
