import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const role = await prisma.educatorRole.findUnique({
      where: { id }
    });

    if (!role) {
      return NextResponse.json(
        { error: 'Educator role not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(role);
  } catch (error) {
    console.error('Error fetching educator role:', error);
    return NextResponse.json(
      { error: 'Failed to fetch educator role' },
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

    const updatedRole = await prisma.educatorRole.update({
      where: { id },
      data: {
        name: body.name,
        nameEn: body.nameEn,
        description: body.description,
        isActive: body.isActive
      }
    });

    return NextResponse.json(updatedRole);
  } catch (error) {
    console.error('Error updating educator role:', error);
    return NextResponse.json(
      { error: 'Failed to update educator role' },
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

    await prisma.educatorRole.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting educator role:', error);
    return NextResponse.json(
      { error: 'Failed to delete educator role' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
