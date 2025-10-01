'use client';

import React from 'react';

interface DocumentRendererProps {
  content: string;
  title: string;
  language: 'th' | 'en';
  zoomLevel: number;
}

export function DocumentRenderer({ content, title, language, zoomLevel }: DocumentRendererProps) {
  // แปลงเนื้อหาเป็น JSX elements
  const renderContent = () => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let inMapBox = false;
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // ตรวจสอบว่าเป็นกรอบส่วนที่ 1, 2
      if (trimmedLine.includes('┌─────────────┐')) {
        return;
      }
      
      if (trimmedLine.includes('│   ส่วนที่') || trimmedLine.includes('│   Part')) {
        const sectionText = trimmedLine.replace(/[│┌┐└┘─]/g, '').trim();
        elements.push(
          <div key={index} className="border border-black p-2 mb-4 text-center font-bold bg-white" style={{ width: 'fit-content', margin: '0 auto' }}>
            {sectionText}
          </div>
        );
        return;
      }
      
      if (trimmedLine.includes('└─────────────┘')) {
        return;
      }
      
      // ตรวจสอบกรอบแผนที่ (กรอบยาว)
      if (trimmedLine.includes('┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐')) {
        inMapBox = true;
        elements.push(
          <div key={index} className="border border-black p-4 mb-4 bg-white min-h-[120px] flex items-center justify-center">
            <div className="text-center text-gray-600">
              [แผนที่หรือเส้นทางไปสถานประกอบการ]
            </div>
          </div>
        );
        return;
      }
      
      if (trimmedLine.includes('└─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘')) {
        inMapBox = false;
        return;
      }
      
      // ข้ามเนื้อหาในกรอบแผนที่
      if (inMapBox) {
        return;
      }
      
      // ข้ามบรรทัดที่มีแต่เครื่องหมาย
      if (trimmedLine.match(/^[│┌┐└┘─\s\.]*$/)) {
        return;
      }
      
      // ข้ามบรรทัดว่าง
      if (!trimmedLine) {
        elements.push(<div key={index} className="h-3"></div>);
        return;
      }
      
      // รายการที่มีหมายเลข
      if (trimmedLine.match(/^[๑๒๓๔๕๖๗๘1-8]\./)) {
        const number = trimmedLine.match(/^[๑๒๓๔๕๖๗๘1-8]\./)?.[0] || '';
        const text = trimmedLine.replace(/^[๑๒๓๔๕๖๗๘1-8]\.\s*/, '');
        
        // ตรวจสอบว่ามีข้อมูลที่กรอกแล้วหรือไม่
        const hasData = !text.includes('....') && text.length > 0;
        
        elements.push(
          <div key={index} className="flex mb-3 items-start">
            <span className="font-normal mr-2 min-w-[1.5rem]">{number}</span>
            <div className="flex-1">
              {hasData ? (
                <span className="font-medium">
                  {text}
                </span>
              ) : (
                <div className="flex items-center">
                  <span className="mr-2">{text.split('....')[0]}</span>
                  <div className="border-b border-dotted border-black flex-1 min-w-[200px]"></div>
                </div>
              )}
            </div>
          </div>
        );
      } else if (trimmedLine.startsWith('ระดับ :') || trimmedLine.startsWith('Bachelor degree')) {
        elements.push(
          <div key={index} className="mb-3 text-sm">
            {trimmedLine}
          </div>
        );
      } else if (trimmedLine.includes('เบอร์โทรศัพท์') || trimmedLine.includes('Mobile phone')) {
        const parts = trimmedLine.split(/เบอร์โทรศัพท์|Mobile phone/);
        const emailPart = trimmedLine.includes('อีเมล') ? 'อีเมล์' : 'e-mail';
        
        elements.push(
          <div key={index} className="flex items-center mb-3 gap-4">
            <div className="flex items-center">
              <span className="mr-2">{trimmedLine.includes('เบอร์โทรศัพท์') ? 'เบอร์โทรศัพท์' : 'Mobile phone no.'}</span>
              <div className="border-b border-dotted border-black w-32"></div>
            </div>
            <div className="flex items-center">
              <span className="mr-2">{emailPart}</span>
              <div className="border-b border-dotted border-black w-48"></div>
            </div>
          </div>
        );
      } else if (trimmedLine.startsWith('ที่ ') && trimmedLine.includes('วันที่')) {
        // หัวข้อเอกสาร
        const parts = trimmedLine.split(/\s{10,}/); // แยกด้วยช่องว่างหลายตัว
        elements.push(
          <div key={index} className="flex justify-between mb-6 pb-2 border-b">
            <span className="font-medium">{parts[0]}</span>
            <span className="font-medium">{parts[1] || ''}</span>
          </div>
        );
      } else if (trimmedLine.startsWith('เรื่อง') || trimmedLine.startsWith('Subject:')) {
        elements.push(
          <div key={index} className="mb-4 font-semibold text-lg">
            {trimmedLine}
          </div>
        );
      } else if (trimmedLine.startsWith('เรียน') || trimmedLine.startsWith('To:')) {
        elements.push(
          <div key={index} className="mb-4 font-medium">
            {trimmedLine}
          </div>
        );
      } else {
        // เนื้อหาปกติ
        elements.push(
          <div key={index} className="mb-2 leading-relaxed">
            {trimmedLine}
          </div>
        );
      }
    });
    
    return elements;
  };

  return (
    <div 
      className="document-content bg-white mx-auto border border-gray-300"
      style={{ 
        transform: `scale(${zoomLevel / 100})`,
        transformOrigin: 'top center',
        width: '600px', // ปรับให้พอดีหน้าจอ
        minHeight: '800px',
        padding: '40px 30px',
        fontFamily: 'Bai Jamjuree, sans-serif',
        fontSize: '13px',
        lineHeight: '1.5',
        color: '#000000'
      }}
    >
      <div className="space-y-3">
        {renderContent()}
      </div>
    </div>
  );
}