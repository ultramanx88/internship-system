/**
 * Enhanced Backup Service
 * Handles automated backup, migration, and restore operations
 */

import { PrismaClient, BackupType, BackupStatus } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const prisma = new PrismaClient();
const execAsync = promisify(exec);

export interface BackupOptions {
  type: BackupType;
  includeMedia?: boolean;
  includeLogs?: boolean;
  createdBy?: string;
  description?: string;
}

export interface RestoreOptions {
  backupId: string;
  restoreTo?: 'local' | 'production';
  includeMedia?: boolean;
  includeLogs?: boolean;
}

class BackupService {
  private static instance: BackupService;
  private backupDir: string;
  private maxBackups: number = 30; // Keep last 30 backups

  private constructor() {
    this.backupDir = path.join(process.cwd(), 'backups');
    this.ensureBackupDirectory();
  }

  public static getInstance(): BackupService {
    if (!BackupService.instance) {
      BackupService.instance = new BackupService();
    }
    return BackupService.instance;
  }

  private ensureBackupDirectory(): void {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  /**
   * Create a new backup
   */
  public async createBackup(options: BackupOptions): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T').join('_').substring(0, 19);
    const filename = `backup-${options.type.toLowerCase()}-${timestamp}.json`;
    const filePath = path.join(this.backupDir, filename);

    // Create backup record
    const backupRecord = await prisma.backupRecord.create({
      data: {
        filename,
        filePath,
        fileSize: BigInt(0),
        backupType: options.type,
        status: BackupStatus.IN_PROGRESS,
        metadata: {
          includeMedia: options.includeMedia || false,
          includeLogs: options.includeLogs || false,
          description: options.description,
        },
        createdBy: options.createdBy,
      },
    });

    try {
      let backupData: any = {};

      // Export database data based on backup type
      if (options.type === BackupType.FULL || options.type === BackupType.DATA_ONLY) {
        backupData = await this.exportDatabaseData();
      }

      if (options.type === BackupType.FULL || options.type === BackupType.SCHEMA_ONLY) {
        backupData.schema = await this.exportDatabaseSchema();
      }

      // Include media files if requested
      if (options.includeMedia) {
        backupData.media = await this.exportMediaFiles();
      }

      // Include logs if requested
      if (options.includeLogs) {
        backupData.logs = await this.exportLogs();
      }

      // Add metadata
      backupData.metadata = {
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        backupType: options.type,
        createdBy: options.createdBy,
        description: options.description,
      };

      // Write backup file
      fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2));

      // Update backup record
      const stats = fs.statSync(filePath);
      await prisma.backupRecord.update({
        where: { id: backupRecord.id },
        data: {
          fileSize: BigInt(stats.size),
          status: BackupStatus.COMPLETED,
          completedAt: new Date(),
        },
      });

      // Cleanup old backups
      await this.cleanupOldBackups();

