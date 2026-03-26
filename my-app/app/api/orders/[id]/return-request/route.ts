import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getModels } from '@/lib/db-dynamic';
import { v4 as uuidv4 } from 'uuid';

/**
 * POST /api/orders/[id]/return-request
 * Customer submits a return request for an order
 * Only eligible orders: status must be 'delivered' or 'shipped'
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { reason, reason_details } = body;

    if (!reason) {
      return NextResponse.json(
        { error: 'Return reason is required' },
        { status: 400 }
      );
    }

    const models = await getModels();
    const { Order, ReturnRequest } = models;

    // Verify order exists and belongs to user
    const order = await Order.findByPk(params.id);
    if (!order || order.user_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if order is eligible for return (must be delivered or shipped)
    const eligibleStatuses = ['delivered', 'shipped'];
    if (!eligibleStatuses.includes(order.status)) {
      return NextResponse.json(
        {
          error: `Order status "${order.status}" is not eligible for return. Only delivered or shipped orders can be returned.`,
        },
        { status: 400 }
      );
    }

    // Check if return request already exists for this order
    const existingReturn = await ReturnRequest.findOne({
      where: { order_id: params.id },
    });

    if (existingReturn) {
      return NextResponse.json(
        { error: 'Return request already exists for this order' },
        { status: 400 }
      );
    }

    // Create return request
    const returnId = uuidv4();
    const returnRequest = await ReturnRequest.create({
      id: returnId,
      order_id: params.id,
      user_id: session.user.id,
      reason,
      reason_details: reason_details || null,
      status: 'pending',
    });

    // TODO: Send email to admin notifying of new return request

    return NextResponse.json(
      {
        success: true,
        message: 'Return request submitted successfully',
        return_request: returnRequest.get({ plain: true }),
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error submitting return request:', error);
    return NextResponse.json(
      { error: 'Failed to submit return request', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/orders/[id]/return-request
 * Get return request status for an order
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const models = await getModels();
    const { ReturnRequest } = models;

    const returnRequest = await ReturnRequest.findOne({
      where: { order_id: params.id },
    });

    if (!returnRequest) {
      return NextResponse.json(
        { success: true, return_request: null },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        return_request: returnRequest.get({ plain: true }),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching return request:', error);
    return NextResponse.json(
      { error: 'Failed to fetch return request', details: error.message },
      { status: 500 }
    );
  }
}
