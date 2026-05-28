-- CreateTable
CREATE TABLE "Connection" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastEventAt" TIMESTAMP(3),

    CONSTRAINT "Connection_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Email" ADD COLUMN "connectionId" TEXT;
ALTER TABLE "Email" ADD COLUMN "source" TEXT;
ALTER TABLE "Email" ADD COLUMN "priority" TEXT;
ALTER TABLE "Email" ADD COLUMN "sentiment" TEXT;
ALTER TABLE "Email" ADD COLUMN "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Email" ADD COLUMN "channel" TEXT NOT NULL DEFAULT 'email';

-- CreateIndex
CREATE UNIQUE INDEX "Connection_slug_key" ON "Connection"("slug");
CREATE UNIQUE INDEX "Connection_apiKey_key" ON "Connection"("apiKey");

-- AddForeignKey
ALTER TABLE "Email" ADD CONSTRAINT "Email_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "Connection"("id") ON DELETE SET NULL ON UPDATE CASCADE;
