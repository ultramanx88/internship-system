'use client';

import React from 'react';
import { COOP_FORM_TEMPLATE, COOP_FORM_CSS, replaceCoopFormVariables } from '@/lib/coop-form-template';

interface CoopFormRendererProps {
  variables: Record<string, string>;
  zoomLevel: number;
}

export function CoopFormRenderer({ variables, zoomLevel }: CoopFormRendererProps) {
  
  // แทนที่ตัวแปรในเทมเพลต
  const htmlContent = replaceCoopFormVariables(COOP_FORM_TEMPLATE.content, variables);

  return (
    <div className="w-full">
      {/* CSS Styles */}
      <style jsx>{COOP_FORM_CSS}</style>
      
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
        <div className="text-center" style={{ marginBottom: '5px', padding: '20px 8px 8px 8px', background: 'transparent' }}>
          <img 
            src="/assets/images/garuda-logo.png" 
            alt="ตราครุฑ" 
            className="mx-auto h-16 w-auto"
            style={{ marginBottom: '2px', display: 'block' }}
            onError={(e) => {
              console.log('Logo not found, showing placeholder');
              e.currentTarget.style.display = 'block';
              e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zMiAxNkwyNCAzMkgzMkw0MCAzMkwzMiAxNloiIGZpbGw9IiM2QjcyODAiLz4KPHN2Zz4K';
            }}
          />
        </div>
        
        {/* Form Content */}
        <div 
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </div>
    </div>
  );
}