-- CreateEnum
CREATE TYPE "ShortcutDetail" AS ENUM ('SHARE_SHEET', 'APPLE_WATCH', 'MENU_BAR_ON_MAC', 'QUICK_ACTIONS_ON_MAC', 'RECEIVES_SCREEN');

-- CreateTable
CREATE TABLE "Shortcut" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "icloud" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT[],
    "icon" TEXT NOT NULL,
    "backgroundColors" TEXT[],
    "details" "ShortcutDetail"[],
    "language" TEXT NOT NULL DEFAULT 'zh-CN',
    "galleryId" INTEGER,
    "albumId" INTEGER,

    CONSTRAINT "Shortcut_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Gallery" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" JSONB NOT NULL,
    "description" JSONB NOT NULL,
    "albumId" INTEGER,

    CONSTRAINT "Gallery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Album" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" JSONB NOT NULL,
    "image" TEXT NOT NULL,

    CONSTRAINT "Album_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Shortcut" ADD CONSTRAINT "Shortcut_galleryId_fkey" FOREIGN KEY ("galleryId") REFERENCES "Gallery"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shortcut" ADD CONSTRAINT "Shortcut_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "Album"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gallery" ADD CONSTRAINT "Gallery_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "Album"("id") ON DELETE SET NULL ON UPDATE CASCADE;
