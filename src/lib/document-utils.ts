/**
 * Utility functions for document generation with language-specific formatting
 */

export interface StudentData {
  // Thai name data
  t_title?: string;
  t_name?: string;
  t_middle_name?: string;
  t_surname?: string;
  
  // English name data
  e_title?: string;
  e_name?: string;
  e_middle_name?: string;
  e_surname?: string;
  
  // Other data
  studentId: string;
  email?: string;
  major?: string;
}

export interface CompanyData {
  name: string;
  nameEn?: string;
  address?: string;
  province?: string;
  phone?: string;
  email?: string;
}

export interface DocumentMetadata {
  documentNumber: string;
  documentDate: Date;
  currentDate?: Date;
}

/**
 * Convert Arabic numerals to Thai numerals
 */
export function toThaiNumerals(text: string): string {
  const thaiNumerals = ['๐', '๑', '๒', '๓', '๔', '๕', '๖', '๗', '๘', '๙'];
  return text.replace(/[0-9]/g, (digit) => thaiNumerals[parseInt(digit)]);
}

/**
 * Convert Thai numerals to Arabic numerals
 */
export function toArabicNumerals(text: string): string {
  const thaiToArabic: { [key: string]: string } = {
    '๐': '0', '๑': '1', '๒': '2', '๓': '3', '๔': '4',
    '๕': '5', '๖': '6', '๗': '7', '๘': '8', '๙': '9'
  };
  return text.replace(/[๐-๙]/g, (digit) => thaiToArabic[digit] || digit);
}

/**
 * Format Thai full name
 */
export function formatThaiName(student: StudentData): string {
  const parts = [
    student.t_title,
    student.t_name,
    student.t_middle_name,
    student.t_surname
  ].filter(Boolean);
  
  return parts.join(' ');
}

/**
 * Format English full name
 */
export function formatEnglishName(student: StudentData): string {
  const parts = [
    student.e_title,
    student.e_name,
    student.e_middle_name,
    student.e_surname
  ].filter(Boolean);
  
  return parts.join(' ');
}

/**
 * Format date in Thai format
 */
export function formatThaiDate(date: Date): string {
  const thaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];
  
  const day = date.getDate();
  const month = thaiMonths[date.getMonth()];
  const year = date.getFullYear() + 543; // Convert to Buddhist Era
  
  return `${toThaiNumerals(day.toString())} ${month} พ.ศ. ${toThaiNumerals(year.toString())}`;
}

/**
 * Format date in English format
 */
export function formatEnglishDate(date: Date): string {
  const englishMonths = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const day = date.getDate();
  const month = englishMonths[date.getMonth()];
  const year = date.getFullYear();
  
  return `${day} ${month} ${year}`;
}

/**
 * Format short date in Thai format (dd/mm/yyyy)
 */
export function formatThaiShortDate(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = (date.getFullYear() + 543).toString();
  
  return toThaiNumerals(`${day}/${month}/${year}`);
}

/**
 * Format short date in English format (dd/mm/yyyy)
 */
export function formatEnglishShortDate(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear().toString();
  
  return `${day}/${month}/${year}`;
}

/**
 * Generate document data for Thai templates
 */
