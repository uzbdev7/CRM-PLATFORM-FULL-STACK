/*
  Warnings:

  - You are about to drop the column `durationTime` on the `LessonVideo` table. All the data in the column will be lost.
  - Added the required column `studentId` to the `Rating` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "HomeworkStatus" ADD VALUE 'MISSED';
ALTER TYPE "HomeworkStatus" ADD VALUE 'DELAY';

-- AlterTable
ALTER TABLE "Homework" ADD COLUMN     "durationTime" INTEGER NOT NULL DEFAULT 16;

-- AlterTable
ALTER TABLE "LessonVideo" DROP COLUMN "durationTime";

-- AlterTable
ALTER TABLE "Rating" ADD COLUMN     "studentId" INTEGER NOT NULL;

-- DropEnum
DROP TYPE "HomeworkStatusStudent";

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
