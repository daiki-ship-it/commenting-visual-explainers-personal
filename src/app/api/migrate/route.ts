import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

function verifyToken(request: NextRequest): boolean {
  const token = process.env.API_TOKEN;
  if (!token) return false;

  const auth = request.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) return false;

  return auth.slice(7) === token;
}

export async function POST(request: NextRequest) {
  if (!verifyToken(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const sql = getDb();

    await sql`
      CREATE TABLE IF NOT EXISTS comments (
        id TEXT PRIMARY KEY,
        author TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'comment',
        quote TEXT NOT NULL DEFAULT '',
        quote_context_before TEXT NOT NULL DEFAULT '',
        quote_context_after TEXT NOT NULL DEFAULT '',
        content TEXT NOT NULL DEFAULT '',
        priority TEXT NOT NULL DEFAULT 'want',
        parent_id TEXT,
        resolved BOOLEAN NOT NULL DEFAULT false,
        resolved_by TEXT,
        resolved_at BIGINT,
        timestamp BIGINT NOT NULL,
        updated_at BIGINT,
        page_url TEXT NOT NULL,
        project_slug TEXT NOT NULL
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_comments_project ON comments (project_slug)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments (parent_id)`;

    return NextResponse.json({ ok: true, message: 'Migration complete.' });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Migration failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
