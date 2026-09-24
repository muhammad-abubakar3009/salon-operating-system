/*
  Warnings:

  - Added the required column `password_hash` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "password_hash" TEXT NOT NULL,
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'staff';
