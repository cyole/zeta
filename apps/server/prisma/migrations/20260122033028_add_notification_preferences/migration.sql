-- CreateEnum
CREATE TYPE "EmailDigestFrequency" AS ENUM ('NONE', 'DAILY', 'WEEKLY');

-- CreateTable
CREATE TABLE "user_notification_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "emailEnabled" BOOLEAN NOT NULL DEFAULT true,
    "emailOnLogin" BOOLEAN NOT NULL DEFAULT false,
    "emailOnPasswordChange" BOOLEAN NOT NULL DEFAULT true,
    "emailOnSecurityAlert" BOOLEAN NOT NULL DEFAULT true,
    "emailDigest" "EmailDigestFrequency" NOT NULL DEFAULT 'NONE',
    "pushEnabled" BOOLEAN NOT NULL DEFAULT true,
    "pushOnMention" BOOLEAN NOT NULL DEFAULT true,
    "pushOnSystemUpdate" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_notification_preferences_userId_key" ON "user_notification_preferences"("userId");

-- AddForeignKey
ALTER TABLE "user_notification_preferences" ADD CONSTRAINT "user_notification_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
