import { NextRequest, NextResponse } from 'next/server';
import { getModels } from '@/lib/db-dynamic';

/**
 * GET /api/templates/download?id=design_id_or_template_id
 * Download design/template image as file
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Design/Template ID is required' },
        { status: 400 }
      );
    }

    const models = await getModels();
    const { Design, Template } = models;

    let imageUrl: string | null = null;
    let fileName: string = 'design';

    // Try to find as design first
    const design = await Design.findByPk(id);
    if (design && design.artwork_file_url) {
      imageUrl = design.artwork_file_url;
      fileName = `${design.title || 'design'}-${id}`;
    } else {
      // Try to find as template
      const template = await Template.findByPk(id);
      if (template && template.metadata?.image_url) {
        imageUrl = template.metadata.image_url;
        fileName = `${template.name || 'template'}-${id}`;
      }
    }

    if (!imageUrl) {
      return NextResponse.json(
        { success: false, error: 'Design/Template not found or has no image' },
        { status: 404 }
      );
    }

    // Fetch the image from the URL (could be Cloudinary or other storage)
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error('Failed to fetch image');
    }

    const imageBuffer = await imageResponse.arrayBuffer();

    // Determine content type from URL or default to PNG
    const contentType = imageUrl.includes('.jpg')
      ? 'image/jpeg'
      : imageUrl.includes('.gif')
        ? 'image/gif'
        : 'image/png';

    // Set proper filename with extension
    const fileExtension = contentType === 'image/jpeg' ? 'jpg' : 'png';
    const finalFileName = fileName.endsWith(`.${fileExtension}`)
      ? fileName
      : `${fileName}.${fileExtension}`;

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${finalFileName}"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error: any) {
    console.error('Error downloading design/template:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to download file' },
      { status: 500 }
    );
  }
}
