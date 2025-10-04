import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const companyId = searchParams.get('companyId');
    const internshipId = searchParams.get('internshipId');
    const status = searchParams.get('status');
    
    console.log('Evaluations API - Fetching evaluations, studentId:', studentId, 'companyId:', companyId, 'internshipId:', internshipId);
    
    const whereClause: any = {};
    if (studentId) whereClause.studentId = studentId;
    if (companyId) whereClause.companyId = companyId;
    if (internshipId) whereClause.internshipId = internshipId;
    if (status) whereClause.status = status;
    
    const evaluations = await prisma.evaluation.findMany({
      where: whereClause,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            t_name: true,
            t_surname: true,
            e_name: true,
            e_surname: true
          }
        },
        company: {
          select: {
            id: true,
            name: true,
            nameEn: true,
            addressNumber: true,
            building: true,
            floor: true,
            soi: true,
            road: true,
            postalCode: true,
            mapUrl: true,
            phone: true,
            email: true,
            website: true,
            province: {
              select: {
                nameTh: true,
                nameEn: true
              }
            },
            district: {
              select: {
                nameTh: true,
                nameEn: true
              }
            },
            subdistrict: {
              select: {
                nameTh: true,
                nameEn: true
              }
            }
          }
        },
        internship: {
          select: {
            id: true,
            title: true,
            location: true,
            description: true,
            type: true
          }
        },
        evaluationForm: {
          select: {
            id: true,
            title: true,
            description: true
          }
        },
        answers: {
          include: {
            question: {
              select: {
                id: true,
                question: true,
                questionType: true,
                order: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log('Evaluations API - Found evaluations:', evaluations.length);
    
    return NextResponse.json({
      success: true,
      evaluations
    });
  } catch (error) {
    console.error('Evaluations API - Error fetching evaluations:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch evaluations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, companyId, internshipId, evaluationFormId, answers } = body;
    
    console.log('Evaluations API - Creating evaluation for student:', studentId, 'company:', companyId);
    
    // Check if evaluation already exists
    const existingEvaluation = await prisma.evaluation.findFirst({
      where: {
        studentId,
        companyId,
        internshipId: internshipId || null
      }
    });
    
    if (existingEvaluation) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Evaluation already exists for this student and company',
          evaluationId: existingEvaluation.id
        },
        { status: 400 }
      );
    }
    
    // Create evaluation
    const evaluation = await prisma.evaluation.create({
      data: {
        studentId,
        companyId,
        internshipId: internshipId || null,
        evaluationFormId,
        status: 'submitted',
        submittedAt: new Date(),
        answers: {
          create: answers.map((answer: any) => ({
            questionId: answer.questionId,
            answerValue: answer.answerValue,
            answerText: answer.answerText || undefined
          }))
        }
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        company: {
          select: {
            id: true,
            name: true,
            nameEn: true
          }
        },
        evaluationForm: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });
    
    console.log('Evaluations API - Created evaluation:', evaluation.id);
    
    return NextResponse.json({
      success: true,
      evaluation
    });
  } catch (error) {
    console.error('Evaluations API - Error creating evaluation:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create evaluation',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
