import { WorkflowStep } from './types';
import { WORKFLOW_STEPS, NAVIGATION_RULES } from './constants';

export class WorkflowNavigation {
  /**
   * รับ route ของขั้นตอน
   */
  static getStepRoute(stepId: number): string {
    const step = WORKFLOW_STEPS.find(s => s.id === stepId);
    if (!step) {
      throw new Error(`Step ${stepId} not found`);
    }
    return step.route;
  }

  /**
   * ตรวจสอบว่าสามารถนำทางไปขั้นตอนได้หรือไม่
   */
  static canNavigateToStep(fromStepId: number, toStepId: number): boolean {
    // สามารถไปขั้นตอนก่อนหน้าได้เสมอ
    if (toStepId < fromStepId) {
      return true;
    }
    
  // ตรวจสอบว่าขั้นตอนถัดไปมีใน navigation rules หรือไม่
  const rule = NAVIGATION_RULES[`step${fromStepId}` as keyof typeof NAVIGATION_RULES];
  if (!rule) {
    return false;
  }
  
  // ตรวจสอบว่าขั้นตอนถัดไปเป็นขั้นตอนที่อนุญาตหรือไม่
  return 'nextStep' in rule ? rule.nextStep === toStepId : false;
  }

  /**
   * รับขั้นตอนถัดไปที่อนุญาต
   */
  static getNextAllowedStep(currentStepId: number): number | null {
    const rule = NAVIGATION_RULES[`step${currentStepId}` as keyof typeof NAVIGATION_RULES];
    return 'nextStep' in rule ? rule.nextStep : null;
  }

  /**
   * รับขั้นตอนก่อนหน้าที่อนุญาต
   */
  static getPreviousAllowedStep(currentStepId: number): number | null {
    const rule = NAVIGATION_RULES[`step${currentStepId}` as keyof typeof NAVIGATION_RULES];
    return 'previousStep' in rule ? rule.previousStep : null;
  }

  /**
   * รับ URL สำหรับขั้นตอนถัดไป
   */
  static getNextStepUrl(currentStepId: number): string | null {
    const nextStepId = this.getNextAllowedStep(currentStepId);
    if (!nextStepId) {
      return null;
    }
    return this.getStepRoute(nextStepId);
  }

  /**
   * รับ URL สำหรับขั้นตอนก่อนหน้า
   */
  static getPreviousStepUrl(currentStepId: number): string | null {
    const previousStepId = this.getPreviousAllowedStep(currentStepId);
    if (!previousStepId) {
      return null;
    }
    return this.getStepRoute(previousStepId);
  }

  /**
   * รับ breadcrumb สำหรับขั้นตอนปัจจุบัน
   */
  static getBreadcrumb(currentStepId: number): Array<{ label: string; href: string; active: boolean }> {
    const breadcrumb: Array<{ label: string; href: string; active: boolean }> = [];
    
    for (let i = 1; i <= currentStepId; i++) {
      const step = WORKFLOW_STEPS.find(s => s.id === i);
      if (step) {
        breadcrumb.push({
          label: step.title,
          href: step.route,
          active: i === currentStepId
        });
      }
    }
    
    return breadcrumb;
  }

  /**
   * รับขั้นตอนทั้งหมดพร้อมข้อมูลการนำทาง
   */
  static getAllStepsWithNavigation(currentStepId: number): Array<WorkflowStep & { 
    canNavigate: boolean; 
    isNext: boolean; 
    isPrevious: boolean; 
  }> {
    return WORKFLOW_STEPS.map(step => ({
      ...step,
      canNavigate: this.canNavigateToStep(currentStepId, step.id),
      isNext: step.id === currentStepId + 1,
      isPrevious: step.id === currentStepId - 1
    }));
  }

  /**
   * รับขั้นตอนที่สามารถนำทางได้
   */
  static getNavigableSteps(currentStepId: number): WorkflowStep[] {
    return WORKFLOW_STEPS.filter(step => 
      this.canNavigateToStep(currentStepId, step.id)
    );
  }

  /**
   * ตรวจสอบว่าขั้นตอนเป็นขั้นตอนสุดท้ายหรือไม่
   */
  static isLastStep(stepId: number): boolean {
    return stepId === WORKFLOW_STEPS.length;
  }

  /**
   * ตรวจสอบว่าขั้นตอนเป็นขั้นตอนแรกหรือไม่
   */
  static isFirstStep(stepId: number): boolean {
    return stepId === 1;
  }

  /**
   * รับจำนวนขั้นตอนทั้งหมด
   */
  static getTotalSteps(): number {
    return WORKFLOW_STEPS.length;
  }

  /**
   * รับขั้นตอนตาม route
   */
  static getStepByRoute(route: string): WorkflowStep | null {
    return WORKFLOW_STEPS.find(step => step.route === route) || null;
  }

  /**
   * ตรวจสอบว่า route เป็นขั้นตอนของ workflow หรือไม่
   */
  static isWorkflowRoute(route: string): boolean {
    return WORKFLOW_STEPS.some(step => step.route === route);
  }

  /**
   * รับขั้นตอนถัดไปที่แนะนำ
   */
  static getRecommendedNextStep(currentStepId: number): WorkflowStep | null {
    const nextStepId = this.getNextAllowedStep(currentStepId);
    if (!nextStepId) {
      return null;
    }
    
    const step = WORKFLOW_STEPS.find(s => s.id === nextStepId);
    return step || null;
  }

  /**
   * รับขั้นตอนก่อนหน้าที่แนะนำ
   */
  static getRecommendedPreviousStep(currentStepId: number): WorkflowStep | null {
    const previousStepId = this.getPreviousAllowedStep(currentStepId);
    if (!previousStepId) {
      return null;
    }
    
    const step = WORKFLOW_STEPS.find(s => s.id === previousStepId);
    return step || null;
  }
}