      return backupRecord.id;
    } catch (error) {
      // Update backup record with error
      await prisma.backupRecord.update({
        where: { id: backupRecord.id },
        data: {
          status: BackupStatus.FAILED,
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        },
      });

      throw error;
    }
  }

  /**
   * Export database data
   */
  private async exportDatabaseData(): Promise<any> {
    const data = {
      faculties: await prisma.faculty.findMany(),
      departments: await prisma.department.findMany(),
      curriculums: await prisma.curriculum.findMany(),
      majors: await prisma.major.findMany(),
      users: await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          roles: true,
          skills: true,
          statement: true,
          t_title: true,
          t_name: true,
          t_middle_name: true,
          t_surname: true,
          e_title: true,
          e_name: true,
          e_middle_name: true,
          e_surname: true,
          facultyId: true,
          departmentId: true,
          curriculumId: true,
          majorId: true,
          studentYear: true,
          phone: true,
          campus: true,
          gpa: true,
          nationality: true,
          passportId: true,
          visaType: true,
          profileImage: true,
          internshipPhoto1: true,
          internshipPhoto2: true,
          notifyEmail: true,
          notifyPush: true,
          notifySms: true,
          notifyAppUpdates: true,
          notifyDeadlines: true,
          notifyNews: true,
          language: true,
          theme: true,
          dateFormat: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      companies: await prisma.company.findMany(),
      internships: await prisma.internship.findMany(),
      applications: await prisma.application.findMany(),
      documents: await prisma.document.findMany(),
      printRecords: await prisma.printRecord.findMany(),
      academicYears: await prisma.academicYear.findMany(),
      semesters: await prisma.semester.findMany(),
      educatorRoleAssignments: await prisma.educatorRoleAssignment.findMany(),
      provinces: await prisma.province.findMany(),
      districts: await prisma.district.findMany(),
      subdistricts: await prisma.subdistrict.findMany(),
      systemMedia: await prisma.systemMedia.findMany(),
    };

    return data;
  }

  /**
   * Export database schema
   */
  private async exportDatabaseSchema(): Promise<string> {
    try {
      // This would typically use pg_dump for PostgreSQL
      // For now, return a placeholder
      return 'Schema export not implemented yet';
    } catch (error) {
      console.error('Failed to export schema:', error);
      return '';
    }
  }

  /**
   * Export media files
   */
  private async exportMediaFiles(): Promise<any> {
    const mediaDir = path.join(process.cwd(), 'public', 'uploads');
    const mediaFiles: any = {};

    if (fs.existsSync(mediaDir)) {
      const files = fs.readdirSync(mediaDir, { withFileTypes: true });
      
      for (const file of files) {
        if (file.isDirectory()) {
          const subDir = path.join(mediaDir, file.name);
          const subFiles = fs.readdirSync(subDir);
          mediaFiles[file.name] = subFiles.map(f => ({
            filename: f,
            path: path.join('uploads', file.name, f),
          }));
        }
      }
    }

    return mediaFiles;
  }

  /**
   * Export logs
   */
  private async exportLogs(): Promise<any> {
    const logsDir = path.join(process.cwd(), 'logs');
    const logFiles: any = {};

    if (fs.existsSync(logsDir)) {
      const files = fs.readdirSync(logsDir);
      
      for (const file of files) {
        if (file.endsWith('.log')) {
          const filePath = path.join(logsDir, file);
          const stats = fs.statSync(filePath);
          
          // Only include recent logs (last 7 days)
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          
          if (stats.mtime > sevenDaysAgo) {
            logFiles[file] = {
              size: stats.size,
              modified: stats.mtime.toISOString(),
              path: path.join('logs', file),
            };
          }
        }
      }
    }

    return logFiles;
  }

  /**
   * Restore from backup
   */
  public async restoreBackup(options: RestoreOptions): Promise<void> {
    const backupRecord = await prisma.backupRecord.findUnique({
      where: { id: options.backupId },
    });

    if (!backupRecord) {
      throw new Error('Backup not found');
    }

    if (backupRecord.status !== BackupStatus.COMPLETED) {
      throw new Error('Backup is not completed or failed');
    }

    if (!fs.existsSync(backupRecord.filePath)) {
      throw new Error('Backup file not found');
    }

    try {
      // Read backup file
      const backupData = JSON.parse(fs.readFileSync(backupRecord.filePath, 'utf8'));

      // Clear existing data
      await this.clearDatabase();

      // Restore data
      if (backupData.faculties) {
        await prisma.faculty.createMany({ data: backupData.faculties });
      }
      if (backupData.departments) {
        await prisma.department.createMany({ data: backupData.departments });
      }
      if (backupData.curriculums) {
        await prisma.curriculum.createMany({ data: backupData.curriculums });
      }
      if (backupData.majors) {
        await prisma.major.createMany({ data: backupData.majors });
      }
      if (backupData.users) {
        await prisma.user.createMany({ data: backupData.users });
      }
      if (backupData.companies) {
        await prisma.company.createMany({ data: backupData.companies });
      }
      if (backupData.internships) {
        await prisma.internship.createMany({ data: backupData.internships });
      }
      if (backupData.applications) {
        await prisma.application.createMany({ data: backupData.applications });
      }
      if (backupData.documents) {
        await prisma.document.createMany({ data: backupData.documents });
      }
      if (backupData.printRecords) {
        await prisma.printRecord.createMany({ data: backupData.printRecords });
      }
      if (backupData.academicYears) {
        await prisma.academicYear.createMany({ data: backupData.academicYears });
      }
      if (backupData.semesters) {
        await prisma.semester.createMany({ data: backupData.semesters });
      }
      if (backupData.educatorRoleAssignments) {
        await prisma.educatorRoleAssignment.createMany({ data: backupData.educatorRoleAssignments });
      }
      if (backupData.provinces) {
        await prisma.province.createMany({ data: backupData.provinces });
      }
      if (backupData.districts) {
        await prisma.district.createMany({ data: backupData.districts });
      }
      if (backupData.subdistricts) {
        await prisma.subdistrict.createMany({ data: backupData.subdistricts });
      }
      if (backupData.systemMedia) {
        await prisma.systemMedia.createMany({ data: backupData.systemMedia });
      }

      // Restore media files if requested
      if (options.includeMedia && backupData.media) {
        await this.restoreMediaFiles(backupData.media);
      }

      // Restore logs if requested
      if (options.includeLogs && backupData.logs) {
        await this.restoreLogs(backupData.logs);
      }

    } catch (error) {
      console.error('Failed to restore backup:', error);
      throw error;
    }
  }

  /**
   * Clear database
   */
  private async clearDatabase(): Promise<void> {
    // Delete in reverse order of dependencies
    await prisma.printRecord.deleteMany();
    await prisma.document.deleteMany();
    await prisma.application.deleteMany();
    await prisma.internship.deleteMany();
    await prisma.company.deleteMany();
    await prisma.user.deleteMany();
    await prisma.major.deleteMany();
    await prisma.curriculum.deleteMany();
    await prisma.department.deleteMany();
    await prisma.faculty.deleteMany();
    await prisma.educatorRoleAssignment.deleteMany();
    await prisma.semester.deleteMany();
    await prisma.academicYear.deleteMany();
    await prisma.subdistrict.deleteMany();
    await prisma.district.deleteMany();
    await prisma.province.deleteMany();
    await prisma.systemMedia.deleteMany();
  }

  /**
   * Restore media files
   */
  private async restoreMediaFiles(mediaData: any): Promise<void> {
    const mediaDir = path.join(process.cwd(), 'public', 'uploads');
    
    for (const [dirName, files] of Object.entries(mediaData)) {
      const dirPath = path.join(mediaDir, dirName);
      
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

      for (const file of files as any[]) {
        // In a real implementation, you would copy the actual file content
        // For now, just create a placeholder
        const filePath = path.join(dirPath, file.filename);
        fs.writeFileSync(filePath, '');
      }
    }
  }

  /**
   * Restore logs
   */
  private async restoreLogs(logData: any): Promise<void> {
    const logsDir = path.join(process.cwd(), 'logs');
    
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    for (const [filename, logInfo] of Object.entries(logData)) {
      const filePath = path.join(logsDir, filename);
      // In a real implementation, you would restore the actual log content
      fs.writeFileSync(filePath, `Restored log: ${filename}\n`);
    }
  }

  /**
   * Get all backups
   */
  public async getBackups(limit: number = 50) {
    return await prisma.backupRecord.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        createdByUser: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  /**
   * Get backup by ID
   */
  public async getBackup(id: string) {
    return await prisma.backupRecord.findUnique({
      where: { id },
      include: {
        createdByUser: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  /**
   * Delete backup
   */
  public async deleteBackup(id: string): Promise<void> {
    const backup = await prisma.backupRecord.findUnique({
      where: { id },
    });

    if (!backup) {
      throw new Error('Backup not found');
    }

    // Delete file
    if (fs.existsSync(backup.filePath)) {
      fs.unlinkSync(backup.filePath);
    }

    // Delete record
    await prisma.backupRecord.delete({
      where: { id },
    });
  }

  /**
   * Cleanup old backups
   */
  private async cleanupOldBackups(): Promise<void> {
    const backups = await prisma.backupRecord.findMany({
      orderBy: { createdAt: 'desc' },
      skip: this.maxBackups,
    });

    for (const backup of backups) {
      await this.deleteBackup(backup.id);
    }
  }

  /**
   * Schedule automatic backups
   */
  public async scheduleBackups(): Promise<void> {
    // This would typically use a cron job or task scheduler
    // For now, just create a daily backup
    const lastBackup = await prisma.backupRecord.findFirst({
      where: { backupType: BackupType.FULL },
      orderBy: { createdAt: 'desc' },
    });

    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    if (!lastBackup || lastBackup.createdAt < oneDayAgo) {
      await this.createBackup({
        type: BackupType.FULL,
        includeMedia: true,
        includeLogs: false,
        description: 'Scheduled daily backup',
      });
    }
  }
}

// Export singleton instance
export const backupService = BackupService.getInstance();
