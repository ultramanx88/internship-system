import { NextRequest, NextResponse } from "next/server";
import { readdir, stat } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

// Helper function to get directory size
async function getDirectorySize(dirPath: string): Promise<number> {
  let totalSize = 0;

  try {
    if (!existsSync(dirPath)) {
      return 0;
    }

    const files = await readdir(dirPath, { withFileTypes: true });

    for (const file of files) {
      const filePath = path.join(dirPath, file.name);

      if (file.isDirectory()) {
        totalSize += await getDirectorySize(filePath);
      } else {
        const stats = await stat(filePath);
        totalSize += stats.size;
      }
    }
  } catch (error) {
    console.warn("Error calculating directory size:", error);
  }

  return totalSize;
}

// Helper function to count files in directory
async function countFiles(dirPath: string): Promise<number> {
  let fileCount = 0;

  try {
    if (!existsSync(dirPath)) {
      return 0;
    }

    const files = await readdir(dirPath, { withFileTypes: true });

    for (const file of files) {
      const filePath = path.join(dirPath, file.name);

      if (file.isDirectory()) {
        fileCount += await countFiles(filePath);
      } else {
        fileCount++;
      }
    }
  } catch (error) {
    console.warn("Error counting files:", error);
  }

  return fileCount;
}

// Helper function to format bytes
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    const uploadsDir = path.join(process.cwd(), "public/uploads");
    const profilesDir = path.join(uploadsDir, "profiles");

    let stats: any = {
      totalSize: 0,
      totalFiles: 0,
      formattedSize: "0 Bytes",
      profiles: {
        size: 0,
        files: 0,
        formattedSize: "0 Bytes",
      },
    };

    // Get overall stats
    if (existsSync(uploadsDir)) {
      stats.totalSize = await getDirectorySize(uploadsDir);
      stats.totalFiles = await countFiles(uploadsDir);
      stats.formattedSize = formatBytes(stats.totalSize);
    }

    // Get profiles stats
    if (existsSync(profilesDir)) {
      stats.profiles.size = await getDirectorySize(profilesDir);
      stats.profiles.files = await countFiles(profilesDir);
      stats.profiles.formattedSize = formatBytes(stats.profiles.size);
    }

    // Get user-specific stats if userId provided
    if (userId) {
      const userDirs = await readdir(profilesDir, { withFileTypes: true });
      let userSize = 0;
      let userFiles = 0;

      for (const yearDir of userDirs) {
        if (yearDir.isDirectory()) {
          const yearPath = path.join(profilesDir, yearDir.name);
          const monthDirs = await readdir(yearPath, { withFileTypes: true });

          for (const monthDir of monthDirs) {
            if (monthDir.isDirectory()) {
              const monthPath = path.join(yearPath, monthDir.name);
              const userDirPath = path.join(monthPath, userId);

              if (existsSync(userDirPath)) {
                userSize += await getDirectorySize(userDirPath);
                userFiles += await countFiles(userDirPath);
              }
            }
          }
        }
      }

      stats.user = {
        id: userId,
        size: userSize,
        files: userFiles,
        formattedSize: formatBytes(userSize),
      };
    }

    // Add recommendations
    const recommendations: string[] = [];

    if (stats.totalSize > 100 * 1024 * 1024) {
      // > 100MB
      recommendations.push(
        "พื้นที่เก็บไฟล์เริ่มเต็ม ควรพิจารณาลบไฟล์เก่าที่ไม่ใช้"
      );
    }

    if (stats.profiles.files > 1000) {
      recommendations.push(
        "มีไฟล์รูปโปรไฟล์จำนวนมาก ระบบจะลบไฟล์เก่าอัตโนมัติ"
      );
    }

    stats.recommendations = recommendations;

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Storage stats error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to get storage stats",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
