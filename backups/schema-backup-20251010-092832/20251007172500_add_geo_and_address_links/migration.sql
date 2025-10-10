-- Add geo coordinates and address linkage columns to companies
ALTER TABLE "companies"
  ADD COLUMN IF NOT EXISTS "latitude" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "longitude" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "provinceIdRef" TEXT,
  ADD COLUMN IF NOT EXISTS "districtIdRef" TEXT,
  ADD COLUMN IF NOT EXISTS "subdistrictIdRef" TEXT;

-- Optional: future FKs can be added after data is consistent
-- ALTER TABLE "companies" ADD CONSTRAINT "companies_provinceIdRef_fkey" FOREIGN KEY ("provinceIdRef") REFERENCES "provinces"("id") ON DELETE SET NULL ON UPDATE CASCADE;
-- ALTER TABLE "companies" ADD CONSTRAINT "companies_districtIdRef_fkey" FOREIGN KEY ("districtIdRef") REFERENCES "districts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
-- ALTER TABLE "companies" ADD CONSTRAINT "companies_subdistrictIdRef_fkey" FOREIGN KEY ("subdistrictIdRef") REFERENCES "subdistricts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

