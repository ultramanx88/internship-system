import { NextResponse, type NextRequest } from 'next/server';
import { applications as mockApplications, users as mockUsers, internships as mockInternships } from '@/lib/data';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const sort = searchParams.get('sort') || 'desc'; // desc = ล่าสุดก่อน, asc = เก่าสุดก่อน
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // สร้างข้อมูลจาก mock data - เฉพาะสถานะ pending
    const tableData = mockApplications
      .filter(app => app.status === 'pending')
      .map(app => {
        const student = mockUsers.find(u => u.id === app.studentId);
        const internship = mockInternships.find(i => i.id === app.internshipId);
        return {
          id: app.id,
          studentId: app.studentId,
          studentName: student?.name || 'N/A',
          major: 'เทคโนโลยีสารสนเทศ', // Mock data
          companyName: internship?.companyId || 'N/A',
          status: app.status,
          dateApplied: app.dateApplied,
          feedback: app.feedback,
          projectTopic: app.projectTopic,
        };
      });

    // กรองข้อมูลตามการค้นหา
    let filteredData = tableData.filter(item => {
      const matchesSearch = !search || 
        item.studentName.toLowerCase().includes(search.toLowerCase()) ||
        item.studentId.toLowerCase().includes(search.toLowerCase()) ||
        item.companyName.toLowerCase().includes(search.toLowerCase());
      
      return matchesSearch;
    });

    // เรียงลำดับข้อมูลตามวันที่
    switch (sort) {
      case 'desc':
        filteredData.sort((a, b) => new Date(b.dateApplied).getTime() - new Date(a.dateApplied).getTime());
        break;
      case 'asc':
        filteredData.sort((a, b) => new Date(a.dateApplied).getTime() - new Date(b.dateApplied).getTime());
        break;
    }

    // คำนวณ pagination
    const totalCount = filteredData.length;
    const offset = (page - 1) * limit;
    const paginatedData = filteredData.slice(offset, offset + limit);

    return NextResponse.json({
      applications: paginatedData,
      total: totalCount,
      page: page,
      limit: limit,
      totalPages: Math.ceil(totalCount / limit)
    });
  } catch (error) {
    console.error('Failed to fetch pending applications:', error);
    return NextResponse.json({ 
      message: 'Failed to fetch pending applications',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}