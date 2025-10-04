import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function seedEvaluationData() {
  try {
    console.log('Starting evaluation data seeding...');

    // Create evaluation form
    console.log('📝 Creating evaluation form...');
    const evaluationForm = await prisma.evaluationForm.upsert({
      where: { id: 'eval-form-company' },
      update: {
        title: 'แบบประเมินสถานประกอบการ',
        description: 'แบบประเมินสำหรับนักศึกษาที่ฝึกงานหรือสหกิจศึกษา',
        isActive: true,
      },
      create: {
        id: 'eval-form-company',
        title: 'แบบประเมินสถานประกอบการ',
        description: 'แบบประเมินสำหรับนักศึกษาที่ฝึกงานหรือสหกิจศึกษา',
        isActive: true,
      },
    });
    console.log(`✅ Created evaluation form: ${evaluationForm.title}`);

    // Create evaluation questions
    console.log('❓ Creating evaluation questions...');
    const questions = [
      {
        id: 'q1',
        question: 'การสนับสนุนจากพี่เลี้ยง (Supervisor/Mentor Support)',
        questionType: 'rating',
        isRequired: true,
        order: 1,
      },
      {
        id: 'q2',
        question: 'ความเหมาะสมของงานที่ได้รับมอบหมาย (Task Appropriateness)',
        questionType: 'rating',
        isRequired: true,
        order: 2,
      },
      {
        id: 'q3',
        question: 'สภาพแวดล้อมและวัฒนธรรมองค์กร (Work Environment & Culture)',
        questionType: 'rating',
        isRequired: true,
        order: 3,
      },
      {
        id: 'q4',
        question: 'โอกาสในการเรียนรู้และพัฒนา (Learning & Development Opportunities)',
        questionType: 'rating',
        isRequired: true,
        order: 4,
      },
      {
        id: 'q5',
        question: 'ความพึงพอใจโดยรวม (Overall Satisfaction)',
        questionType: 'rating',
        isRequired: true,
        order: 5,
      },
      {
        id: 'q6',
        question: 'ความสะดวกในการเดินทาง (Transportation Convenience)',
        questionType: 'rating',
        isRequired: true,
        order: 6,
      },
      {
        id: 'q7',
        question: 'ความเหมาะสมของเวลาทำงาน (Working Hours)',
        questionType: 'rating',
        isRequired: true,
        order: 7,
      },
      {
        id: 'q8',
        question: 'การสื่อสารและความเข้าใจ (Communication & Understanding)',
        questionType: 'rating',
        isRequired: true,
        order: 8,
      },
    ];

    for (const question of questions) {
      await prisma.evaluationQuestion.upsert({
        where: { id: question.id },
        update: {
          question: question.question,
          questionType: question.questionType as any,
          isRequired: question.isRequired,
          order: question.order,
        },
        create: {
          id: question.id,
          evaluationFormId: evaluationForm.id,
          question: question.question,
          questionType: question.questionType as any,
          isRequired: question.isRequired,
          order: question.order,
        },
      });
    }
    console.log(`✅ Created ${questions.length} evaluation questions`);

    console.log('\n🎉 Evaluation data seeding completed successfully!');
    console.log(`\n📊 Summary:\n  - Evaluation Forms: 1\n  - Questions: ${questions.length}`);

  } catch (error) {
    console.error('Error seeding evaluation data:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedEvaluationData();
