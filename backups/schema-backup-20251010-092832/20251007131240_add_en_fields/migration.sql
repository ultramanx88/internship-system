-- AlterTable
ALTER TABLE "academic_years" ADD COLUMN     "nameEn" TEXT;

-- AlterTable
ALTER TABLE "applications" ADD COLUMN     "projectTopicEn" TEXT;

-- AlterTable
ALTER TABLE "companies" ADD COLUMN     "addressEn" TEXT,
ADD COLUMN     "descriptionEn" TEXT,
ADD COLUMN     "industryEn" TEXT;

-- AlterTable
ALTER TABLE "documents" ADD COLUMN     "nameEn" TEXT;

-- AlterTable
ALTER TABLE "internships" ADD COLUMN     "descriptionEn" TEXT,
ADD COLUMN     "titleEn" TEXT;

-- AlterTable
ALTER TABLE "semesters" ADD COLUMN     "nameEn" TEXT;
