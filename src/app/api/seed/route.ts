import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { users, internships, applications } from "@/lib/data";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    // ตรวจสอบว่าเป็น development environment หรือมี secret key
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get("secret");

    // ใช้ secret key เพื่อป้องกันการเรียกใช้โดยไม่ได้รับอนุญาต
    if (secret !== "seed-data-2024") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Starting database seeding...");

    // ตรวจสอบว่ามีข้อมูลผู้ใช้แล้วหรือไม่
    const existingUsers = await prisma.user.count();
    if (existingUsers > 0) {
      return NextResponse.json({
        message: "Database already seeded",
        existingUsers,
      });
    }

    // Seed Users
    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password || "123456", 10);

      await prisma.user.upsert({
        where: { email: user.email },
        update: {
          name: user.name,
          password: hashedPassword,
          roles: JSON.stringify(user.roles),
          skills: user.skills,
          statement: user.statement,
        },
        create: {
          id: user.id,
          name: user.name,
          email: user.email,
          password: hashedPassword,
          roles: JSON.stringify(user.roles),
          skills: user.skills,
          statement: user.statement,
        },
      });
    }
    console.log(`Seeded ${users.length} users.`);

    // Seed Companies first
    const uniqueCompanyIds = [...new Set(internships.map((i) => i.companyId))];
    for (const companyId of uniqueCompanyIds) {
      const existingCompany = await prisma.company.findFirst({
        where: { id: companyId },
      });

      if (!existingCompany) {
        await prisma.company.create({
          data: {
            id: companyId,
            name: `Company ${companyId}`, // Generate a name from ID
            isActive: true,
          },
        });
      }
    }
    console.log(`Seeded ${uniqueCompanyIds.length} companies.`);

    // Seed Internships
    for (const internship of internships) {
      const company = await prisma.company.findFirst({
        where: { id: internship.companyId },
      });

      if (company) {
        await prisma.internship.upsert({
          where: { id: internship.id },
          update: {},
          create: {
            id: internship.id,
            title: internship.title,
            companyId: company.id,
            location: internship.location,
            description: internship.description,
            type: internship.type as any,
          },
        });
      }
    }
    console.log(`Seeded ${internships.length} internships.`);

    // Seed Applications
    for (const app of applications) {
      await prisma.application.upsert({
        where: { id: app.id },
        update: {},
        create: {
          id: app.id,
          studentId: app.studentId,
          internshipId: app.internshipId,
          status: app.status as any,
          dateApplied: new Date(app.dateApplied),
          feedback: app.feedback,
          projectTopic: app.projectTopic,
        },
      });
    }
    console.log(`Seeded ${applications.length} applications.`);

    return NextResponse.json({
      message: "Database seeded successfully",
      data: {
        users: users.length,
        companies: uniqueCompanyIds.length,
        internships: internships.length,
        applications: applications.length,
      },
    });
  } catch (error) {
    console.error("Seeding error:", error);
    return NextResponse.json(
      {
        error: "Failed to seed database",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
