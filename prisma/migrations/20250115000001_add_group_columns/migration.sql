-- AlterTable
ALTER TABLE "DressingRoomItem" ADD COLUMN "groupId" TEXT;
ALTER TABLE "DressingRoomItem" ADD COLUMN "groupName" TEXT;
ALTER TABLE "DressingRoomItem" ADD COLUMN "groupDate" TIMESTAMP(3);
ALTER TABLE "DressingRoomItem" ADD COLUMN "groupWeather" TEXT;
ALTER TABLE "DressingRoomItem" ADD COLUMN "groupTPO" TEXT;

-- CreateIndex
CREATE INDEX "DressingRoomItem_groupId_idx" ON "DressingRoomItem"("groupId");