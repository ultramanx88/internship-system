-- CreateTable
CREATE TABLE "print_records" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "documentNumber" TEXT NOT NULL,
    "documentDate" DATETIME NOT NULL,
    "printedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "printedById" TEXT NOT NULL,
    CONSTRAINT "print_records_printedById_fkey" FOREIGN KEY ("printedById") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_ApplicationToPrintRecord" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_ApplicationToPrintRecord_A_fkey" FOREIGN KEY ("A") REFERENCES "applications" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ApplicationToPrintRecord_B_fkey" FOREIGN KEY ("B") REFERENCES "print_records" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "_ApplicationToPrintRecord_AB_unique" ON "_ApplicationToPrintRecord"("A", "B");

-- CreateIndex
CREATE INDEX "_ApplicationToPrintRecord_B_index" ON "_ApplicationToPrintRecord"("B");
