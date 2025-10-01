/*
  Warnings:

  - You are about to drop the `_ApplicationToPrintRecord` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[documentNumber]` on the table `print_records` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "_ApplicationToPrintRecord_B_index";

-- DropIndex
DROP INDEX "_ApplicationToPrintRecord_AB_unique";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_ApplicationToPrintRecord";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_applications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "internshipId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "dateApplied" DATETIME NOT NULL,
    "feedback" TEXT,
    "projectTopic" TEXT,
    "printRecordId" TEXT,
    CONSTRAINT "applications_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "applications_internshipId_fkey" FOREIGN KEY ("internshipId") REFERENCES "internships" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "applications_printRecordId_fkey" FOREIGN KEY ("printRecordId") REFERENCES "print_records" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_applications" ("dateApplied", "feedback", "id", "internshipId", "projectTopic", "status", "studentId") SELECT "dateApplied", "feedback", "id", "internshipId", "projectTopic", "status", "studentId" FROM "applications";
DROP TABLE "applications";
ALTER TABLE "new_applications" RENAME TO "applications";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "print_records_documentNumber_key" ON "print_records"("documentNumber");
