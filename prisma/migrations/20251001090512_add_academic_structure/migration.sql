/*
  Warnings:

  - You are about to drop the `Faculty` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Faculty";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "faculties" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nameTh" TEXT NOT NULL,
    "nameEn" TEXT,
    "code" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "departments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nameTh" TEXT NOT NULL,
    "nameEn" TEXT,
    "code" TEXT,
    "facultyId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "departments_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "faculties" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "curriculums" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nameTh" TEXT NOT NULL,
    "nameEn" TEXT,
    "code" TEXT,
    "degree" TEXT,
    "departmentId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "curriculums_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "majors" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nameTh" TEXT NOT NULL,
    "nameEn" TEXT,
    "curriculumId" TEXT NOT NULL,
    "area" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "majors_curriculumId_fkey" FOREIGN KEY ("curriculumId") REFERENCES "curriculums" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "roles" TEXT NOT NULL,
    "skills" TEXT,
    "statement" TEXT,
    "t_title" TEXT,
    "t_name" TEXT,
    "t_middle_name" TEXT,
    "t_surname" TEXT,
    "e_title" TEXT,
    "e_name" TEXT,
    "e_middle_name" TEXT,
    "e_surname" TEXT,
    "facultyId" TEXT,
    "departmentId" TEXT,
    "curriculumId" TEXT,
    "majorId" TEXT,
    "studentYear" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "users_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "faculties" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "users_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "users_curriculumId_fkey" FOREIGN KEY ("curriculumId") REFERENCES "curriculums" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "users_majorId_fkey" FOREIGN KEY ("majorId") REFERENCES "majors" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_users" ("createdAt", "e_middle_name", "e_name", "e_surname", "e_title", "email", "id", "name", "password", "roles", "skills", "statement", "t_middle_name", "t_name", "t_surname", "t_title", "updatedAt") SELECT "createdAt", "e_middle_name", "e_name", "e_surname", "e_title", "email", "id", "name", "password", "roles", "skills", "statement", "t_middle_name", "t_name", "t_surname", "t_title", "updatedAt" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
