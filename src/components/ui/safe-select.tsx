"use client"

import * as React from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface SafeSelectProps {
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  children?: React.ReactNode
  className?: string
}

export function SafeSelect({
  value,
  onValueChange,
  placeholder,
  disabled,
  children,
  className,
}: SafeSelectProps) {
  // Handle empty string as undefined for proper placeholder display
  const selectValue = value && value.trim() !== '' ? value : undefined;
  
  return (
    <Select value={selectValue} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {children}
      </SelectContent>
    </Select>
  )
}

interface SafeSelectItemProps {
  value: string
  children: React.ReactNode
}

export function SafeSelectItem({ value, children }: SafeSelectItemProps) {
  return (
    <SelectItem value={value}>
      {children}
    </SelectItem>
  )
}