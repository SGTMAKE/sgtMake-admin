interface QuoteAcceptanceEmailData {
  quoteRequestId: string
  customerName: string
  customerEmail: string
  quotedPrice: number
  acceptanceDate: Date
  items: Array<{
    type: "fastener" | "connector" | "wire"
    categoryName: string
    title: string
    quantity: number
    specifications: Record<string, any>
    image?: string
  }>
  totalItems: number
}

export function generateQuoteAcceptanceEmailTemplate(data: QuoteAcceptanceEmailData): string {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Quote Accepted - SGTMake Admin</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 800px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
            .success-notice { background: #dcfce7; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; border: 2px solid #22c55e; }
            .customer-info { background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #22c55e; }
            .order-summary { background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6; }
            .items-section { margin: 30px 0; }
            .item-card { background: #f8f9fa; border: 1px solid #e0e0e0; border-radius: 8px; padding: 15px; margin: 10px 0; }
            .action-buttons { text-align: center; margin: 30px 0; }
            .btn { display: inline-block; padding: 15px 30px; margin: 0 10px; text-decoration: none; border-radius: 6px; font-weight: bold; }
            .btn-primary { background: #22c55e; color: white; }
            .btn-primary:hover { background: #16a34a; }
            .btn-secondary { background: #6b7280; color: white; }
            .btn-secondary:hover { background: #4b5563; }
            .specifications { background: #f8f9fa; padding: 10px; border-radius: 4px; margin: 5px 0; font-size: 12px; }
            .priority-high { color: #dc2626; font-weight: bold; }
            h1, h2, h3 { margin-top: 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 Quote Accepted!</h1>
                <p>Quote ID: #${data.quoteRequestId.slice(-8)}</p>
            </div>
            
            <div class="content">
                <div class="success-notice">
                    <h3 style="margin: 0; color: #166534;">✅ Great News!</h3>
                    <p style="margin: 5px 0 0 0; color: #166534;">Customer has accepted the quote and added items to cart. Order processing can begin!</p>
                </div>

                <div class="customer-info">
                    <h3>👤 Customer Details</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                        <div>
                            <strong>Customer:</strong><br>
                            ${data.customerName}
                        </div>
                        <div>
                            <strong>Email:</strong><br>
                            <a href="mailto:${data.customerEmail}">${data.customerEmail}</a>
                        </div>
                        <div>
                            <strong>Accepted On:</strong><br>
                            ${formatDate(data.acceptanceDate)}
                        </div>
                        <div>
                            <strong>Order Value:</strong><br>
                            <span style="font-size: 18px; font-weight: bold; color: #22c55e;">₹${data.quotedPrice.toLocaleString("en-IN")}</span>
                        </div>
                    </div>
                </div>

                <div class="order-summary">
                    <h3>📊 Order Summary</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; text-align: center;">
                        <div>
                            <div style="font-size: 24px; font-weight: bold; color: #f97316;">${data.totalItems}</div>
                            <div style="font-size: 12px; color: #666;">Total Items</div>
                        </div>
                        <div>
                            <div style="font-size: 24px; font-weight: bold; color: #3b82f6;">${data.items.length}</div>
                            <div style="font-size: 12px; color: #666;">Product Types</div>
                        </div>
                        <div>
                            <div style="font-size: 24px; font-weight: bold; color: #22c55e;">₹${(data.quotedPrice / data.totalItems).toFixed(2)}</div>
                            <div style="font-size: 12px; color: #666;">Per Item Avg</div>
                        </div>
                        <div>
                            <div style="font-size: 24px; font-weight: bold; color: #dc2626;">₹${data.quotedPrice.toLocaleString("en-IN")}</div>
                            <div style="font-size: 12px; color: #666;">Total Value</div>
                        </div>
                    </div>
                </div>

                <div class="items-section">
                    <h3>🔧 Accepted Items</h3>
                    ${data.items
                      .map(
                        (item, index) => `
                        <div class="item-card">
                            <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 10px;">
                                <div>
                                    <h4 style="margin: 0; color: #333;">${item.categoryName}</h4>
                                    <span style="background: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 12px; font-size: 10px; text-transform: uppercase;">${item.type}</span>
                                </div>
                                <div style="text-align: right;">
                                    <div style="font-size: 18px; font-weight: bold; color: #f97316;">×${item.quantity}</div>
                                    <div style="font-size: 10px; color: #666;">Quantity</div>
                                </div>
                            </div>
                            
                            <div><strong>Product:</strong> ${item.title}</div>
                            
                            ${
                              Object.keys(item.specifications).length > 0
                                ? `
                                <div class="specifications">
                                    <strong>Specifications:</strong><br>
                                    ${Object.entries(item.specifications)
                                      .filter(([key, value]) => key !== "quantity" && key !== "remarks" && value)
                                      .map(
                                        ([key, value]) =>
                                          `<strong>${key.replace(/_/g, " ").toUpperCase()}:</strong> ${Array.isArray(value) ? value.join(", ") : value}`,
                                      )
                                      .join("<br>")}
                                </div>
                            `
                                : ""
                            }
                        </div>
                    `,
                      )
                      .join("")}
                </div>

                <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                    <h3 style="color: #92400e;">⚡ Next Steps</h3>
                    <ul style="color: #92400e; margin: 0; padding-left: 20px;">
                        <li>Customer has added items to their cart</li>
                        <li>Monitor for order completion and payment</li>
                        <li>Prepare items for production/fulfillment</li>
                        <li>Send order confirmation once payment is received</li>
                    </ul>
                </div>

                <div class="action-buttons">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://sgtmake.com"}/admin/orders" class="btn btn-primary">
                        📦 View Orders
                    </a>
                    <a href="mailto:${data.customerEmail}?subject=Order%20Confirmation%20%23${data.quoteRequestId.slice(-8)}" class="btn btn-secondary">
                        📧 Contact Customer
                    </a>
                </div>

                <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #0ea5e9;">
                    <h4 style="margin: 0 0 10px 0; color: #0c4a6e;">💡 Pro Tip</h4>
                    <p style="margin: 0; font-size: 14px; color: #0c4a6e;">
                        Follow up with the customer to ensure smooth order processing and maintain excellent service standards.
                    </p>
                </div>
            </div>
            
            <div class="footer">
                <p><strong>SGTMake Admin Panel</strong></p>
                <p style="font-size: 12px; color: #666;">
                    Quote accepted on ${formatDate(data.acceptanceDate)}
                </p>
                <p style="font-size: 12px; color: #666;">
                    Total order value: ₹${data.quotedPrice.toLocaleString("en-IN")}
                </p>
            </div>
        </div>
    </body>
    </html>
  `
}
