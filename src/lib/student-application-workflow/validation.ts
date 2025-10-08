import { 
  ApplicationFormData, 
  UserProfile, 
  ValidationResult, 
  Document 
} from './types';
import { VALIDATION_RULES } from './constants';

export class WorkflowValidator {
  /**
   * ตรวจสอบความสมบูรณ์ของโปรไฟล์ผู้ใช้
   */
  static validateProfile(profile: UserProfile): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const required = VALIDATION_RULES.profile.required;
    
    // ตรวจสอบฟิลด์ที่จำเป็น
    for (const field of required) {
      if (!profile[field as keyof UserProfile] || 
          (typeof profile[field as keyof UserProfile] === 'string' && 
           (profile[field as keyof UserProfile] as string).trim() === '')) {
        errors.push(`กรุณากรอก${this.getFieldLabel(field)}`);
      }
    }

    // ตรวจสอบความยาวของฟิลด์
    if (profile.name && profile.name.length < VALIDATION_RULES.profile.minLength.name) {
      errors.push(`ชื่อต้องมีอย่างน้อย ${VALIDATION_RULES.profile.minLength.name} ตัวอักษร`);
    }

    if (profile.email && profile.email.length < VALIDATION_RULES.profile.minLength.email) {
      errors.push(`อีเมลต้องมีอย่างน้อย ${VALIDATION_RULES.profile.minLength.email} ตัวอักษร`);
    }

    if (profile.phone && profile.phone.length < VALIDATION_RULES.profile.minLength.phone) {
      errors.push(`เบอร์โทรศัพท์ต้องมีอย่างน้อย ${VALIDATION_RULES.profile.minLength.phone} ตัวอักษร`);
    }

    // ตรวจสอบรูปแบบอีเมล
    if (profile.email && !this.isValidEmail(profile.email)) {
      errors.push('รูปแบบอีเมลไม่ถูกต้อง');
    }

    // ตรวจสอบรูปแบบเบอร์โทรศัพท์
    if (profile.phone && !this.isValidPhone(profile.phone)) {
      warnings.push('รูปแบบเบอร์โทรศัพท์อาจไม่ถูกต้อง');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * ตรวจสอบความสมบูรณ์ของฟอร์มสมัครฝึกงาน
   */
  static validateApplicationForm(data: ApplicationFormData): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const required = VALIDATION_RULES.application.required;

    // ตรวจสอบฟิลด์ที่จำเป็น
    for (const field of required) {
      if (!data[field as keyof ApplicationFormData] || 
          (typeof data[field as keyof ApplicationFormData] === 'string' && 
           (data[field as keyof ApplicationFormData] as string).trim() === '')) {
        errors.push(`กรุณากรอก${this.getFieldLabel(field)}`);
      }
    }

    // ตรวจสอบความยาวของฟิลด์
    if (data.position && data.position.length < VALIDATION_RULES.application.minLength.position) {
      errors.push(`ตำแหน่งงานต้องมีอย่างน้อย ${VALIDATION_RULES.application.minLength.position} ตัวอักษร`);
    }

    if (data.projectTopic && data.projectTopic.length < VALIDATION_RULES.application.minLength.projectTopic) {
      errors.push(`หัวข้อโปรเจกต์ต้องมีอย่างน้อย ${VALIDATION_RULES.application.minLength.projectTopic} ตัวอักษร`);
    }

    // ตรวจสอบวันที่
    if (data.startDate && data.endDate) {
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);
      
      if (startDate >= endDate) {
        errors.push('วันที่เริ่มต้นต้องมาก่อนวันที่สิ้นสุด');
      }

      const today = new Date();
      if (startDate < today) {
        warnings.push('วันที่เริ่มต้นไม่ควรเป็นอดีต');
      }
    }

    // ตรวจสอบข้อมูลที่อยู่
    if (data.address) {
      if (!data.address.province || !data.address.district || !data.address.subdistrict) {
        errors.push('กรุณาเลือกจังหวัด อำเภอ และตำบล');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * ตรวจสอบเอกสารที่อัปโหลด
   */
  static validateDocuments(documents: Document[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const required = VALIDATION_RULES.documents.required;

    // ตรวจสอบเอกสารที่จำเป็น
    for (const docType of required) {
      const hasDoc = documents.some(doc => doc.type === docType);
      if (!hasDoc) {
        errors.push(`กรุณาอัปโหลด${this.getDocumentLabel(docType)}`);
      }
    }

    // ตรวจสอบขนาดไฟล์และประเภทไฟล์
    for (const doc of documents) {
      if (doc.url) {
        // ตรวจสอบประเภทไฟล์
        const fileExtension = doc.url.split('.').pop()?.toLowerCase();
        if (fileExtension && !VALIDATION_RULES.documents.allowedTypes.includes(fileExtension)) {
          errors.push(`ไฟล์ ${doc.name} ไม่ใช่ประเภทที่อนุญาต`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * ตรวจสอบว่าสามารถดำเนินการขั้นตอนต่อไปได้หรือไม่
   */
  static canProceedToStep(step: number, profile: UserProfile, application?: ApplicationFormData): boolean {
    switch (step) {
      case 1:
        return true; // ขั้นตอนแรกสามารถเริ่มได้เสมอ
      
      case 2:
        return this.validateProfile(profile).valid;
      
      case 3:
        return application ? this.validateApplicationForm(application).valid : false;
      
      case 4:
        return application?.status === 'approved';
      
      case 5:
        return application?.status === 'approved' && 
               application?.address && 
               application.address.province && 
               application.address.district && 
               application.address.subdistrict;
      
      default:
        return false;
    }
  }

  /**
   * ตรวจสอบรูปแบบอีเมล
   */
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * ตรวจสอบรูปแบบเบอร์โทรศัพท์
   */
  private static isValidPhone(phone: string): boolean {
    const phoneRegex = /^[0-9\-\+\(\)\s]+$/;
    return phoneRegex.test(phone) && phone.replace(/[^0-9]/g, '').length >= 10;
  }

  /**
   * รับป้ายกำกับฟิลด์
   */
  private static getFieldLabel(field: string): string {
    const labels: Record<string, string> = {
      name: 'ชื่อ',
      email: 'อีเมล',
      phone: 'เบอร์โทรศัพท์',
      t_name: 'ชื่อ (ไทย)',
      t_surname: 'นามสกุล (ไทย)',
      t_title: 'คำนำหน้า',
      facultyId: 'คณะ',
      majorId: 'สาขา',
      departmentId: 'ภาควิชา',
      curriculumId: 'หลักสูตร',
      companyId: 'บริษัท',
      position: 'ตำแหน่งงาน',
      startDate: 'วันที่เริ่มต้น',
      endDate: 'วันที่สิ้นสุด',
      projectTopic: 'หัวข้อโปรเจกต์'
    };
    return labels[field] || field;
  }

  /**
   * รับป้ายกำกับเอกสาร
   */
  private static getDocumentLabel(type: string): string {
    const labels: Record<string, string> = {
      resume: 'เรซูเม่',
      transcript: 'ทรานสคริปต์',
      idCard: 'บัตรประชาชน',
      photo: 'รูปถ่าย'
    };
    return labels[type] || type;
  }
}
