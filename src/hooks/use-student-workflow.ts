'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './use-auth';
import { 
  WorkflowState, 
  WorkflowStep, 
  UserProfile, 
  Application, 
  ApplicationFormData,
  WorkflowManager, 
  WorkflowAPI, 
  WorkflowUtils 
} from '@/lib/student-application-workflow';

export function useStudentWorkflow() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [application, setApplication] = useState<Application | null>(null);
  const [workflowState, setWorkflowState] = useState<WorkflowState | null>(null);
  const [steps, setSteps] = useState<WorkflowStep[]>([]);

  const language = WorkflowUtils.detectLanguage();

  // Load initial data
  const loadData = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      const [profileData, applicationData] = await Promise.all([
        WorkflowAPI.loadUserProfile(user.id),
        WorkflowAPI.loadLatestApplication(user.id)
      ]);

      setProfile(profileData);
      setApplication(applicationData);

      // Calculate workflow state
      const state = WorkflowManager.getWorkflowState(profileData, applicationData || undefined);
      setWorkflowState(state);

      // Get all steps with status
      const stepsWithStatus = WorkflowManager.getAllStepsWithStatus(profileData, applicationData || undefined);
      setSteps(stepsWithStatus);

    } catch (err) {
      console.error('Error loading workflow data:', err);
      setError(WorkflowUtils.getErrorMessage(err, language));
    } finally {
      setLoading(false);
    }
  }, [user?.id, language]);

  // Refresh data
  const refresh = useCallback(() => {
    loadData();
  }, [loadData]);

  // Update profile
  const updateProfile = useCallback(async (profileData: Partial<UserProfile>) => {
    if (!user?.id) return;

    try {
      await WorkflowAPI.saveUserProfile(profileData);
      await loadData(); // Reload data after update
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(WorkflowUtils.getErrorMessage(err, language));
    }
  }, [user?.id, loadData, language]);

  // Save application
  const saveApplication = useCallback(async (applicationData: ApplicationFormData) => {
    if (!user?.id) return;

    try {
      const savedApplication = await WorkflowAPI.saveApplication(applicationData);
      setApplication(savedApplication);
      await loadData(); // Reload data after save
      return savedApplication;
    } catch (err) {
      console.error('Error saving application:', err);
      setError(WorkflowUtils.getErrorMessage(err, language));
      throw err;
    }
  }, [user?.id, loadData, language]);

  // Submit application
  const submitApplication = useCallback(async (applicationId: string) => {
    try {
      await WorkflowAPI.submitApplication(applicationId);
      await loadData(); // Reload data after submit
    } catch (err) {
      console.error('Error submitting application:', err);
      setError(WorkflowUtils.getErrorMessage(err, language));
      throw err;
    }
  }, [loadData, language]);

  // Get current step
  const getCurrentStep = useCallback((): WorkflowStep | null => {
    if (!profile) return null;
    return WorkflowManager.getCurrentStep(profile, application || undefined);
  }, [profile, application]);

  // Check if can proceed to step
  const canProceedToStep = useCallback((stepId: number): boolean => {
    if (!profile) return false;
    return WorkflowManager.canProceedToStep(stepId, profile, application || undefined);
  }, [profile, application]);

  // Get step by ID
  const getStepById = useCallback((stepId: number): WorkflowStep | null => {
    return steps.find(step => step.id === stepId) || null;
  }, [steps]);

  // Get progress percentage
  const getProgressPercentage = useCallback((): number => {
    if (!workflowState) return 0;
    return WorkflowUtils.calculateProgress(
      workflowState.completedSteps.length, 
      steps.length
    );
  }, [workflowState, steps.length]);

  // Get step message
  const getStepMessage = useCallback((stepId: number): string => {
    if (!profile) return '';
    return WorkflowManager.getStepMessage(stepId, profile, application || undefined);
  }, [profile, application]);

  // Check if step has alert
  const hasStepAlert = useCallback((stepId: number): boolean => {
    const step = getStepById(stepId);
    if (!step) return false;
    return WorkflowUtils.hasStepAlert(step);
  }, [getStepById]);

  // Get step alert message
  const getStepAlertMessage = useCallback((stepId: number): string | null => {
    const step = getStepById(stepId);
    if (!step) return null;
    return WorkflowUtils.getStepAlertMessage(step, language);
  }, [getStepById, language]);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    // State
    loading,
    error,
    profile,
    application,
    workflowState,
    steps,
    
    // Actions
    refresh,
    updateProfile,
    saveApplication,
    submitApplication,
    
    // Getters
    getCurrentStep,
    canProceedToStep,
    getStepById,
    getProgressPercentage,
    getStepMessage,
    hasStepAlert,
    getStepAlertMessage,
    
    // Utils
    language
  };
}
