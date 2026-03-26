import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getModels } from '@/lib/db-dynamic';

/**
 * GET /api/admin/returns
 * List all return requests with optional filters
 * Query params: status, page, limit
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // TODO: Add admin role check

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const models = await getModels();
    const { ReturnRequest } = models;

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const offset = (page - 1) * limit;

    const { count, rows: returnRequests } = await ReturnRequest.findAndCountAll({
      where,
      order: [['requested_at', 'DESC']],
      limit,
      offset,
    });

    return NextResponse.json(
      {
        success: true,
        return_requests: returnRequests.map((r: any) => r.get({ plain: true })),
        pagination: {
          total: count,
          page,
          limit,
          totalPages: Math.ceil(count / limit),
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching return requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch return requests', details: error.message },
      { status: 500 }
    );
  }
}
