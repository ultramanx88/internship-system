/*
  Warnings:

  - You are about to drop the column `company` on the `internships` table. All the data in the column will be lost.
  - Made the column `companyId` on table `internships` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_internships" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    CONSTRAINT "internships_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_internships" ("companyId", "description", "id", "location", "title", "type") SELECT "companyId", "description", "id", "location", "title", "type" FROM "internships";
DROP TABLE "internships";
ALTER TABLE "new_internships" RENAME TO "internships";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
