'use client';

import React from 'react';
import { EXTRACTED_TEMPLATES, DOCUMENT_CSS, replaceExtractedVariables } from '@/lib/extracted-templates';

interface RealDocumentRendererProps {
  type: 'internship' | 'co_op';
  documentType: 'application' | 'request' | 'introduction';
  language: 'th' | 'en';
  variables: Record<string, string>;
  zoomLevel: number;
}

export function RealDocumentRenderer({ 
  type, 
  documentType, 
  language, 
  variables, 
  zoomLevel 
}: RealDocumentRendererProps) {
  
  // เลือกเทมเพลตที่ถูกต้อง
  const getTemplate = () => {
    const templateKey = documentType === 'application' ? 'application_form' : 
                       documentType === 'request' ? 'request_letter' : 
                       'introduction_letter';
    
    return EXTRACTED_TEMPLATES[type]?.[language]?.[templateKey];
  };

  const template = getTemplate();
  
  if (!template) {
    return (
      <div className="p-8 text-center text-gray-500 bg-white border border-gray-300">
        <div className="text-lg font-medium mb-2">ไม่พบเทมเพลตจริง</div>
        <div className="text-sm">
          ไม่พบเทมเพลตสำหรับ: {type} / {documentType} / {language}
        </div>
        <div className="text-xs mt-2 text-gray-400">
          กรุณาตรวจสอบไฟล์ในโฟลเดอร์ document-templates/
        </div>
      </div>
    );
  }

  // แทนที่ตัวแปรในเทมเพลต
  const htmlContent = replaceExtractedVariables(template.content, variables);

  return (
    <div className="w-full">
      {/* CSS Styles */}
      <style jsx>{DOCUMENT_CSS}</style>
      
      {/* Document Content */}
      <div 
        style={{ 
          transform: `scale(${zoomLevel / 100})`,
          transformOrigin: 'top center',
          width: 'fit-content',
          margin: '0 auto'
        }}
      >
        {/* University Header */}
        <div className="text-center mb-6 bg-white p-4">
          <img 
            src="/assets/images/garuda-logo.png" 
            alt="ตราครุฑ" 
            className="mx-auto mb-3 h-16 w-auto"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <div className="text-lg font-bold mb-2">
            {language === 'th' ? 
              'มหาวิทยาลัยเทคโนโลยีราชมงคลล้านนา' : 
              'Rajamangala University of Technology Lanna'
            }
          </div>
          <div className="text-base">
            {language === 'th' ? 
              'คณะบริหารธุรกิจและศิลปศาสตร์' : 
              'Faculty of Business Administration and Liberal Arts'
            }
          </div>
          {documentType === 'application' && type === 'co_op' && (
            <div className="text-sm font-medium mt-2">
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