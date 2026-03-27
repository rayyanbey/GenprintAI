import nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (transporter) {
    return transporter;
  }

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  return transporter;
}

type OrderConfirmationItem = {
  name: string;
  quantity: number;
  price: number;
};

export async function sendOrderConfirmationEmail(
  email: string,
  orderData: {
    orderId: string;
    orderDate: string | Date;
    items: OrderConfirmationItem[];
    totalAmount: number;
    paymentIntentId?: string;
  }
): Promise<void> {
  const fromEmail = process.env.EMAIL_FROM || process.env.SMTP_USER || 'noreply@genprint.ai';
  const orderDate = new Date(orderData.orderDate);
  const formattedDate = Number.isNaN(orderDate.getTime())
    ? String(orderData.orderDate)
    : orderDate.toLocaleString();

  const itemsHtml = orderData.items
    .map(
      (item) =>
        `<tr>
          <td style="padding: 6px 0;">${item.name}</td>
          <td style="padding: 6px 0; text-align: center;">${item.quantity}</td>
          <td style="padding: 6px 0; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
        </tr>`
    )
    .join('');

  const subject = `Order Confirmation - ${orderData.orderId}`;
  const text = [
    'Thanks for your purchase!',
    `Order ID: ${orderData.orderId}`,
    `Order Date: ${formattedDate}`,
    orderData.paymentIntentId ? `Payment Intent: ${orderData.paymentIntentId}` : null,
    '',
    ...orderData.items.map((item) => `- ${item.name} x${item.quantity} ($${(item.price * item.quantity).toFixed(2)})`),
    '',
    `Total Paid: $${Number(orderData.totalAmount || 0).toFixed(2)}`,
  ]
    .filter(Boolean)
    .join('\n');

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #1f2937;">
      <h2 style="margin-bottom: 0.5rem;">Order Confirmed</h2>
      <p>Thanks for your purchase. Your payment has been received.</p>
      <p><strong>Order ID:</strong> ${orderData.orderId}<br/>
      <strong>Order Date:</strong> ${formattedDate}${
        orderData.paymentIntentId
          ? `<br/><strong>Payment Intent:</strong> ${orderData.paymentIntentId}`
          : ''
      }</p>
      <table style="width: 100%; border-collapse: collapse; margin: 1rem 0;">
        <thead>
          <tr>
            <th style="text-align: left; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px;">Item</th>
            <th style="text-align: center; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px;">Qty</th>
            <th style="text-align: right; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px;">Line Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
      <p style="font-size: 1.1rem;"><strong>Total Paid: $${Number(orderData.totalAmount || 0).toFixed(2)}</strong></p>
      <p>You can track your order from your account orders page.</p>
    </div>
  `;

  const smtpTransport = getTransporter();
  if (!smtpTransport) {
    console.log(`[EMAIL SKIPPED] SMTP is not configured. Intended recipient: ${email}`, {
      orderId: orderData.orderId,
      totalAmount: orderData.totalAmount,
    });
    return;
  }

  await smtpTransport.sendMail({
    from: fromEmail,
    to: email,
    subject,
    text,
    html,
  });
}

export async function sendReturnApprovedEmail(
  email: string,
  returnData: {
    orderId: string;
    refundAmount: number;
    reason: string;
  }
): Promise<void> {
  // TODO: Implement actual email sending
  console.log(`[EMAIL STUB] Return approved email would be sent to ${email}`, returnData);
}

export async function sendReturnRejectedEmail(
  email: string,
  returnData: {
    orderId: string;
    reason: string;
  }
): Promise<void> {
  // TODO: Implement actual email sending
  console.log(`[EMAIL STUB] Return rejected email would be sent to ${email}`, returnData);
}

export async function sendOrderShippedEmail(
  email: string,
  orderData: {
    orderId: string;
    trackingNumber?: string;
    carrier?: string;
  }
): Promise<void> {
  // TODO: Implement actual email sending
  console.log(`[EMAIL STUB] Order shipped email would be sent to ${email}`, orderData);
}

export async function sendDesignFeedbackEmail(
  email: string,
  feedbackData: {
    designTitle: string;
    feedbackMessage: string;
    designerName: string;
  }
): Promise<void> {
  // TODO: Implement actual email sending
  console.log(
    `[EMAIL STUB] Design feedback email would be sent to ${email}`,
    feedbackData
  );
  console.log(`
  Design: ${feedbackData.designTitle}
  From Admin: ${feedbackData.designerName}
  Message: ${feedbackData.feedbackMessage}
  `);
}
