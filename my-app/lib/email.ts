// Email service stub - to be implemented
// This module handles email notifications for orders, returns, and other events

export async function sendOrderConfirmationEmail(
  email: string,
  orderData: {
    orderId: string;
    orderDate: string;
    items: any[];
    total: number;
  }
): Promise<void> {
  // TODO: Implement actual email sending
  console.log(`[EMAIL STUB] Order confirmation email would be sent to ${email}`, orderData);
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
