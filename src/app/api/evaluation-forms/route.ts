import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive');
    
    console.log('Evaluation Forms API - Fetching forms, isActive:', isActive);
    
    const whereClause: any = {};
    if (isActive !== null) {
      whereClause.isActive = isActive === 'true';
    }
    
    const forms = await prisma.evaluationForm.findMany({
      where: whereClause,
      include: {
        questions: {
          orderBy: {
            order: 'asc'
          }
        },
        _count: {
          select: {
            evaluations: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log('Evaluation Forms API - Found forms:', forms.length);
    
    return NextResponse.json({
      success: true,
      forms
    });
  } catch (error) {
    console.error('Evaluation Forms API - Error fetching forms:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch evaluation forms',
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
    const { title, description, questions, isActive = true } = body;
    
    console.log('Evaluation Forms API - Creating form:', title);
    
    const form = await prisma.evaluationForm.create({
      data: {
        title,
        description,
        isActive,
        questions: {
          create: questions.map((question: any, index: number) => ({
            question: question.question,
            questionType: question.questionType || 'rating',
            options: question.options ? JSON.stringify(question.options) : null,
            isRequired: question.isRequired !== false,
            order: question.order || index + 1
          }))
        }
      },
      include: {
        questions: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    });
    
    console.log('Evaluation Forms API - Created form:', form.id);
    
    return NextResponse.json({
      success: true,
      form
    });
  } catch (error) {
    console.error('Evaluation Forms API - Error creating form:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create evaluation form',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
