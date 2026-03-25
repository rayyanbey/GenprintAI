import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { saveDesign, getUserDesigns } from '@/src/services/design.service';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    const designs = await getUserDesigns(session.user.id, {
      limit,
      offset,
      includeArchived: false,
    });

    return NextResponse.json({
      designs,
      page,
      limit,
      total: designs.length,
    });
  } catch (error: any) {
    console.error('Error fetching designs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch designs', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, template_id, canvas_data, tags, metadata } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    const design = await saveDesign(session.user.id, {
      title,
      description,
      template_id,
      canvas_data,
      tags,
      metadata,
    });

    return NextResponse.json(
      { success: true, design },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating design:', error);
    return NextResponse.json(
      { error: 'Failed to create design', details: error.message },
      { status: 500 }
    );
  }
}
