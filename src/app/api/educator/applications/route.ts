import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const type = searchParams.get('type'); // internship type filter (internship | co_op)

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // ดึงข้อมูลผู้ใช้และตรวจสอบว่าเป็น educator หรือไม่
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        educatorRole: true,
        courseInstructors: {
          include: {
            supervisedStudents: {
              include: {
                application: {
                  include: {
                    student: true,
                    internship: {
                      include: {
                        company: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // ตรวจสอบว่าเป็น educator หรือไม่
    if (!user.educatorRole) {
      return NextResponse.json(
        { error: 'User is not an educator' },
        { status: 403 }
      );
    }

    // ดึงข้อมูล applications ตาม role
    let applications = [];

    if (user.educatorRole.name === 'อาจารย์นิเทศก์') {
      // อาจารย์นิเทศก์เห็น applications ของนักศึกษาที่อยู่ในความดูแล
      const supervisedStudentIds = user.courseInstructors
        .flatMap(ci => ci.supervisedStudents)
        .map(ss => ss.studentId);

      if (supervisedStudentIds.length > 0) {
        applications = await prisma.application.findMany({
          where: {
            studentId: { in: supervisedStudentIds },
            ...(status && { status: status as any }),
            ...(type && { internship: { type: type as any } })
          },
          include: {
            student: {
              select: {
                id: true,
                name: true,
                email: true,
                studentId: true,
                phone: true,
                skills: true,
                statement: true,
                profileImage: true,
                major: { select: { id: true, nameTh: true, nameEn: true } },
                department: { select: { id: true, nameTh: true, nameEn: true } },
                faculty: { select: { id: true, nameTh: true, nameEn: true } }
              }
            },
            internship: {
              include: {
                company: {
                  select: {
                    id: true,
                    name: true,
                    address: true
                  }
                }
              }
            },
            courseInstructor: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        });
      }
    } else if (user.educatorRole.name === 'อาจารย์ประจำวิชา') {
      // อาจารย์ประจำวิชาเห็นเฉพาะ applications ที่ถูกกำหนดให้ตน
      applications = await prisma.application.findMany({
        where: {
          courseInstructorId: userId, // ดูเฉพาะที่ถูกกำหนดให้ตน
          ...(status && { status: status as any }),
          ...(type && { internship: { type: type as any } })
        },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
              studentId: true,
              phone: true,
              skills: true,
              statement: true,
              profileImage: true,
              major: { select: { id: true, nameTh: true, nameEn: true } },
              department: { select: { id: true, nameTh: true, nameEn: true } },
              faculty: { select: { id: true, nameTh: true, nameEn: true } }
            }
          },
          internship: {
            include: {
              company: {
                select: {
                  id: true,
                  name: true,
                  address: true
                }
              }
            }
          },
          courseInstructor: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    } else {
      // กรรมการเห็น applications ทั้งหมด
      applications = await prisma.application.findMany({
        where: {
          ...(status && { status: status as any }),
          ...(type && { internship: { type: type as any } })
        },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
              studentId: true,
              phone: true,
              skills: true,
              statement: true,
              profileImage: true,
              major: { select: { id: true, nameTh: true, nameEn: true } },
              department: { select: { id: true, nameTh: true, nameEn: true } },
              faculty: { select: { id: true, nameTh: true, nameEn: true } }
            }
          },
          internship: {
            include: {
              company: {
                select: {
                  id: true,
                  name: true,
                  address: true
                }
              }
            }
          },
          courseInstructor: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    }

    return NextResponse.json({
      applications,
      user: {
        id: user.id,
        name: user.name,
        role: user.educatorRole.name
      }
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
