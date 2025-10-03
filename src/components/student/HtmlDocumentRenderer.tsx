'use client';

import React from 'react';
import { HTML_TEMPLATES, DOCUMENT_CSS, replaceHtmlVariables } from '@/lib/html-templates';

interface HtmlDocumentRendererProps {
  type: 'internship' | 'co_op';
  documentType: 'application' | 'request' | 'introduction';
  language: 'th' | 'en';
  variables: Record<string, string>;
  zoomLevel: number;
}

export function HtmlDocumentRenderer({ 
  type, 
  documentType, 
  language, 
  variables, 
  zoomLevel 
}: HtmlDocumentRendererProps) {
  
  // เลือกเทมเพลต HTML ที่เหมาะสม
  const getTemplate = () => {
    if (documentType === 'application' && type === 'co_op') {
      return HTML_TEMPLATES.co_op[language]?.application_form;
    } else if (documentType === 'request') {
      return (HTML_TEMPLATES.co_op[language] as any)?.request_letter;
    }
    
    return null;
  };

  const template = getTemplate();
  
  if (!template) {
    return (
      <div className="p-8 text-center text-gray-500">
        ไม่พบเทมเพลต HTML สำหรับเอกสารนี้
      </div>
    );
  }

  // แทนที่ตัวแปรในเทมเพลต
  const htmlContent = replaceHtmlVariables(template, variables);

  return (
    <div 
      style={{ 
        transform: `scale(${zoomLevel / 100})`,
        transformOrigin: 'top center',
        width: 'fit-content',
        margin: '0 auto'
      }}
    >
      {/* CSS Styles */}
      <style jsx>{DOCUMENT_CSS}</style>
      
      {/* HTML Content */}
      <div 
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </div>
  );
}