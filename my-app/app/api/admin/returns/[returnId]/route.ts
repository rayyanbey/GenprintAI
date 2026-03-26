import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getModels } from '@/lib/db-dynamic';
import { stripe } from '@/lib/stripe';

/**
 * POST /api/admin/returns/[returnId]/approve
 * Admin approves a return request and processes refund
 * Requires admin authentication
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { returnId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // TODO: Add admin role check when auth system supports it

    const body = await request.json();
    const { admin_notes, refund_amount } = body;

    const models = await getModels();
    const { ReturnRequest, Order } = models;

    // Fetch return request
    const returnRequest = await ReturnRequest.findByPk(params.returnId);
    if (!returnRequest) {
      return NextResponse.json(
        { error: 'Return request not found' },
        { status: 404 }
      );
    }

    // Check status
    if (returnRequest.status !== 'pending') {
      return NextResponse.json(
        { error: `Return request status is "${returnRequest.status}", cannot approve` },
        { status: 400 }
      );
    }

    // Fetch order
    const order = await Order.findByPk(returnRequest.order_id);
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Use provided refund amount or full order amount
    const refundAmountDecimal = refund_amount || parseFloat(order.total_amount || 0);

    if (refundAmountDecimal <= 0) {
      return NextResponse.json(
        { error: 'Refund amount must be greater than 0' },
        { status: 400 }
      );
    }

    // Process Stripe refund
    let stripeRefundId;
    try {
      if (!order.payment_intent_id) {
        return NextResponse.json(
          { error: 'Order has no payment record, cannot process refund' },
          { status: 400 }
        );
      }

      const refund = await stripe.refunds.create({
        payment_intent: order.payment_intent_id,
        amount: Math.round(refundAmountDecimal * 100), // Convert to cents
      });

      stripeRefundId = refund.id;
    } catch (stripeError: any) {
      console.error('Stripe refund error:', stripeError);
      return NextResponse.json(
        { error: 'Failed to process Stripe refund', details: stripeError.message },
        { status: 500 }
      );
    }

    // Update return request
    await returnRequest.update({
      status: 'approved',
      admin_notes: admin_notes || null,
      approved_at: new Date(),
      approved_by: session.user.id,
      refund_amount: refundAmountDecimal,
      refund_status: 'processed',
      stripe_refund_id: stripeRefundId,
      refunded_at: new Date(),
    });

    // Update order status to 'returned'
    await order.update({
      status: 'returned',
    });

    // TODO: Send refund confirmation email to customer

    return NextResponse.json(
      {
        success: true,
        message: 'Return approved and refund processed successfully',
        return_request: returnRequest.get({ plain: true }),
        refund: {
          stripe_refund_id: stripeRefundId,
          amount: refundAmountDecimal,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error approving return:', error);
    return NextResponse.json(
      { error: 'Failed to approve return', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/returns/[returnId]/reject
 * Admin rejects a return request
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { returnId: string } }
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
    const { admin_notes, action } = body;

    if (action !== 'reject') {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    const models = await getModels();
    const { ReturnRequest } = models;

    const returnRequest = await ReturnRequest.findByPk(params.returnId);
    if (!returnRequest) {
      return NextResponse.json(
        { error: 'Return request not found' },
        { status: 404 }
      );
    }

    if (returnRequest.status !== 'pending') {
      return NextResponse.json(
        { error: `Return request status is "${returnRequest.status}", cannot reject` },
        { status: 400 }
      );
    }

    await returnRequest.update({
      status: 'rejected',
      admin_notes: admin_notes || null,
      approved_at: new Date(),
      approved_by: session.user.id,
    });

    // TODO: Send rejection email to customer

    return NextResponse.json(
      {
        success: true,
        message: 'Return request rejected',
        return_request: returnRequest.get({ plain: true }),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error rejecting return:', error);
    return NextResponse.json(
      { error: 'Failed to reject return', details: error.message },
      { status: 500 }
    );
  }
}
