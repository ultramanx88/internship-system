'use client';

import React, { ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export interface FormDialogProps {
  // Dialog state
  open: boolean;
  onOpenChange: (open: boolean) => void;
  
  // Dialog content
  title: string;
  description?: string;
  
  // Form content
  children: ReactNode;
  
  // Actions
  onSubmit?: () => void;
  onCancel?: () => void;
  
  // Button labels
  submitLabel?: string;
  cancelLabel?: string;
  
  // States
  isLoading?: boolean;
  isSubmitting?: boolean;
  
  // Button variants
  submitVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  cancelVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  
  // Button disabled states
  submitDisabled?: boolean;
  cancelDisabled?: boolean;
  
  // Dialog size
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  
  // Custom footer
  renderFooter?: () => ReactNode;
  
  // Form validation
  isValid?: boolean;
  showValidation?: boolean;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-full',
};

export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  onSubmit,
  onCancel,
  submitLabel = 'บันทึก',
  cancelLabel = 'ยกเลิก',
  isLoading = false,
  isSubmitting = false,
  submitVariant = 'default',
  cancelVariant = 'outline',
  submitDisabled = false,
  cancelDisabled = false,
  size = 'md',
  renderFooter,
  isValid = true,
  showValidation = true,
}: FormDialogProps) {
  const handleSubmit = () => {
    if (onSubmit && !isSubmitting && !submitDisabled) {
      onSubmit();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      onOpenChange(false);
    }
  };

  const isSubmitDisabled = isSubmitting || submitDisabled || (showValidation && !isValid);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={sizeClasses[size]}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="space-y-4">
          {children}
        </div>

        <DialogFooter>
          {renderFooter ? (
            renderFooter()
          ) : (
            <div className="flex gap-2">
              <Button
                variant={cancelVariant}
                onClick={handleCancel}
                disabled={cancelDisabled || isSubmitting}
              >
                {cancelLabel}
              </Button>
              {onSubmit && (
                <Button
                  variant={submitVariant}
                  onClick={handleSubmit}
                  disabled={isSubmitDisabled}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      กำลังบันทึก...
                    </>
                  ) : (
                    submitLabel
                  )}
                </Button>
              )}
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Specialized form dialog for confirmation
export interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  isDestructive?: boolean;
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  onCancel,
  confirmLabel = 'ยืนยัน',
  cancelLabel = 'ยกเลิก',
  isLoading = false,
  isDestructive = false,
}: ConfirmationDialogProps) {
  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      onSubmit={onConfirm}
      onCancel={onCancel}
      submitLabel={confirmLabel}
      cancelLabel={cancelLabel}
      isSubmitting={isLoading}
      submitVariant={isDestructive ? 'destructive' : 'default'}
      size="sm"
    >
      <div className="text-sm text-gray-600">
        {description}
      </div>
    </FormDialog>
  );
}

// Specialized form dialog for bulk actions
export interface BulkActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  itemCount: number;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  isDestructive?: boolean;
}

export function BulkActionDialog({
  open,
  onOpenChange,
  title,
  description,
  itemCount,
  onConfirm,
  onCancel,
  confirmLabel = 'ยืนยัน',
  cancelLabel = 'ยกเลิก',
  isLoading = false,
  isDestructive = false,
}: BulkActionDialogProps) {
  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      onSubmit={onConfirm}
      onCancel={onCancel}
      submitLabel={confirmLabel}
      cancelLabel={cancelLabel}
      isSubmitting={isLoading}
      submitVariant={isDestructive ? 'destructive' : 'default'}
      size="sm"
    >
      <div className="space-y-2">
        <div className="text-sm text-gray-600">
          {description}
        </div>
        <div className="text-sm font-medium text-gray-900">
          จำนวนรายการที่เลือก: {itemCount}
        </div>
      </div>
    </FormDialog>
  );
}
