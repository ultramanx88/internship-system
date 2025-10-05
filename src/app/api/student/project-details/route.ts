import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth, cleanup } from '@/lib/auth-utils';
import { sanitizeUserInput, sanitizeString } from '@/lib/security';
import { logger } from '@/lib/logger';

// Store project details in User.statement as JSON string to avoid schema changes

export async function GET(request: NextRequest) {
  const start = Date.now();
  try {
    const auth = await requireAuth(request, ['student']);
    if ('error' in auth) return auth.error;
    const { user } = auth;

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    let project = null;
    if (dbUser?.statement) {
      try {
        project = JSON.parse(dbUser.statement);
      } catch {}
    }

    logger.info('ProjectDetails API GET', { userId: user.id, hasProject: !!project });
    return NextResponse.json({ success: true, project });
  } catch (error) {
    logger.error('ProjectDetails API GET error', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ success: false, error: 'Failed to load project details' }, { status: 500 });
  } finally {
    logger.info('ProjectDetails API GET done', { durationMs: Date.now() - start });
    await cleanup();
  }
}

export async function PUT(request: NextRequest) {
  const start = Date.now();
  try {
    const auth = await requireAuth(request, ['student']);
    if ('error' in auth) return auth.error;
    const { user } = auth;

    const body = await request.json();
    const { isValid, sanitized, errors } = sanitizeUserInput(body);
    if (!isValid) {
      return NextResponse.json({ success: false, error: 'Invalid input', details: errors }, { status: 400 });
    }

    // Whitelist fields
    const project = {
      projectChoice: sanitizeString(sanitized.projectChoice || 'do-project'),
      projectName: sanitizeString(sanitized.projectName || ''),
      projectInfo: sanitizeString(sanitized.projectInfo || ''),
      objective: sanitizeString(sanitized.objective || ''),
      software: sanitizeString(sanitized.software || ''),
      reasons: sanitizeString(sanitized.reasons || ''),
      status: sanitizeString(sanitized.status || 'draft')
    };

    await prisma.user.update({
      where: { id: user.id },
      data: { statement: JSON.stringify(project) }
    });

    logger.info('ProjectDetails API PUT', { userId: user.id, status: project.status });
    return NextResponse.json({ success: true, project });
  } catch (error) {
    logger.error('ProjectDetails API PUT error', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ success: false, error: 'Failed to save project details' }, { status: 500 });
  } finally {
    logger.info('ProjectDetails API PUT done', { durationMs: Date.now() - start });
    await cleanup();
  }
}



