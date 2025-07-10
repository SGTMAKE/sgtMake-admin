interface QuoteStatusEmailData {
  quoteRequestId: string
  customerName: string
  customerEmail: string
  newStatus: string
  quotedPrice?: number
  adminResponse?: string
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

export function generateQuoteStatusEmailTemplate(data: QuoteStatusEmailData): string {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "PENDING":
        return {
          emoji: "⏳",
          title: "Quote Under Review",
          color: "#f59e0b",
          bgColor: "#fef3c7",
          message: "Your quote request is being reviewed by our team.",
        }
      case "QUOTED":
        return {
          emoji: "💰",
          title: "Quote Ready",
          color: "#3b82f6",
          bgColor: "#dbeafe",
          message: "Your quote is ready! Please review the pricing details.",
        }
      case "ACCEPTED":
        return {
          emoji: "✅",
          title: "Quote Accepted",
          color: "#22c55e",
          bgColor: "#dcfce7",
          message: "Thank you for accepting our quote! We'll process your order soon.",
        }
      case "REJECTED":
        return {
          emoji: "❌",
          title: "Quote Declined",
          color: "#ef4444",
          bgColor: "#fee2e2",
          message: "We understand this quote didn't meet your requirements.",
        }
      default:
        return {
          emoji: "📋",
          title: "Status Updated",
          color: "#6b7280",
          bgColor: "#f3f4f6",
          message: "Your quote status has been updated.",
        }
    }
  }

  const statusInfo = getStatusInfo(data.newStatus)

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Quote Status Update - SGTMake</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 800px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
            .status-update { background: ${statusInfo.bgColor}; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${statusInfo.color}; text-align: center; }
            .quote-summary { background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #22c55e; }
            .items-section { margin: 30px 0; }
            .item-card { background: #f8f9fa; border: 1px solid #e0e0e0; border-radius: 8px; padding: 15px; margin: 10px 0; }
            .action-buttons { text-align: center; margin: 30px 0; }
            .btn { display: inline-block; padding: 15px 30px; margin: 0 10px; text-decoration: none; border-radius: 6px; font-weight: bold; }
            .btn-primary { background: #f97316; color: white; }
            .btn-primary:hover { background: #ea580c; }
            .btn-secondary { background: #6b7280; color: white; }
            .btn-secondary:hover { background: #4b5563; }
            .specifications { background: #f8f9fa; padding: 10px; border-radius: 4px; margin: 5px 0; font-size: 12px; }
            h1, h2, h3 { margin-top: 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>${statusInfo.emoji} Quote Status Update</h1>
                <p>Quote Request ID: #${data.quoteRequestId.slice(-8)}</p>
            </div>
            
            <div class="content">
                <h2>Dear ${data.customerName},</h2>
                
                <div class="status-update">
                    <h2 style="margin: 0; color: ${statusInfo.color};">${statusInfo.title}</h2>
                    <p style="margin: 10px 0 0 0; color: ${statusInfo.color};">${statusInfo.message}</p>
                </div>

                ${
                  data.quotedPrice
                    ? `
                    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #22c55e; text-align: center;">
                        <h3 style="color: #166534;">💰 Quoted Price</h3>
                        <div style="font-size: 36px; font-weight: bold; color: #dc2626; margin: 10px 0;">
                            ₹${data.quotedPrice.toLocaleString("en-IN")}
                        </div>
                        <p style="color: #166534;">For ${data.totalItems} items</p>
                    </div>
                `
                    : ""
                }

                <div class="quote-summary">
                    <h3>📋 Quote Summary</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; text-align: center;">
                        <div>
                            <div style="font-size: 24px; font-weight: bold; color: #f97316;">${data.totalItems}</div>
                            <div style="font-size: 12px; color: #666;">Total Items</div>
                        </div>
                        <div>
                            <div style="font-size: 24px; font-weight: bold; color: #3b82f6;">${data.items.length}</div>
                            <div style="font-size: 12px; color: #666;">Product Types</div>
                        </div>
                        ${
                          data.quotedPrice
                            ? `
                        <div>
                            <div style="font-size: 24px; font-weight: bold; color: #22c55e;">₹${(data.quotedPrice / data.totalItems).toFixed(2)}</div>
                            <div style="font-size: 12px; color: #666;">Per Item Avg</div>
                        </div>
                        `
                            : ""
                        }
                    </div>
                </div>

                ${
                  data.adminResponse
                    ? `
                    <div style="background: #eff6ff; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 20px 0;">
                        <h3 style="color: #1e40af;">💬 Message from Our Team</h3>
                        <p style="color: #1e40af;">${data.adminResponse}</p>
                    </div>
                `
                    : ""
                }

                <div class="items-section">
                    <h3>🔧 Your Requested Items</h3>
                    ${data.items
                      .slice(0, 3)
                      .map(
                        (item, index) => `
                        <div class="item-card">
                            <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 10px;">
                                <div>
                                    <h4 style="margin: 0; color: #333;">${item.categoryName}</h4>
                                    <span style="background: #e5e7eb; color: #374151; padding: 2px 8px; border-radius: 12px; font-size: 10px; text-transform: uppercase;">${item.type}</span>
                                </div>
                                <div style="text-align: right;">
                                    <div style="font-size: 18px; font-weight: bold; color: #f97316;">×${item.quantity}</div>
                                    <div style="font-size: 10px; color: #666;">Quantity</div>
                                </div>
                            </div>
                            <div><strong>Product:</strong> ${item.title}</div>
                        </div>
                    `,
                      )
                      .join("")}
                    
                    ${
                      data.items.length > 3
                        ? `
                        <div style="text-align: center; padding: 10px; color: #666; font-style: italic;">
                            ... and ${data.items.length - 3} more items
                        </div>
                    `
                        : ""
                    }
                </div>

                ${
                  data.newStatus === "QUOTED"
                    ? `
                    <div class="action-buttons">
                        <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://sgtmake.com"}/quotes" class="btn btn-primary">
                            ✅ View & Accept Quote
                        </a>
                        <a href="mailto:${process.env.ADMIN_EMAIL || "admin@sgtmake.com"}?subject=Quote%20Inquiry%20%23${data.quoteRequestId.slice(-8)}" class="btn btn-secondary">
                            💬 Ask Questions
                        </a>
                    </div>
                `
                    : ""
                }

                <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #0ea5e9;">
                    <h4 style="margin: 0 0 10px 0; color: #0c4a6e;">📞 Need Help?</h4>
                    <p style="margin: 0; font-size: 14px; color: #0c4a6e;">
                        Our team is here to help! Contact us at <strong>${process.env.ADMIN_EMAIL || "admin@sgtmake.com"}</strong> 
                        for any questions about your quote.
                    </p>
                </div>
            </div>
            
            <div class="footer">
                <p><strong>SGTMake - Your Trusted Fastener Partner</strong></p>
                <p style="font-size: 12px; color: #666;">
                    Status updated on ${formatDate(new Date())}
                </p>
            </div>
        </div>
    </body>
    </html>
  `
}
