import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const role = searchParams.get('role');

    // ถ้าไม่มี userId ใน query params ให้ลองดึงจาก Authorization header
    let actualUserId = userId;
    if (!actualUserId) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        // ในระบบจริงจะต้อง decode JWT token
        // ตอนนี้ใช้ mock data
        actualUserId = 'user_t6800001'; // Mock user ID
      }
    }

    if (!actualUserId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // ดึงข้อมูลผู้ใช้
    const user = await prisma.user.findUnique({
      where: { id: actualUserId },
      include: {
        educatorRole: true,
        courseInstructors: {
          include: {
            supervisedStudents: {
              include: {
                student: true,
                application: {
                  include: {
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

    // คำนวณข้อมูล dashboard ตาม role
    const dashboardData = await calculateDashboardData(user, role);

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

async function calculateDashboardData(user: any, role: string | null) {
  const now = new Date();
  const currentYear = now.getFullYear() + 543; // Convert to Buddhist year

  // ข้อมูลกำหนดการใกล้ถึง
  const upcomingSchedule = await getUpcomingSchedule(user.id, role);

  // ข้อมูลเอกสารนักศึกษา
  const studentDocuments = await getStudentDocumentStats(user.id, role);

  // งานของฉัน
  const myTasks = await getMyTasks(user.id, role);

  // รายชื่อนักศึกษา
  const students = await getStudentList(user.id, role);

  // ขั้นตอนการยื่นสหกิจศึกษา
  const coopSteps = getCoopSteps();

  // การแจ้งเตือน
  const notifications = await getNotifications(user.id, role);

  return {
    upcomingSchedule,
    studentDocuments,
    myTasks,
    students,
    coopSteps,
    notifications,
    user: {
      id: user.id,
      name: user.name,
      role: user.educatorRole?.name || 'บุคลากรทางการศึกษา'
    }
  };
}

async function getUpcomingSchedule(userId: string, role: string | null) {
  // Mock data - ในระบบจริงจะดึงจากตาราง schedule/events
  return [
    {
      id: '1',
      date: '11 มิ.ย. 2568',
      time: '9:00-16:30',
      title: 'ยื่นเอกสาร ณ ห้องธุรการชั้น 4',
      description: 'นักศึกษายื่นเอกสารฝึกงาน',
      handler: 'ธุรการ',
      type: 'document'
    },
    {
      id: '2',
      date: '24 ก.ค. 2568',
      time: '9:00-16:30',
      title: 'อาจารย์ตรวจเยี่ยมสหกิจศึกษา',
      description: 'ตรวจเยี่ยมนักศึกษาที่บริษัท',
      handler: 'อจ.กานต์',
      type: 'supervision'
    }
  ];
}

async function getStudentDocumentStats(userId: string, role: string | null) {
  // Mock data - ในระบบจริงจะคำนวณจากตาราง applications
  return [
    { status: 'approved', count: 60, percentage: 60, color: 'bg-blue-500' },
    { status: 'pending', count: 20, percentage: 20, color: 'bg-orange-500' },
    { status: 'selecting', count: 20, percentage: 20, color: 'bg-pink-500' }
  ];
}

async function getMyTasks(userId: string, role: string | null) {
  // Mock data - ในระบบจริงจะคำนวณจากตาราง tasks/assignments
  const baseTasks = [
    {
      id: '1',
      title: 'ยังไม่ได้นัดหมายนิเทศ',
      count: 6,
      priority: 'high',
      href: '/educator/supervision-appointment'
    },
    {
      id: '2',
      title: 'ค้างตรวจโปรเจกต์นักศึกษา',
      count: 30,
      priority: 'high',
      href: '/educator/student-projects'
    }
  ];

  // เพิ่มงานตาม role
  if (role === 'อาจารย์นิเทศก์') {
    baseTasks.push({
      id: '3',
      title: 'ค้างการบันทึกผลนิเทศ',
      count: 10,
      priority: 'medium',
      href: '/educator/supervision-report'
    });
  }

  if (role === 'อาจารย์ประจำวิชา') {
    baseTasks.push({
      id: '4',
      title: 'ค้างการประเมิน',
      count: 50,
      priority: 'medium',
      href: '/educator/evaluate'
    });
  }

  return baseTasks;
}

async function getStudentList(userId: string, role: string | null) {
  // Mock data - ในระบบจริงจะดึงจากตาราง supervised_students
  return [
    {
      id: '1',
      name: 'นาย A',
      studentId: '64000000',
      company: 'บริษัท A',
      contactPerson: 'ชื่อผู้ติดต่อ',
      supervisor: 'อาจารย์ A',
      appointmentStatus: 'not_scheduled',
      additionalInfo: 'ข้อมูลเพิ่มเติม'
    },
    {
      id: '2',
      name: 'นาย B',
      studentId: '64000001',
      company: 'บริษัท B',
      contactPerson: 'ชื่อผู้ติดต่อ B',
      supervisor: 'อาจารย์ B',
      appointmentStatus: 'scheduled',
      additionalInfo: 'ข้อมูลเพิ่มเติม B'
    }
  ];
}

function getCoopSteps() {
  return [
    {
      id: '1',
      step: 1,
      title: 'กรอกข้อมูลสหกิจศึกษา',
      dateRange: '7 มิ.ย. 68 - 19 มิ.ย. 68',
      status: 'completed'
    },
    {
      id: '2',
      step: 2,
      title: 'ยื่นเอกสาร ณ ห้องธุรการชั้น 4',
      dateRange: '7 มิ.ย. 68 - 19 มิ.ย. 68',
      status: 'current'
    },
    {
      id: '3',
      step: 3,
      title: 'ยื่นเอกสารให้กับทางบริษัท',
      dateRange: '7 มิ.ย. 68 - 19 มิ.ย. 68',
      status: 'upcoming'
    },
    {
      id: '4',
      step: 4,
      title: 'สหกิจศึกษา',
      dateRange: '7 มิ.ย. 68 - 19 มิ.ย. 68',
      status: 'upcoming'
    },
    {
      id: '5',
      step: 5,
      title: 'กรอกหัวข้อโปรเจค',
      dateRange: '7 มิ.ย. 68 - 19 มิ.ย. 68',
      status: 'upcoming'
    }
  ];
}

async function getNotifications(userId: string, role: string | null) {
  // Mock data - ในระบบจริงจะดึงจากตาราง notifications
  return [
    {
      id: '1',
      title: 'แอดมินแจ้งปรับปรุงระบบ',
      message: 'วันที่ 10 / 06 / 68',
      time: '5 มิถุยายน 2568 14.00',
      type: 'info'
    },
    {
      id: '2',
      title: 'นศ. ส่งเอกสารเพิ่มเติม',
      message: '20 คน',
      time: '5 มิถุยายน 2568 13.00',
      type: 'success'
    }
  ];
}
