import { NextRequest, NextResponse } from 'next/server';
import { getAvailableTemplates } from '@/lib/document-generator';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'internship' | 'co-op' | null;
    const language = searchParams.get('language') as 'th' | 'en' | null;

    const templates = getAvailableTemplates(
      type || undefined,
      language || undefined
    );

    // Group templates by type and language for easier frontend handling
    const groupedTemplates = templates.reduce((acc, template) => {
      const key = `${template.type}_${template.language}`;
      if (!acc[key]) {
        acc[key] = {
          type: template.type,
          language: template.language,
          templates: []
        };
      }
      acc[key].templates.push(template);
      return acc;
    }, {} as Record<string, any>);

    return NextResponse.json({
      templates,
      grouped: Object.values(groupedTemplates),
    });
  } catch (error) {
    console.error('Error fetching document templates:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}