-- AlterTable
ALTER TABLE "users" ADD COLUMN     "emailVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "otpExpiresAt" TIMESTAMP(3),
ADD COLUMN     "verificationOtp" TEXT;
