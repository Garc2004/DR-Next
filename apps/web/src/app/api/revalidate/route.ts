import { revalidateTag } from 'next/cache';
import { NextResponse, type NextRequest } from 'next/server';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  const tag = url.searchParams.get('tag');
  if (!tag) {
    return NextResponse.json({ error: 'missing tag' }, { status: 400 });
  }

  // Lightweight protection — production should require a signed bearer.
  const bearer = req.headers.get('authorization');
  const expected = process.env.REVALIDATE_TOKEN;
  if (expected && bearer !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  revalidateTag(tag);
  return NextResponse.json({ revalidated: true, tag, at: Date.now() });
}
