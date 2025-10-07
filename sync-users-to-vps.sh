#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# VPS Configuration
VPS_HOST="203.170.129.199"
VPS_USER="root"
VPS_PATH="/var/www/internship-system"
VPS_PASSWORD="rp4QkUUvmbi5qB"

echo -e "${BLUE}🔄 Syncing users to VPS...${NC}"

# 1. Export users from local database
echo -e "${BLUE}1. Exporting users from local database...${NC}"
node -e "
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function exportUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        roles: true,
        t_title: true,
        t_name: true,
        t_middle_name: true,
        t_surname: true,
        e_title: true,
        e_name: true,
        e_middle_name: true,
        e_surname: true,
        facultyId: true,
        departmentId: true,
        curriculumId: true,
        majorId: true,
        studentYear: true,
        phone: true,
        campus: true,
        gpa: true,
        nationality: true,
        passportId: true,
        visaType: true,
        profileImage: true,
        notifyEmail: true,
        notifyPush: true,
        notifySms: true,
        notifyAppUpdates: true,
        notifyDeadlines: true,
        notifyNews: true,
        language: true,
        theme: true,
        dateFormat: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    fs.writeFileSync('users-export.json', JSON.stringify(users, null, 2));
    console.log('✅ Exported', users.length, 'users to users-export.json');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.\$disconnect();
  }
}

exportUsers();
"

if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Failed to export users${NC}"
  exit 1
fi

# 2. Upload users to VPS
echo -e "${BLUE}2. Uploading users to VPS...${NC}"
sshpass -p "$VPS_PASSWORD" scp users-export.json $VPS_USER@$VPS_HOST:$VPS_PATH/

if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Failed to upload users to VPS${NC}"
  exit 1
fi

# 3. Import users to VPS database
echo -e "${BLUE}3. Importing users to VPS database...${NC}"
sshpass -p "$VPS_PASSWORD" ssh $VPS_USER@$VPS_HOST "cd $VPS_PATH && node -e \"
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function importUsers() {
  try {
    const users = JSON.parse(fs.readFileSync('users-export.json', 'utf8'));
    
    console.log('📥 Importing', users.length, 'users...');
    
    for (const user of users) {
      await prisma.user.upsert({
        where: { id: user.id },
        update: user,
        create: user
      });
    }
    
    console.log('✅ Successfully imported', users.length, 'users');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.\$disconnect();
  }
}

importUsers();
\""

if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Failed to import users to VPS${NC}"
  exit 1
fi

# 4. Clean up
echo -e "${BLUE}4. Cleaning up...${NC}"
rm -f users-export.json
sshpass -p "$VPS_PASSWORD" ssh $VPS_USER@$VPS_HOST "cd $VPS_PATH && rm -f users-export.json"

echo -e "${GREEN}✅ User sync completed successfully!${NC}"
echo -e "${BLUE}📊 VPS should now have the same users as local${NC}"