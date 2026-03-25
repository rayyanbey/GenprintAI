import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  getDesignById,
  saveDesign,
  deleteDesign,
  updateDesignArtworkUrl,
  getDesignVersionHistory,
} from '@/src/services/design.service';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const includeHistory = searchParams.get('history') === 'true';

    const design = await getDesignById(params.id, session.user.id);
    if (!design) {
      return NextResponse.json({ error: 'Design not found' }, { status: 404 });
    }

    let response: any = { design };

    if (includeHistory) {
      const history = await getDesignVersionHistory(params.id, session.user.id);
      response.version_history = history;
    }

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error fetching design:', error);
    return NextResponse.json(
      { error: 'Failed to fetch design', details: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      canvas_data,
      artwork_file_url,
      export_format,
      tags,
      metadata,
    } = body;

    // Verify ownership
    const existingDesign = await getDesignById(params.id, session.user.id);
    if (!existingDesign) {
      return NextResponse.json({ error: 'Design not found' }, { status: 404 });
    }

    const updatedDesign = await saveDesign(
      session.user.id,
      {
        title: title || existingDesign.title,
        description: description !== undefined ? description : existingDesign.description,
        canvas_data: canvas_data || existingDesign.canvas_data,
        artwork_file_url: artwork_file_url || existingDesign.artwork_file_url,
        export_format: export_format || existingDesign.export_format,
        tags: tags || existingDesign.tags,
        metadata: metadata || existingDesign.metadata,
      },
      params.id
    );

    return NextResponse.json({
      success: true,
      design: updatedDesign,
    });
  } catch (error: any) {
    console.error('Error updating design:', error);
    return NextResponse.json(
      { error: 'Failed to update design', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await deleteDesign(params.id, session.user.id);

    return NextResponse.json({
      success: true,
      message: 'Design archived',
    });
  } catch (error: any) {
    console.error('Error deleting design:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    return NextResponse.json(
      { error: 'Failed to delete design', details: error.message },
      { status: 500 }
    );
  }
}
