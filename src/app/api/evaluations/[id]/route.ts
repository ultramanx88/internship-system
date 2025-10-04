import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    console.log('Evaluation API - Fetching evaluation:', id);
    
    const evaluation = await prisma.evaluation.findUnique({
      where: { id },
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
      }
    });
    
    if (!evaluation) {
      return NextResponse.json(
        { success: false, error: 'Evaluation not found' },
        { status: 404 }
      );
    }
    
    console.log('Evaluation API - Found evaluation:', evaluation.id);
    
    return NextResponse.json({
      success: true,
      evaluation
    });
  } catch (error) {
    console.error('Evaluation API - Error fetching evaluation:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch evaluation',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { answers, status } = body;
    
    console.log('Evaluation API - Updating evaluation:', id);
    
    // Update evaluation
    const evaluation = await prisma.evaluation.update({
      where: { id },
      data: {
        status: status || 'submitted',
        submittedAt: status === 'submitted' ? new Date() : undefined,
        answers: answers ? {
          deleteMany: {},
          create: answers.map((answer: any) => ({
            questionId: answer.questionId,
            answerValue: answer.answerValue,
            answerText: answer.answerText || null
          }))
        } : undefined
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
    
    console.log('Evaluation API - Updated evaluation:', evaluation.id);
    
    return NextResponse.json({
      success: true,
      evaluation
    });
  } catch (error) {
    console.error('Evaluation API - Error updating evaluation:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update evaluation',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    console.log('Evaluation API - Deleting evaluation:', id);
    
    await prisma.evaluation.delete({
      where: { id }
    });
    
    console.log('Evaluation API - Deleted evaluation:', id);
    
    return NextResponse.json({
      success: true,
      message: 'Evaluation deleted successfully'
    });
  } catch (error) {
    console.error('Evaluation API - Error deleting evaluation:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete evaluation',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
