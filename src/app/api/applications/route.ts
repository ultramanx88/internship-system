import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, cleanup } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    // Check authentication and authorization
    const authResult = await requireAuth(request, ['admin', 'staff']);
    if ('error' in authResult) {
      return authResult.error;
    }
    const { user } = authResult;

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const internshipId = searchParams.get('internshipId');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const sort = searchParams.get('sort') || 'desc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    console.log('Applications API - Fetching applications by:', user.name, 'studentId:', studentId, 'internshipId:', internshipId);
    
    const whereClause: any = {};
    if (studentId) whereClause.studentId = studentId;
    if (internshipId) whereClause.internshipId = internshipId;
    if (status !== 'all') whereClause.status = status;
    
    // Add search functionality
    if (search) {
      whereClause.OR = [
        {
          student: {
            name: { contains: search, mode: 'insensitive' }
          }
        },
        {
          internship: {
            company: {
              name: { contains: search, mode: 'insensitive' }
            }
          }
        }
      ];
    }

    const skip = (page - 1) * limit;
    
    const [applications, total] = await Promise.all([
      prisma.application.findMany({
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
              e_surname: true,
              major: { select: { id: true, nameTh: true, nameEn: true } }
            }
          },
          internship: {
            include: {
              company: true
            }
          }
        },
        orderBy: {
          dateApplied: sort === 'desc' ? 'desc' : 'asc'
        },
        skip,
        take: limit
      }),
      prisma.application.count({ where: whereClause })
    ]);
    
    console.log('Applications API - Found applications:', applications.length, 'total:', total);
    
    return NextResponse.json({
      success: true,
      applications,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Applications API - Error fetching applications:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch applications',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await cleanup();
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      studentId: studentIdFromBody, 
      internshipId, 
      studentReason, 
      expectedSkills, 
      preferredStartDate, 
      availableDuration,
      projectProposal,
      status = 'pending',
      // Optional company/address integration
      company: companyPayload
    } = body;
    // Try resolve studentId from header if not provided
    const studentIdHeader = request.headers.get('x-user-id') || undefined;
    const studentId = studentIdFromBody || studentIdHeader;

    console.log('Applications API - Creating application:', { studentId, internshipId, status });
    
    // Validation: require student (internship will be created as placeholder if missing)
    if (!studentId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields (studentId)' },
        { status: 400 }
      );
    }

    // Business rule: Student profile must be complete (workflow 1 completed)
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        facultyId: true,
        majorId: true,
      },
    });
    if (!student) {
      return NextResponse.json({ success: false, error: 'Student not found' }, { status: 404 });
    }
    const missingProfileFields: string[] = [];
    if (!student.name) missingProfileFields.push('name');
    if (!student.email) missingProfileFields.push('email');
    if (!student.phone) missingProfileFields.push('phone');
    if (!student.facultyId) missingProfileFields.push('facultyId');
    if (!student.majorId) missingProfileFields.push('majorId');
    if (missingProfileFields.length > 0) {
      return NextResponse.json(
        { success: false, error: 'PROFILE_INCOMPLETE', details: { missing: missingProfileFields } },
        { status: 422 }
      );
    }

    // Business rule: Application details must be provided (workflow 2 completed)
    if (!projectProposal || !studentReason) {
      return NextResponse.json(
        { success: false, error: 'APPLICATION_DETAILS_REQUIRED', details: { required: ['projectProposal', 'studentReason'] } },
        { status: 422 }
      );
    }
    
    // ตรวจสอบว่าไม่ได้สมัครซ้ำ
    const existingApplication = internshipId ? await prisma.application.findFirst({
      where: {
        studentId,
        internshipId
      }
    }) : null;
    
    if (existingApplication) {
      return NextResponse.json(
        { success: false, error: 'Already applied to this internship' },
        { status: 409 }
      );
    }

    // หาอาจารย์ประจำวิชาที่เหมาะสม (ในระบบจริงจะใช้ logic ที่ซับซ้อนกว่า)
    // const courseInstructor = await prisma.user.findFirst({
    //   where: {
    //     roles: {
    //       contains: 'courseInstructor'
    //     }
    //   }
    // });

    // ถ้ามีข้อมูลบริษัท/ที่อยู่/พิกัด ส่งมาพร้อมกัน ให้บันทึกลง Company ที่ผูกกับ internship
    if (companyPayload && internshipId) {
      try {
        const { name, phone, address, provinceId, districtId, subdistrictId, postalCode, latitude, longitude } = companyPayload;
        const internship = await prisma.internship.findUnique({ where: { id: internshipId }, select: { companyId: true } });
        if (internship?.companyId) {
          await prisma.company.update({
            where: { id: internship.companyId },
            data: {
              name: name ?? undefined,
              phone: phone ?? undefined,
              address: address ?? undefined,
              postalCode: postalCode ?? undefined,
              latitude: latitude ? Number(latitude) : undefined,
              longitude: longitude ? Number(longitude) : undefined,
              provinceIdRef: provinceId ?? undefined,
              districtIdRef: districtId ?? undefined,
              subdistrictIdRef: subdistrictId ?? undefined,
            },
          });
        }
      } catch (e) {
        console.warn('Company enrichment skipped:', e);
      }
    }

    // หากไม่มี internshipId จะสร้าง company + internship ชั่วคราวให้คำขอนี้ (รองรับ flow ที่ไม่เลือกบริษัท/ตำแหน่งในขั้นแรก)
    let createdInternshipId = internshipId;
    if (!createdInternshipId && (companyPayload || true)) {
      try {
        const {
          name,
          phone,
          address,
          provinceId,
          districtId,
          subdistrictId,
          postalCode,
          latitude,
          longitude,
        } = companyPayload || {};

        const company = await prisma.company.create({
          data: {
            name: name || 'บริษัท (รอดำเนินการ)',
            phone: phone ?? null,
            address: address ?? null,
            postalCode: postalCode ?? null,
            latitude: latitude ? Number(latitude) : null,
            longitude: longitude ? Number(longitude) : null,
            provinceIdRef: provinceId ?? null,
            districtIdRef: districtId ?? null,
            subdistrictIdRef: subdistrictId ?? null,
          },
        });

        const internship = await prisma.internship.create({
          data: {
            title: (expectedSkills as string) || 'Internship',
            titleEn: null,
            companyId: company.id,
            location: address || '—',
            description: (projectProposal as string) || (studentReason as string) || '—',
            descriptionEn: null,
            type: 'internship',
          },
        });
        createdInternshipId = internship.id;
      } catch (e) {
        console.error('Failed to auto-create internship:', e);
        return NextResponse.json({ success: false, error: 'Failed to create internship' }, { status: 500 });
      }
    }

    const application = await prisma.application.create({
      data: {
        studentId,
        internshipId: createdInternshipId!,
        // courseInstructorId: courseInstructor?.id,
        status: status as any,
        dateApplied: new Date(),
        feedback: null,
        projectTopic: projectProposal || null
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            t_name: true,
            t_surname: true,
            e_name: true,
            e_surname: true,
            major: { select: { id: true, nameTh: true, nameEn: true } }
          }
        },
        internship: {
          include: {
            company: true
          }
        }
        // courseInstructor: {
        //   select: {
        //     id: true,
        //     name: true,
        //     email: true
        //   }
        // }
      }
    });
    
    console.log('Applications API - Created application:', application.id);
    
    return NextResponse.json({
      success: true,
      application
    });
  } catch (error) {
    console.error('Applications API - Error creating application:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create application',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await cleanup();
  }
}

// PATCH: allow staff/admin to update application status (e.g., approve -> workflow step 4)
export async function PATCH(request: NextRequest) {
  try {
    const authResult = await requireAuth(request, ['admin', 'staff']);
    if ('error' in authResult) {
      return authResult.error;
    }
    const body = await request.json();
    const { id, status, feedback } = body as { id?: string; status?: string; feedback?: string };
    if (!id || !status) {
      return NextResponse.json({ success: false, error: 'Missing id or status' }, { status: 400 });
    }

    const updated = await prisma.application.update({
      where: { id },
      data: {
        status: status as any,
        feedback: feedback ?? null,
      },
      include: {
        student: true,
        internship: { include: { company: true } },
      },
    });

    return NextResponse.json({ success: true, application: updated });
  } catch (error) {
    console.error('Applications API - Error updating application:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update application' },
      { status: 500 }
    );
  } finally {
    await cleanup();
  }
}