'use client';

import React from 'react';
import { BETTER_TEMPLATES, IMPROVED_DOCUMENT_CSS, replaceBetterVariables } from '@/lib/better-templates';

interface BetterDocumentRendererProps {
  type: 'internship' | 'co_op';
  documentType: 'application' | 'request' | 'introduction';
  language: 'th' | 'en';
  variables: Record<string, string>;
  zoomLevel: number;
}

export function BetterDocumentRenderer({ 
  type, 
  documentType, 
  language, 
  variables, 
  zoomLevel 
}: BetterDocumentRendererProps) {
  
  // เลือกเทมเพลตที่ถูกต้อง
  const getTemplate = () => {
    const templateKey = documentType === 'application' ? 'application_form' : 
                       documentType === 'request' ? 'request_letter' : 
                       'introduction_letter';
    
    return BETTER_TEMPLATES[type]?.[language]?.[templateKey];
  };

  const template = getTemplate();
  
  if (!template) {
    return (
      <div className="p-8 text-center text-gray-500 bg-white">
        <div className="text-lg font-medium mb-2">ไม่พบเทมเพลตที่ปรับปรุงแล้ว</div>
        <div className="text-sm">
          ไม่พบเทมเพลตสำหรับ: {type} / {documentType} / {language}
        </div>
        <div className="text-xs mt-2 text-gray-400">
          กรุณาตรวจสอบการกำหนดค่าเทมเพลต
        </div>
      </div>
    );
  }

  // แทนที่ตัวแปรในเทมเพลต
  const htmlContent = replaceBetterVariables(template.content, variables);

  return (
    <div className="w-full">
      {/* CSS Styles */}
      <style jsx>{IMPROVED_DOCUMENT_CSS}</style>
      
      {/* Document Content */}
      <div 
        style={{ 
          transform: `scale(${zoomLevel / 100})`,
          transformOrigin: 'top center',
          width: 'fit-content',
          margin: '0 auto'
        }}
      >
        {/* University Header - แสดงสำหรับทุกเอกสาร */}
        <div className="text-center mb-3" style={{ background: 'transparent', padding: '8px' }}>
          <img 
            src={language === 'th' ? "/assets/images/university_th.png" : "/assets/images/university_en.png"}
            alt={language === 'th' ? "โลโก้มหาวิทยาลัยเทคโนโลยีราชมงคลล้านนา" : "Rajamangala University of Technology Lanna Logo"}
            className="mx-auto mb-2 h-16 w-auto"
            onError={(e) => {
              // ถ้าไม่มีโลโก้มหาวิทยาลัย ให้ใช้ตราครุฑ
              e.currentTarget.src = "/assets/images/garuda-logo.png";
              e.currentTarget.className = "mx-auto mb-2 h-14 w-auto";
              e.currentTarget.onerror = () => {
                e.currentTarget.style.display = 'none';
              };
            }}
          />
          
          {/* แสดงชื่อเอกสารสำหรับแบบฟอร์มสหกิจศึกษา */}
          {documentType === 'application' && type === 'co_op' && (
            <div className="text-sm font-bold mt-2">
              {language === 'th' ? 
                `แบบแจ้งสถานที่ฝึกประสบการณ์สหกิจศึกษา (Co-operative Education) ${variables.academicYear || '2567'}` :
                `Co-operative Education Application Form ${variables.academicYear || '2024'}`
              }
            </div>
          )}
        </div>
        
        {/* Template Content */}
        <div 
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </div>
    </div>
  );
}