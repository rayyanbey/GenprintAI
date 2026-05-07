import { NextResponse } from 'next/server';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from '@/lib/auth';
import {
  saveDesign,
  deleteDesign,
  getDesignVersionHistory,
} from '@/src/services/design.service';
import { getModels } from '@/lib/db-dynamic';

async function getDesignAccess(designId: string, userId: string) {
  const models = await getModels();
  const { Design, DesignCollaborator } = models;
  const design = await Design.findByPk(designId);

  if (!design) {
    return { design: null, role: null };
  }

  if (design.user_id === userId) {
    return { design, role: 'owner' };
  }

  const collaborator = await DesignCollaborator.findOne({
    where: { design_id: designId, user_id: userId },
  });

  return {
    design: collaborator ? design : null,
    role: collaborator?.role || null,
  };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const includeHistory = searchParams.get('history') === 'true';
    const { id } = await params;

    const { design } = await getDesignAccess(id, session.user.id);
    if (!design) {
      return NextResponse.json({ error: 'Design not found' }, { status: 404 });
    }

    const response: any = { design };

    if (includeHistory) {
      const history = design.user_id === session.user.id
        ? await getDesignVersionHistory(id, session.user.id)
        : [];
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
  { params }: { params: Promise<{ id: string }> }
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
    const { id } = await params;

    // Verify ownership or editor collaboration access
    const { design: existingDesign, role } = await getDesignAccess(id, session.user.id);
    if (!existingDesign) {
      return NextResponse.json({ error: 'Design not found' }, { status: 404 });
    }

    if (role !== 'owner' && role !== 'editor') {
      return NextResponse.json({ error: 'Editor access required' }, { status: 403 });
    }

    const nextDesignData = {
      title: title || existingDesign.title,
      description: description !== undefined ? description : existingDesign.description,
      canvas_data: canvas_data || existingDesign.canvas_data,
      artwork_file_url: artwork_file_url || existingDesign.artwork_file_url,
      export_format: export_format || existingDesign.export_format,
      tags: tags || existingDesign.tags,
      metadata: metadata || existingDesign.metadata,
    };

    const updatedDesign = role === 'owner'
      ? await saveDesign(session.user.id, nextDesignData, id)
      : await existingDesign.update({
          ...nextDesignData,
          version_number: (existingDesign.version_number || 1) + 1,
        });

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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await deleteDesign(id, session.user.id);

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
