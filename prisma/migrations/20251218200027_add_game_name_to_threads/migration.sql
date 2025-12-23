-- AlterTable
ALTER TABLE "discussion_threads" ADD COLUMN "gameName" TEXT NOT NULL DEFAULT '';

-- Update existing threads with game names
UPDATE "discussion_threads" dt
SET "gameName" = g.title
FROM "games" g
WHERE dt."gameId" = g.id;

