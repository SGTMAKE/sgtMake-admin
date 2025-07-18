import { formatCurrency } from "@/lib/utils"

export type OrderStatus = "pending" | "ongoing" | "shipped" | "delivered" | "cancelled"

// Helper function to get status display name and color
const getStatusInfo = (status: OrderStatus) => {
  const statusMap: Record<OrderStatus, { label: string; color: string; bgColor: string }> = {
    pending: { label: "Pending", color: "#FF9800", bgColor: "#FFF3E0" },
    ongoing: { label: "Processing", color: "#2196F3", bgColor: "#E3F2FD" },
    shipped: { label: "Shipped", color: "#4CAF50", bgColor: "#E8F5E9" },
    delivered: { label: "Delivered", color: "#4CAF50", bgColor: "#E8F5E9" },
    cancelled: { label: "Cancelled", color: "#F44336", bgColor: "#FFEBEE" },
  }

  return statusMap[status] || { label: status, color: "#757575", bgColor: "#EEEEEE" }
}

// Helper function to get progress percentage based on status
const getProgressPercentage = (status: OrderStatus): number => {
  const statusProgress: Record<OrderStatus, number> = {
    pending: 25,
    ongoing: 50,
    shipped: 75,
    delivered: 100,
    cancelled: 0,
  }

  return statusProgress[status] || 0
}

