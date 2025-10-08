import { WorkflowStep, UserProfile, Application } from './types';

export class WorkflowUtils {
  /**
   * รับข้อความตามภาษา
   */
  static getLocalizedMessage(key: string, language: 'th' | 'en' = 'th'): string {
    const messages = {
      th: {
        profileIncomplete: 'กรุณากรอกโปรไฟล์ให้ครบก่อน',
        applicationIncomplete: 'กรุณากรอกข้อมูลการฝึกงานให้ครบก่อน',
        documentsIncomplete: 'กรุณาอัปโหลดเอกสารที่จำเป็นก่อน',
        internshipNotActive: 'ยังไม่สามารถเข้าสู่ช่วงฝึกงานได้',
        projectIncomplete: 'กรุณากรอกข้อมูลโปรเจกต์ให้ครบก่อน',
        stepCompleted: 'ขั้นตอนนี้เสร็จสิ้นแล้ว',
        stepCurrent: 'ขั้นตอนปัจจุบัน',
        stepPending: 'รอดำเนินการ',
        stepLocked: 'ยังไม่สามารถดำเนินการได้',
        proceed: 'ดำเนินการ',
        edit: 'แก้ไข',
        view: 'ดู',
        back: 'กลับ',
        next: 'ถัดไป',
        submit: 'ส่ง',
        save: 'บันทึก',
        cancel: 'ยกเลิก'
      },
      en: {
        profileIncomplete: 'Please complete your profile first',
        applicationIncomplete: 'Please complete the internship application first',
        documentsIncomplete: 'Please upload required documents first',
        internshipNotActive: 'Cannot proceed to internship period yet',
        projectIncomplete: 'Please complete project details first',
        stepCompleted: 'This step is completed',
        stepCurrent: 'Current step',
        stepPending: 'Pending',
        stepLocked: 'Cannot proceed yet',
        proceed: 'Proceed',
        edit: 'Edit',
        view: 'View',
        back: 'Back',
        next: 'Next',
        submit: 'Submit',
        save: 'Save',
        cancel: 'Cancel'
      }
    };

    return messages[language][key as keyof typeof messages[typeof language]] || key;
  }

  /**
   * ตรวจสอบภาษา
   */
  static detectLanguage(): 'th' | 'en' {
    if (typeof window !== 'undefined') {
      return (navigator.language || 'th').toLowerCase().startsWith('en') ? 'en' : 'th';
    }
    return 'th';
  }

  /**
   * รับไอคอนสำหรับขั้นตอน
   */
  static getStepIcon(step: WorkflowStep): string {
    const iconMap: Record<string, string> = {
      user: 'User',
      'file-text': 'FileText',
      upload: 'Upload',
      briefcase: 'Briefcase',
      target: 'Target'
    };
    
    return iconMap[step.icon] || 'Circle';
  }

  /**
   * รับสีสำหรับสถานะ
   */
  static getStatusColor(status: string): string {
    const colorMap: Record<string, string> = {
      completed: 'green',
      current: 'blue',
      pending: 'yellow',
      locked: 'gray',
      error: 'red'
    };
    
    return colorMap[status] || 'gray';
  }

