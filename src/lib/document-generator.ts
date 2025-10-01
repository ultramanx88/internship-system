import fs from 'fs';
import path from 'path';

export interface DocumentData {
  studentName: string;
  studentId: string;
  companyName: string;
  documentNumber: string;
  documentDate: string;
  currentDate: string;
  [key: string]: any; // Allow additional fields
}

export interface DocumentTemplate {
  id: string;
  name: string;
  filename: string;
  type: 'internship' | 'co-op';
  language: 'th' | 'en';
  format: 'docx' | 'pdf';
  description?: string;
}

/**
 * Get available document templates
 */
export function getAvailableTemplates(
  type?: 'internship' | 'co-op',
  language?: 'th' | 'en'
): DocumentTemplate[] {
  const templates: DocumentTemplate[] = [];
  const baseDir = path.join(process.cwd(), 'document-templates');
  
  const types = type ? [type] : ['internship', 'co-op'];
  const languages = language ? [language] : ['th', 'en'];
  
  types.forEach(docType => {
    languages.forEach(lang => {
      const langDir = path.join(baseDir, docType, lang);
      
      if (fs.existsSync(langDir)) {
        const files = fs.readdirSync(langDir);
        
        files.forEach(file => {
          if (file.endsWith('.docx') || file.endsWith('.pdf')) {
            const format = file.endsWith('.docx') ? 'docx' : 'pdf';
            const name = path.basename(file, path.extname(file));
            
            templates.push({
              id: `${docType}_${lang}_${name}`,
              name,
              filename: file,
              type: docType as 'internship' | 'co-op',
              language: lang as 'th' | 'en',
              format,
            });
          }
        });
      }
    });
  });
  
  return templates;
}

/**
 * Get template file path
 */
export function getTemplatePath(
  type: 'internship' | 'co-op',
  language: 'th' | 'en',
  filename: string
): string {
  return path.join(process.cwd(), 'document-templates', type, language, filename);
}

/**
 * Generate output file path for generated document
 */
export function generateOutputPath(
  type: 'internship' | 'co-op',
  language: 'th' | 'en',
  documentNumber: string,
  studentId: string,
  templateName: string,
  format: 'docx' | 'pdf'
): string {
  const now = new Date();
  const year = now.getFullYear().toString();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const timestamp = now.toISOString().replace(/[:.]/g, '').slice(0, 15);
  
  const filename = `${documentNumber}_${studentId}_${templateName}_${language}_${timestamp}.${format}`;
  const outputDir = path.join(process.cwd(), 'generated-documents', type, year, month);
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  return path.join(outputDir, filename);
}

/**
 * Replace placeholders in text content
 */
export function replacePlaceholders(content: string, data: DocumentData): string {
  let result = content;
  
  Object.entries(data).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`;
    result = result.replace(new RegExp(placeholder, 'g'), value?.toString() || '');
  });
  
  return result;
}

/**
 * Get document history for a student
 */
export function getDocumentHistory(studentId: string): string[] {
  const documents: string[] = [];
  const baseDir = path.join(process.cwd(), 'generated-documents');
  
  ['internship', 'co-op'].forEach(type => {
    const typeDir = path.join(baseDir, type);
    
    if (fs.existsSync(typeDir)) {
      // Recursively search for files containing studentId
      const searchDir = (dir: string) => {
        const items = fs.readdirSync(dir);
        
        items.forEach(item => {
          const itemPath = path.join(dir, item);
          const stat = fs.statSync(itemPath);
          
          if (stat.isDirectory()) {
            searchDir(itemPath);
          } else if (item.includes(studentId)) {
            documents.push(itemPath);
          }
        });
      };
      
      searchDir(typeDir);
    }
  });
  
  return documents.sort().reverse(); // Most recent first
}

/**
 * Archive old documents (move to archive folder)
 */
export function archiveOldDocuments(olderThanYears: number = 3): number {
  const cutoffDate = new Date();
  cutoffDate.setFullYear(cutoffDate.getFullYear() - olderThanYears);
  
  let archivedCount = 0;
  const baseDir = path.join(process.cwd(), 'generated-documents');
  const archiveDir = path.join(baseDir, 'archive');
  
  ['internship', 'co-op'].forEach(type => {
    const typeDir = path.join(baseDir, type);
    
    if (fs.existsSync(typeDir)) {
      const years = fs.readdirSync(typeDir);
      
      years.forEach(year => {
        const yearNum = parseInt(year);
        if (yearNum && yearNum < cutoffDate.getFullYear()) {
          const sourcePath = path.join(typeDir, year);
          const targetPath = path.join(archiveDir, type, year);
          
          // Create target directory
          if (!fs.existsSync(path.dirname(targetPath))) {
            fs.mkdirSync(path.dirname(targetPath), { recursive: true });
          }
          
          // Move directory
          fs.renameSync(sourcePath, targetPath);
          archivedCount++;
        }
      });
    }
  });
  
  return archivedCount;
}

/**
 * Clean up temporary files
 */
export function cleanupTempFiles(): number {
  let cleanedCount = 0;
  const tempDir = path.join(process.cwd(), 'temp');
  
  if (fs.existsSync(tempDir)) {
    const files = fs.readdirSync(tempDir);
    
    files.forEach(file => {
      const filePath = path.join(tempDir, file);
      const stat = fs.statSync(filePath);
      
      // Delete files older than 1 hour
      if (Date.now() - stat.mtime.getTime() > 60 * 60 * 1000) {
        fs.unlinkSync(filePath);
        cleanedCount++;
      }
    });
  }
  
  return cleanedCount;
}