export function generateThaiDocumentData(
  student: StudentData,
  company: CompanyData,
  metadata: DocumentMetadata
): Record<string, string> {
  const currentDate = metadata.currentDate || new Date();
  
  return {
    // Student information
    studentName: formatThaiName(student),
    studentId: toThaiNumerals(student.studentId),
    studentIdOriginal: student.studentId,
    studentTitle: student.t_title || '',
    studentFirstName: student.t_name || '',
    studentMiddleName: student.t_middle_name || '',
    studentLastName: student.t_surname || '',
    studentEmail: student.email || '',
    studentMajor: student.major || 'วิศวกรรมคอมพิวเตอร์',
    
    // Company information
    companyName: company.name,
    companyAddress: company.address || '',
    companyProvince: company.province || '',
    companyPhone: company.phone ? toThaiNumerals(company.phone) : '',
    companyEmail: company.email || '',
    
    // Document metadata
    documentNumber: toThaiNumerals(metadata.documentNumber),
    documentNumberOriginal: metadata.documentNumber,
    documentDate: formatThaiDate(metadata.documentDate),
    documentDateShort: formatThaiShortDate(metadata.documentDate),
    currentDate: formatThaiDate(currentDate),
    currentDateShort: formatThaiShortDate(currentDate),
    
    // Academic year (Thai)
    academicYear: toThaiNumerals((currentDate.getFullYear() + 543).toString()),
    semester: toThaiNumerals('1'), // Default semester
    
    // University information (Thai)
    universityName: 'มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี',
    facultyName: 'คณะวิศวกรรมศาสตร์',
    departmentName: 'ภาควิชาวิศวกรรมคอมพิวเตอร์',
  };
}

/**
 * Generate document data for English templates
 */
export function generateEnglishDocumentData(
  student: StudentData,
  company: CompanyData,
  metadata: DocumentMetadata
): Record<string, string> {
  const currentDate = metadata.currentDate || new Date();
  
  return {
    // Student information
    studentName: formatEnglishName(student),
    studentId: student.studentId,
    studentTitle: student.e_title || '',
    studentFirstName: student.e_name || '',
    studentMiddleName: student.e_middle_name || '',
    studentLastName: student.e_surname || '',
    studentEmail: student.email || '',
    studentMajor: student.major || 'Computer Engineering',
    
    // Company information
    companyName: company.nameEn || company.name,
    companyAddress: company.address || '',
    companyProvince: company.province || '',
    companyPhone: company.phone || '',
    companyEmail: company.email || '',
    
    // Document metadata
    documentNumber: metadata.documentNumber,
    documentDate: formatEnglishDate(metadata.documentDate),
    documentDateShort: formatEnglishShortDate(metadata.documentDate),
    currentDate: formatEnglishDate(currentDate),
    currentDateShort: formatEnglishShortDate(currentDate),
    
    // Academic year (English)
    academicYear: currentDate.getFullYear().toString(),
    semester: '1', // Default semester
    
    // University information (English)
    universityName: 'King Mongkut\'s University of Technology Thonburi',
    universityNameShort: 'KMUTT',
    facultyName: 'Faculty of Engineering',
    departmentName: 'Department of Computer Engineering',
  };
}

/**
 * Get template data based on language
 */
export function getTemplateData(
  language: 'th' | 'en',
  student: StudentData,
  company: CompanyData,
  metadata: DocumentMetadata
): Record<string, string> {
  if (language === 'th') {
    return generateThaiDocumentData(student, company, metadata);
  } else {
    return generateEnglishDocumentData(student, company, metadata);
  }
}

/**
 * Validate student data for specific language
 */
export function validateStudentData(student: StudentData, language: 'th' | 'en'): string[] {
  const errors: string[] = [];
  
  if (language === 'th') {
    if (!student.t_name) errors.push('ไม่พบชื่อภาษาไทย');
    if (!student.t_surname) errors.push('ไม่พบนามสกุลภาษาไทย');
  } else {
    if (!student.e_name) errors.push('ไม่พบชื่อภาษาอังกฤษ');
    if (!student.e_surname) errors.push('ไม่พบนามสกุลภาษาอังกฤษ');
  }
  
  if (!student.studentId) errors.push('ไม่พบรหัสนักศึกษา');
  
  return errors;
}

/**
 * Get available languages for a student
 */
export function getAvailableLanguages(student: StudentData): ('th' | 'en')[] {
  const languages: ('th' | 'en')[] = [];
  
  if (student.t_name && student.t_surname) {
    languages.push('th');
  }
  
  if (student.e_name && student.e_surname) {
    languages.push('en');
  }
  
  return languages;
}