  /**
   * รับคลาส CSS สำหรับสถานะ
   */
  static getStatusClass(status: string): string {
    const classMap: Record<string, string> = {
      completed: 'bg-green-100 text-green-800 border-green-200',
      current: 'bg-blue-100 text-blue-800 border-blue-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      locked: 'bg-gray-100 text-gray-500 border-gray-200',
      error: 'bg-red-100 text-red-800 border-red-200'
    };
    
    return classMap[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  }

  /**
   * รับเปอร์เซ็นต์ความคืบหน้า
   */
  static calculateProgress(completedSteps: number, totalSteps: number): number {
    return Math.round((completedSteps / totalSteps) * 100);
  }

  /**
   * รับข้อความความคืบหน้า
   */
  static getProgressMessage(completedSteps: number, totalSteps: number, language: 'th' | 'en' = 'th'): string {
    const percentage = this.calculateProgress(completedSteps, totalSteps);
    
    if (language === 'en') {
      return `${completedSteps} of ${totalSteps} steps completed (${percentage}%)`;
    }
    
    return `เสร็จสิ้น ${completedSteps} จาก ${totalSteps} ขั้นตอน (${percentage}%)`;
  }

  /**
   * ตรวจสอบว่าขั้นตอนเป็นขั้นตอนสุดท้ายหรือไม่
   */
  static isLastStep(stepId: number, totalSteps: number): boolean {
    return stepId === totalSteps;
  }

  /**
   * ตรวจสอบว่าขั้นตอนเป็นขั้นตอนแรกหรือไม่
   */
  static isFirstStep(stepId: number): boolean {
    return stepId === 1;
  }

  /**
   * รับข้อความสำหรับปุ่ม
   */
  static getButtonText(step: WorkflowStep, language: 'th' | 'en' = 'th'): string {
    if (step.status === 'completed') {
      return this.getLocalizedMessage('edit', language);
    }
    
    if (step.status === 'current') {
      return this.getLocalizedMessage('proceed', language);
    }
    
    if (step.status === 'locked') {
      return this.getLocalizedMessage('stepLocked', language);
    }
    
    return this.getLocalizedMessage('proceed', language);
  }

  /**
   * รับข้อความแจ้งเตือนสำหรับขั้นตอน
   */
  static getStepAlertMessage(step: WorkflowStep, language: 'th' | 'en' = 'th'): string | null {
    if (step.status === 'locked') {
      if (step.dependencies.includes('profile_complete')) {
        return this.getLocalizedMessage('profileIncomplete', language);
      }
      if (step.dependencies.includes('application_submitted')) {
        return this.getLocalizedMessage('applicationIncomplete', language);
      }
      if (step.dependencies.includes('documents_uploaded')) {
        return this.getLocalizedMessage('documentsIncomplete', language);
      }
      if (step.dependencies.includes('internship_active')) {
        return this.getLocalizedMessage('internshipNotActive', language);
      }
    }
    
    return null;
  }

  /**
   * ตรวจสอบว่าขั้นตอนมีข้อความแจ้งเตือนหรือไม่
   */
  static hasStepAlert(step: WorkflowStep): boolean {
    return this.getStepAlertMessage(step) !== null;
  }

  /**
   * รับวันที่ในรูปแบบที่อ่านง่าย
   */
  static formatDate(date: string | Date, language: 'th' | 'en' = 'th'): string {
    const d = new Date(date);
    
    if (language === 'en') {
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    
    return d.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * รับเวลาที่ผ่านมา
   */
  static getTimeAgo(date: string | Date, language: 'th' | 'en' = 'th'): string {
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);
    
    const intervals = [
      { label: language === 'th' ? 'ปี' : 'year', seconds: 31536000 },
      { label: language === 'th' ? 'เดือน' : 'month', seconds: 2592000 },
      { label: language === 'th' ? 'วัน' : 'day', seconds: 86400 },
      { label: language === 'th' ? 'ชั่วโมง' : 'hour', seconds: 3600 },
      { label: language === 'th' ? 'นาที' : 'minute', seconds: 60 }
    ];
    
    for (const interval of intervals) {
      const count = Math.floor(diffInSeconds / interval.seconds);
      if (count > 0) {
        return language === 'th' 
          ? `${count} ${interval.label}ที่แล้ว`
          : `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
      }
    }
    
    return language === 'th' ? 'เมื่อสักครู่' : 'Just now';
  }

  /**
   * ตรวจสอบว่าข้อมูลเป็นค่าว่างหรือไม่
   */
  static isEmpty(value: any): boolean {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') return value.trim() === '';
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
  }

  /**
   * รับข้อความข้อผิดพลาด
   */
  static getErrorMessage(error: any, language: 'th' | 'en' = 'th'): string {
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    
    return language === 'th' 
      ? 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ'
      : 'An unknown error occurred';
  }

  /**
   * ตรวจสอบว่าข้อมูลถูกต้องหรือไม่
   */
  static isValidData(data: any): boolean {
    return data !== null && data !== undefined && data !== '';
  }

  /**
   * รับข้อมูลที่ถูกต้อง
   */
  static getValidData(data: any, defaultValue: any = null): any {
    return this.isValidData(data) ? data : defaultValue;
  }
}
