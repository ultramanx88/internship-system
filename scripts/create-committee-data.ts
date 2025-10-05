import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createCommitteeData() {
  try {
    console.log('🚀 Creating committee data...');

    // 1. สร้างกรรมการ 6 ท่าน
    console.log('👥 Creating committee members...');
    const committeeMembers = [];
    
    for (let i = 1; i <= 6; i++) {
      const member = await prisma.user.upsert({
        where: { email: `committee_${i}@university.ac.th` },
        update: {},
        create: {
          name: `กรรมการ ${i}`,
          email: `committee_${i}@university.ac.th`,
          password: await bcrypt.hash('123456', 12),
          roles: '["กรรมการ"]',
          t_title: 'อาจารย์',
          t_name: `กรรมการ`,
          t_surname: `${i}`,
          e_title: 'Prof.',
          e_name: `Committee`,
          e_surname: `${i}`,
          phone: `080-${i.toString().padStart(3, '0')}-${(i * 111).toString().padStart(4, '0')}`,
          nationality: 'ไทย',
          campus: 'วิทยาเขตหลัก'
        }
      });
      committeeMembers.push(member);
      console.log(`✅ Created committee member ${i}:`, member.name);
    }

    // 2. สร้าง Committee สำหรับปี 2567 ภาค 1
    console.log('🏛️ Creating committee...');
    const committee = await prisma.committee.upsert({
      where: { id: 'committee_2567_1' },
      update: {},
      create: {
        id: 'committee_2567_1',
        name: 'คณะกรรมการประเมินการฝึกงาน ภาคเรียนที่ 1/2567',
        nameEn: 'Internship Evaluation Committee Semester 1/2024',
        description: 'คณะกรรมการประเมินการฝึกงานและสหกิจศึกษาสำหรับภาคเรียนที่ 1 ปีการศึกษา 2567',
        academicYear: '2567',
        semester: '1',
        isActive: true
      }
    });
    console.log('✅ Created committee:', committee.name);

    // 3. เพิ่มกรรมการเข้า Committee
    console.log('👨‍💼 Adding members to committee...');
    for (let i = 0; i < committeeMembers.length; i++) {
      const member = committeeMembers[i];
      const role = i === 0 ? 'chair' : i === 1 ? 'secretary' : 'member';
      
      await prisma.committeeMember.upsert({
        where: {
          committeeId_userId: {
            committeeId: committee.id,
            userId: member.id
          }
        },
        update: {},
        create: {
          committeeId: committee.id,
          userId: member.id,
          role: role,
          isActive: true
        }
      });
      console.log(`✅ Added ${member.name} as ${role}`);
    }

    // 4. สร้าง Committee สำหรับปี 2567 ภาค 2
    const committee2 = await prisma.committee.upsert({
      where: { id: 'committee_2567_2' },
      update: {},
      create: {
        id: 'committee_2567_2',
        name: 'คณะกรรมการประเมินการฝึกงาน ภาคเรียนที่ 2/2567',
        nameEn: 'Internship Evaluation Committee Semester 2/2024',
        description: 'คณะกรรมการประเมินการฝึกงานและสหกิจศึกษาสำหรับภาคเรียนที่ 2 ปีการศึกษา 2567',
        academicYear: '2567',
        semester: '2',
        isActive: true
      }
    });
    console.log('✅ Created committee 2:', committee2.name);

    // เพิ่มกรรมการบางคนเข้า Committee 2 (ไม่ครบ 6 คน)
    const selectedMembers = committeeMembers.slice(0, 4); // เลือกแค่ 4 คน
    for (let i = 0; i < selectedMembers.length; i++) {
      const member = selectedMembers[i];
      const role = i === 0 ? 'chair' : i === 1 ? 'secretary' : 'member';
      
      await prisma.committeeMember.upsert({
        where: {
          committeeId_userId: {
            committeeId: committee2.id,
            userId: member.id
          }
        },
        update: {},
        create: {
          committeeId: committee2.id,
          userId: member.id,
          role: role,
          isActive: true
        }
      });
      console.log(`✅ Added ${member.name} as ${role} to committee 2`);
    }

    console.log('\n🎉 Committee data created successfully!');
    console.log('📊 Summary:');
    console.log(`- Committee members: ${committeeMembers.length}`);
    console.log(`- Committees: 2 (2567/1 and 2567/2)`);
    console.log(`- Committee 1 members: 6`);
    console.log(`- Committee 2 members: 4`);

  } catch (error) {
    console.error('❌ Error creating committee data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createCommitteeData();
