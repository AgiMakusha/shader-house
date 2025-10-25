-- CreateEnum
CREATE TYPE "DeveloperType" AS ENUM ('INDIE', 'STUDIO');

-- CreateEnum
CREATE TYPE "CompanyType" AS ENUM ('NONE', 'SOLE_PROP', 'LLC', 'CORP');

-- CreateEnum
CREATE TYPE "FundingSource" AS ENUM ('SELF', 'CROWDFUND', 'ANGEL', 'VC', 'MAJOR_PUBLISHER');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'APPEALING');

-- CreateTable
CREATE TABLE "developer_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "developerType" "DeveloperType" NOT NULL,
    "teamSize" INTEGER NOT NULL,
    "hasPublisher" BOOLEAN NOT NULL,
    "ownsIP" BOOLEAN NOT NULL,
    "fundingSources" "FundingSource"[],
    "companyType" "CompanyType" NOT NULL,
    "evidenceLinks" TEXT[],
    "attestIndie" BOOLEAN NOT NULL,
    "attestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "attestedIP" TEXT,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "rejectionReason" TEXT,
    "isIndieEligible" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "developer_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "developer_profiles_userId_key" ON "developer_profiles"("userId");

-- AddForeignKey
ALTER TABLE "developer_profiles" ADD CONSTRAINT "developer_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
