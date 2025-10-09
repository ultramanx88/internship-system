import { 
  WorkflowStep, 
  WorkflowState, 
  UserProfile, 
  ApplicationFormData, 
  Application 
} from './types';
import { WORKFLOW_STEPS, NAVIGATION_RULES } from './constants';
import { WorkflowValidator } from './validation';

export class WorkflowManager {
  /**
   * รับขั้นตอนปัจจุบันของผู้ใช้
   */
  static getCurrentStep(profile: UserProfile, application?: Application): WorkflowStep {
    const profileValidation = WorkflowValidator.validateProfile(profile);

    // หากถูกปฏิเสธ ให้ย้อนกลับไปเริ่มที่ขั้นตอนที่ 1 (แก้ไขโปรไฟล์/เริ่มใหม่)
    if (application?.status === 'rejected') {
      return this.getStepById(1);
    }

    // ตรวจสอบขั้นตอนที่สามารถดำเนินการได้
    for (let i = 1; i <= WORKFLOW_STEPS.length; i++) {
      const canProceed = WorkflowValidator.canProceedToStep(i, profile, application as any);
      if (!canProceed) {
        return this.getStepById(i);
      }
    }
    
    // หากผ่านทุกขั้นตอนแล้ว ให้กลับไปขั้นตอนสุดท้าย
    return this.getStepById(WORKFLOW_STEPS.length);
  }

  /**
   * รับขั้นตอนตาม ID
   */
  static getStepById(stepId: number): WorkflowStep {
    const step = WORKFLOW_STEPS.find(s => s.id === stepId);
    if (!step) {
      throw new Error(`Step ${stepId} not found`);
    }
    return step;
  }

  /**
   * ตรวจสอบว่าสามารถดำเนินการขั้นตอนต่อไปได้หรือไม่
   */
  static canProceedToStep(stepId: number, profile: UserProfile, application?: Application): boolean {
    return WorkflowValidator.canProceedToStep(stepId, profile, application as any);
  }

  /**
   * รับขั้นตอนถัดไป
   */
  static getNextStep(currentStepId: number): WorkflowStep | null {
    const nextStepId = currentStepId + 1;
    if (nextStepId > WORKFLOW_STEPS.length) {
      return null;
    }
    return this.getStepById(nextStepId);
  }

  /**
   * รับขั้นตอนก่อนหน้า
   */
  static getPreviousStep(currentStepId: number): WorkflowStep | null {
    const previousStepId = currentStepId - 1;
    if (previousStepId < 1) {
      return null;
    }
    return this.getStepById(previousStepId);
  }

  /**
   * รับสถานะของขั้นตอนทั้งหมด
   */
  static getWorkflowState(profile: UserProfile, application?: Application): WorkflowState {
    const currentStep = this.getCurrentStep(profile, application);
    const completedSteps: number[] = [];
    const lockedSteps: number[] = [];

    // ตรวจสอบขั้นตอนที่เสร็จสิ้นแล้ว
    for (let i = 1; i < currentStep.id; i++) {
      if (this.canProceedToStep(i, profile, application)) {
        completedSteps.push(i);
      }
    }

    // ตรวจสอบขั้นตอนที่ล็อค
    for (let i = currentStep.id + 1; i <= WORKFLOW_STEPS.length; i++) {
      if (!this.canProceedToStep(i, profile, application)) {
        lockedSteps.push(i);
      }
    }

    return {
      currentStep: currentStep.id,
      completedSteps,
      lockedSteps,
      canProceed: this.canProceedToStep(currentStep.id, profile, application),
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * รับขั้นตอนทั้งหมดพร้อมสถานะ
   */
  static getAllStepsWithStatus(profile: UserProfile, application?: Application): WorkflowStep[] {
    const state = this.getWorkflowState(profile, application);
    
    return WORKFLOW_STEPS.map(step => {
      let status: 'completed' | 'current' | 'pending' | 'locked' = 'pending';
      
      if (state.completedSteps.includes(step.id)) {
        status = 'completed';
      } else if (step.id === state.currentStep) {
        status = 'current';
      } else if (state.lockedSteps.includes(step.id)) {
        status = 'locked';
      }

      return {
        ...step,
        status,
        canProceed: this.canProceedToStep(step.id, profile, application)
      };
    });
  }

  /**
   * ตรวจสอบว่าขั้นตอนมี dependencies หรือไม่
   */
  static hasDependencies(stepId: number): boolean {
    const step = this.getStepById(stepId);
    return step.dependencies.length > 0;
  }

  /**
   * รับ dependencies ของขั้นตอน
   */
  static getStepDependencies(stepId: number): string[] {
    const step = this.getStepById(stepId);
    return step.dependencies;
  }

  /**
   * ตรวจสอบว่า dependencies ครบถ้วนหรือไม่
   */
  static areDependenciesMet(stepId: number, profile: UserProfile, application?: Application): boolean {
    const dependencies = this.getStepDependencies(stepId);
    
    for (const dependency of dependencies) {
      switch (dependency) {
        case 'profile_complete':
          if (!WorkflowValidator.validateProfile(profile).valid) {
            return false;
          }
          break;
        case 'application_submitted':
          if (!application || application.status !== 'submitted') {
            return false;
          }
          break;
        case 'application_approved':
          if (!application || application.status !== 'approved') {
            return false;
          }
          break;
        case 'documents_uploaded':
          // ตรวจสอบว่ามีเอกสารอัปโหลดแล้วหรือไม่
          if (!application || !('documents' in application) || !Array.isArray(application.documents) || application.documents.length === 0) {
            return false;
          }
          break;
        case 'internship_active':
          if (!application || !['approved', 'in_progress'].includes(application.status)) {
            return false;
          }
          break;
      }
    }
    
    return true;
  }

  /**
   * รับข้อความแจ้งเตือนสำหรับขั้นตอน
   */
  static getStepMessage(stepId: number, profile: UserProfile, application?: Application): string {
    const step = this.getStepById(stepId);
    
    if (step.status === 'locked') {
      const dependencies = this.getStepDependencies(stepId);
      if (dependencies.includes('profile_complete')) {
        return 'กรุณากรอกโปรไฟล์ให้ครบก่อน';
      }
      if (dependencies.includes('application_submitted')) {
        return 'กรุณาส่งคำขอฝึกงานก่อน';
      }
      if (dependencies.includes('application_approved')) {
        return 'รอการอนุมัติคำขอฝึกงาน';
      }
      if (dependencies.includes('documents_uploaded')) {
        return 'กรุณาอัปโหลดเอกสารก่อน';
      }
      if (dependencies.includes('internship_active')) {
        return 'ยังไม่สามารถเข้าสู่ช่วงฝึกงานได้';
      }
    }
    
    return step.description;
  }

  /**
   * รับเปอร์เซ็นต์ความคืบหน้า
   */
  static getProgressPercentage(profile: UserProfile, application?: Application): number {
    const state = this.getWorkflowState(profile, application);
    const totalSteps = WORKFLOW_STEPS.length;
    const completedSteps = state.completedSteps.length;
    
    return Math.round((completedSteps / totalSteps) * 100);
  }
}