export const getOrderStatusEmailTemplate = (order: any, status: OrderStatus) => {
  const statusInfo = getStatusInfo(status)
  // const progressPercentage = getProgressPercentage(status)
  const customerName = order.User?.name || "Valued Customer"
  const orderId = order.orderID
  const formattedDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // Calculate order total
  const orderTotal = order.total ? formatCurrency(order.total) : "N/A"

  // Calculate subtotal (before tax and shipping)
  const subtotal = order.OrderItem?.reduce((sum: number, item: any) => sum + item.basePrice * item.quantity, 0) || 0
  const formattedSubtotal = formatCurrency(subtotal)

  const discount =  subtotal - order.total
  const formattedDiscount = formatCurrency(discount)

  // Generate subject line based on status
  let subject = ""
  switch (status) {
    case "pending":
      subject = `Your Order #${orderId} Has Been Received - SGTMake`
      break
    case "ongoing":
      subject = `Your Order #${orderId} Is Being Processed - SGTMake`
      break
    case "shipped":
      subject = `Your Order #${orderId} Has Been Shipped - SGTMake`
      break
    case "delivered":
      subject = `Your Order #${orderId} Has Been Delivered - SGTMake`
      break
    case "cancelled":
      subject = `Your Order #${orderId} Has Been Cancelled - SGTMake`
      break
    default:
      subject = `Update on Your Order #${orderId} - SGTMake`
  }

  // Generate status-specific message
  let statusMessage = ""
  switch (status) {
    case "pending":
      statusMessage = `Thank you for your order! We've received your order #${orderId} and it's currently being reviewed. We'll begin processing it shortly.`
      break
    case "ongoing":
      statusMessage = `Great news! Your order #${orderId} is now being processed. Our team is working diligently to prepare your items for shipment.`
      break
    case "shipped":
      statusMessage = `Your order #${orderId} has been shipped and is on its way to you! You'll receive another notification when it's delivered.`
      break
    case "delivered":
      statusMessage = `Your order #${orderId} has been successfully delivered! We hope you're enjoying your purchase and thank you for shopping with SGTMake.`
      break
    case "cancelled":
      statusMessage = `Your order #${orderId} has been cancelled as requested. If this was a mistake or you'd like to place a new order, please visit our website.`
      break
    default:
      statusMessage = `There's been an update to your order #${orderId}. Please check your account for more details.`
  }

  // Generate next steps message
  let nextStepsMessage = ""
  switch (status) {
    case "pending":
      nextStepsMessage =
        "Our team will verify your order details and payment. Once confirmed, your order status will change to 'Processing'."
      break
    case "ongoing":
      nextStepsMessage =
        "Your items are being prepared for shipment. You'll receive another notification when your order ships with tracking information."
      break
    case "shipped":
      nextStepsMessage = "Your package is on its way to you. You'll receive another notification when it's delivered."
      break
    case "delivered":
      nextStepsMessage =
        "If you have any questions or need support with your delivered items, please don't hesitate to contact our customer service team."
      break
    case "cancelled":
      nextStepsMessage =
        "Any payment made for this order will be refunded according to our refund policy. If you have questions about your refund, please contact our support team."
      break
    default:
      nextStepsMessage = "Log in to your account to view more details about your order."
  }

  // Generate order timeline with icons
  const generateOrderTimeline = () => {
    const steps = [
      {
        name: "Order Placed",
        completed: true,
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`,
      },
      {
        name: "Processing",
        completed: status !== "pending" && status !== "cancelled",
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg>`,
      },
      {
        name: "Shipped",
        completed: status === "shipped" || status === "delivered",
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>`,
      },
      {
        name: "Delivered",
        completed: status === "delivered",
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`,
      },
    ]

    return `

  <div class="order-container">
    <h3 class="order-title">Order Status</h3>
    <table class="order-table" cellpadding="0" cellspacing="0">
      <tr>
        ${steps
          .map((step, index) => {
            const completed = step.completed ? "completed" : "incomplete";
            const lineColor =
              step.completed && steps[index + 1]?.completed
                ? "line-complete"
                : "line-incomplete";
            return `
              <td class="step-cell">
                <div class="step-circle ${completed}">
                  ${step.icon}
                </div>
                <p class="step-text ${completed}">${step.name}</p>
                ${
                  index < steps.length - 1
                    ? `<div class="step-line ${lineColor}"></div>`
                    : ""
                }
              </td>
            `;
          })
          .join("")}
      </tr>
    </table>
  </div>
`;


  }

  const orderTimelineHtml =
    status === "cancelled"
      ? `
      <div style="background-color: #FFEBEE; border-radius: 8px; padding: 15px; margin: 30px 0; text-align: center;">
        <div style="display: inline-block; margin-right: 10px; vertical-align: middle;">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F44336" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        </div>
        <div style="display: inline-block; vertical-align: middle; text-align: left;">
          <div style="font-weight: 600; color: #F44336; margin-bottom: 4px;">Order Cancelled</div>
          <div style="font-size: 13px; color: #555555;">This order has been cancelled and will not be processed further.</div>
        </div>
      </div>
    `
      : generateOrderTimeline()

  // Generate order items HTML
  let orderItemsHtml = ""
  if (order.OrderItem && order.OrderItem.length > 0) {
    orderItemsHtml = `
      <div style="margin-bottom: 25px;">
        <h2 style="font-size: 18px; margin-bottom: 15px; color: #333333;">Order Items</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
          <thead>
            <tr style="background-color: #F5F5F5;">
              <th style="padding: 10px; text-align: left; border-bottom: 1px solid #E0E0E0;">Item</th>
              <th style="padding: 10px; text-align: center; border-bottom: 1px solid #E0E0E0;">Qty</th>
              <th style="padding: 10px; text-align: right; border-bottom: 1px solid #E0E0E0;">Price</th>
              <th style="padding: 10px; text-align: right; border-bottom: 1px solid #E0E0E0;">Total</th>
            </tr>
          </thead>
          <tbody>
    `

    order.OrderItem.forEach((item: any) => {
      // Determine item name and details based on whether it's a custom product or catalog product
      let itemName = "Product"
      let itemVariant = ""

      if (item.Product) {
        // Standard catalog product
        itemName = item.Product.title || "Product"
        itemVariant = item.variant || ""
      } else if (item.customProduct) {
        // Custom product
        itemName = item.customProduct.title || "Custom Product"
        itemVariant = item.customProduct.options?.productType || item.customProduct.options?.fastenerType || ""
      }

      const itemTotal = item.offerPrice 

      orderItemsHtml += `
        <tr>
          <td style="padding: 12px 10px; border-bottom: 1px solid #E0E0E0;">
            <div style="display: flex; align-items: center;">
                <div style="font-weight: 500; margin-bottom: 4px;">${itemName} </div>
                 ${itemVariant ? `<div style="font-size: 12px; color: #757575;"> ( ${itemVariant} ) </div>` : ""}
            </div>
          </td>
          <td style="padding: 12px 10px; border-bottom: 1px solid #E0E0E0; text-align: center;">${item.quantity}</td>
          <td style="padding: 12px 10px; border-bottom: 1px solid #E0E0E0; text-align: right;">${formatCurrency(item.offerPrice/item.quantity)}</td>
          <td style="padding: 12px 10px; border-bottom: 1px solid #E0E0E0; text-align: right; font-weight: 500;">${formatCurrency(itemTotal)}</td>
        </tr>
      `
    })

    orderItemsHtml += `
          </tbody>
        </table>
      </div>
    `
  }

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          line-height: 1.6;
          color: #333333;
          margin: 0;
          padding: 0;
          -webkit-font-smoothing: antialiased;
          background-color: #f5f5f5;
        }
         .order-container {
      margin: 30px 0;
    }
    .order-title {
      margin: 0 0 15px 0;
      color: #111827;
      font-size: 18px;
    }
    .order-table {
      border-collapse: collapse;
      table-layout: fixed;
      width: 100%;
    }
    .step-cell {
      width: 25%;
      text-align: center;
      position: relative;
    }
    .step-circle {
      margin: 0 auto;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      z-index: 2;
    }
    .step-text {
      margin: 8px 0 0 0;
      font-size: 12px;
    }
    .step-line {
      position: absolute;
      top: 18px;
      left: 50%;
      width: 100%;
      height: 2px;
      z-index: 1;
    }
    .completed {
      background-color: #10b981;
      color: #111827;
      font-weight: 600;
    }
    .incomplete {
      background-color: #e5e7eb;
      color: #6b7280;
      font-weight: 400;
    }
    .line-complete {
      background-color: #10b981;
    }
    .line-incomplete {
      background-color: #e5e7eb;
    }
        .email-container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }
        
        .email-header {
          background: linear-gradient(135deg, #FF6B00 0%, #FF9800 100%);
          padding: 30px 20px;
          text-align: center;
        }
        
        .logo {
          max-width: 180px;
          margin-bottom: 15px;
        }
        
        .email-header h1 {
          color: white;
          margin: 0;
          font-size: 24px;
          font-weight: 600;
        }
        
        .email-body {
          padding: 30px 20px;
        }
        
        .greeting {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 15px;
        }
        
        .message {
          margin-bottom: 25px;
          color: #555555;
        }
        
        .status-container {
          background-color: ${statusInfo.bgColor};
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 25px;
        }
        
        .status-label {
          font-size: 14px;
          color: #666666;
          margin-bottom: 8px;
        }
        
        .status-value {
          display: inline-block;
          background-color: ${statusInfo.color};
          color: white;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 500;
        }
        
        .order-details {
          background-color: #F9F9F9;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 25px;
        }
        
        .detail-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          font-size: 14px;
        }
        
        .detail-label {
          color: #666666;
        }
        
        .detail-value {
          font-weight: 500;
          color: #333333;
        }
        
        .order-summary {
          background-color: #F9F9F9;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 25px;
        }
        
        .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          font-size: 14px;
        }
        
        .summary-label {
          color: #666666;
        }
        
        .summary-value {
          font-weight: 500;
          color: #333333;
          text-align: right;
        }
        
        .summary-total {
          border-top: 1px solid #E0E0E0;
          margin-top: 10px;
          padding-top: 10px;
          font-size: 16px;
          font-weight: 600;
        }
        
        .next-steps {
          background-color: #FFF8E1;
          border-left: 4px solid #FF9800;
          padding: 15px;
          margin-bottom: 25px;
        }
        
        .next-steps-title {
          font-weight: 600;
          color: #FF6B00;
          margin-bottom: 8px;
        }
        
        .cta-button {
          display: block;
          background: linear-gradient(90deg, #FF6B00 0%, #FF9800 100%);
          color: white;
          text-decoration: none;
          text-align: center;
          padding: 12px 24px;
          border-radius: 6px;
          font-weight: 600;
          margin: 30px auto;
          max-width: 200px;
          transition: all 0.3s ease;
        }
        
        .email-footer {
          background-color: #F5F5F5;
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #666666;
        }
        
        .social-links {
          margin: 15px 0;
        }
        
        .social-link {
          display: inline-block;
          margin: 0 8px;
        }
        
        .footer-links {
          margin-top: 15px;
        }
        
        .footer-link {
          color: #666666;
          text-decoration: underline;
          margin: 0 8px;
        }
        
        @media only screen and (max-width: 480px) {
          .email-container {
            border-radius: 0;
          }
          
          .email-header h1 {
            font-size: 20px;
          }
          
          .greeting {
            font-size: 16px;
          }
          
          .cta-button {
            width: 80%;
            max-width: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="email-header">
          <img src="https://www.sgtmake.com/logo.png" alt="SGTMake Logo" class="logo">
          <h1>Order Status Update</h1>
        </div>
        
        <div class="email-body">
          <p class="greeting">Hello ${customerName},</p>
          
          <p class="message">${statusMessage}</p>
          
          ${orderTimelineHtml}
          
          <div class="order-details">
            <div class="detail-row">
              <span class="detail-label">Order ID:</span>
              <span class="detail-value">#${orderId}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Order Date:</span>
              <span class="detail-value">${formattedDate}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Payment Status:</span>
              <span class="detail-value">${order.payment_verified ? "Verified" : "Pending"}</span>
            </div>
          </div>
          
          ${orderItemsHtml}
          
          <div class="order-summary">
            <h2 style="font-size: 18px; margin-top: 0; margin-bottom: 15px; color: #333333;">Order Summary</h2>
            <div class="summary-row">
              <span class="summary-label">Subtotal:</span>
              <span class="summary-value">${formattedSubtotal}</span>
            </div>
            ${
              discount > 0
                ? `
            <div class="summary-row">
              <span class="summary-label">Discount:</span>
              <span class="summary-value">-${formattedDiscount}</span>
            </div>
            `
                : ""
            }
           
            <div class="summary-row summary-total">
              <span class="summary-label">Total:</span>
              <span class="summary-value">${orderTotal}</span>
            </div>
          </div>
          
          <div class="next-steps">
            <div class="next-steps-title">What's Next?</div>
            <p>${nextStepsMessage}</p>
          </div>
          
          <a href="${process.env.URL || "https://sgtmake.com"}/orders/${orderId}" class="cta-button">View Order</a>
        </div>
        
        <div class="email-footer">
          <div class="social-links">
            <a href="https://www.facebook.com/share/1XKtj5HDHx/" class="social-link">Facebook</a>
            <a href="https://www.linkedin.com/company/sgtmake/" class="social-link">LinkedIn</a>
            <a href="https://www.instagram.com/sgt.make?igsh=MTNhZXJnZm5iMDZzdA==" class="social-link">Instagram</a>
          </div>
          
          <p>© ${new Date().getFullYear()} SGTMake. All rights reserved.</p>
          
          <div class="footer-links">
            <a href="${process.env.URL || "https://sgtmake.com"}/privacy-policy" class="footer-link">Privacy Policy</a>
            <a href="${process.env.URL || "https://sgtmake.com"}/support" class="footer-link">Terms of Service</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `

  return {
    subject,
    html,
  }
}
