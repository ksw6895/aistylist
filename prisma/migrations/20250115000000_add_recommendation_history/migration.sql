-- CreateTable
CREATE TABLE "RecommendationHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "requestInfo" JSONB NOT NULL,
    "weather" TEXT,
    "recommendationA" JSONB NOT NULL,
    "recommendationB" JSONB NOT NULL,
    "selectedOptions" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecommendationHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RecommendationHistory_userId_idx" ON "RecommendationHistory"("userId");

-- AddForeignKey
ALTER TABLE "RecommendationHistory" ADD CONSTRAINT "RecommendationHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;