#!/bin/bash

# สร้าง package สำหรับ deploy
echo "🚀 Creating deployment package..."

# สร้างโฟลเดอร์ temp
mkdir -p deploy-temp

# Copy เฉพาะไฟล์ที่จำเป็น
echo "📁 Copying essential files..."

# Copy source code
cp -r src deploy-temp/
cp -r prisma deploy-temp/
cp -r public deploy-temp/
cp -r document-templates deploy-temp/
cp -r excel-templates deploy-temp/
cp -r generated-documents deploy-temp/

# Copy config files
cp package.json deploy-temp/
cp package-lock.json deploy-temp/
cp next.config.ts deploy-temp/
cp tailwind.config.ts deploy-temp/
cp tsconfig.json deploy-temp/
cp postcss.config.mjs deploy-temp/
cp components.json deploy-temp/
cp middleware.ts deploy-temp/
cp next-env.d.ts deploy-temp/

# Copy environment files
cp .env.example deploy-temp/
cp .env.production deploy-temp/
cp .env.railway deploy-temp/

# Copy other essential files
cp vercel.json deploy-temp/
cp apphosting.yaml deploy-temp/
cp start-dev.sh deploy-temp/

# Copy remaining scripts (only essential ones)
mkdir -p deploy-temp/scripts
cp scripts/import-data.ts deploy-temp/scripts/ 2>/dev/null || true

# สร้าง tar file
echo "📦 Creating tar package..."
cd deploy-temp
tar -czf ../internship-system-deploy.tar.gz .
cd ..

# ลบโฟลเดอร์ temp
rm -rf deploy-temp

# แสดงขนาดไฟล์
echo "✅ Package created: internship-system-deploy.tar.gz"
ls -lh internship-system-deploy.tar.gz
echo ""
echo "🚀 Ready to upload to VPS!"
echo ""
echo "Upload command:"
echo "scp internship-system-deploy.tar.gz user@your-vps:/tmp/"
echo ""
echo "Extract on VPS:"
echo "cd /var/www/"
echo "sudo rm -rf internship-system"
echo "sudo mkdir internship-system"
echo "sudo tar -xzf /tmp/internship-system-deploy.tar.gz -C internship-system"
echo "sudo chown -R www-data:www-data internship-system"