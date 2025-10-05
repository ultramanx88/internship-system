#!/bin/bash

# Sync users data to VPS
echo "🔄 Syncing users data to VPS..."

# Export users from local database
echo "📤 Exporting users from local database..."
npx tsx -e "
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function exportUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
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
        skills: true,
        statement: true,
        facultyId: true,
        departmentId: true,
        curriculumId: true,
        majorId: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    console.log(JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.\$disconnect();
  }
}

exportUsers();
" > users-export.json

echo "✅ Users exported to users-export.json"

# Upload to VPS and import
echo "📤 Uploading and importing to VPS..."
sshpass -p "internship_pass" scp -o StrictHostKeyChecking=no users-export.json root@203.170.129.199:/var/www/internship-system/

# Import to VPS database
sshpass -p "internship_pass" ssh -o StrictHostKeyChecking=no root@203.170.129.199 << 'EOF'
cd /var/www/internship-system

# Clear existing users (except system users)
PGPASSWORD=internship_pass psql -U internship_user -d internship_system -h localhost -c "
DELETE FROM users WHERE id NOT IN ('user_admin', 'adminPick', 'admin001');
"

# Import users
npx tsx -e "
import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function importUsers() {
  try {
    const usersData = JSON.parse(fs.readFileSync('users-export.json', 'utf8'));
    
    console.log(\`Importing \${usersData.length} users...\`);
    
    for (const user of usersData) {
      try {
        await prisma.user.upsert({
          where: { id: user.id },
          update: user,
          create: user
        });
        console.log(\`✅ Imported user: \${user.id} - \${user.name}\`);
      } catch (error) {
        console.error(\`❌ Failed to import user \${user.id}:\`, error.message);
      }
    }
    
    console.log('✅ Users import completed');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.\$disconnect();
  }
}

importUsers();
"

# Restart PM2
pm2 restart internship-system

echo "✅ Users sync completed"
EOF

# Clean up
rm users-export.json

echo "🎉 Users sync to VPS completed!"
