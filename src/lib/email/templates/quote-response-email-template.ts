interface QuoteResponseEmailData {
  quoteRequestId: string
  customerName: string
  customerEmail: string
  quotedPrice: number
  adminResponse: string
  items: Array<{
    type: "fastener" | "connector" | "wire"
    categoryName: string
    title: string
    quantity: number
    specifications: Record<string, any>
    image?: string
  }>
  totalItems: number
  validUntil?: Date
}

export function generateQuoteResponseEmailTemplate(data: QuoteResponseEmailData): string {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const validUntilText = data.validUntil ? `Valid until ${formatDate(data.validUntil)}` : "Valid for 30 days"

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Quote is Ready - SGTMake</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 800px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
            .quote-summary { background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #22c55e; }
            .price-highlight { background: #fef3c7; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; border: 2px solid #f59e0b; }
            .items-section { margin: 30px 0; }
            .item-card { background: #f8f9fa; border: 1px solid #e0e0e0; border-radius: 8px; padding: 15px; margin: 10px 0; }
            .action-buttons { text-align: center; margin: 30px 0; }
            .btn { display: inline-block; padding: 15px 30px; margin: 0 10px; text-decoration: none; border-radius: 6px; font-weight: bold; }
            .btn-primary { background: #22c55e; color
            .btn-primary { background: #22c55e; color: white; }
            .btn-primary:hover { background: #16a34a; }
            .btn-secondary { background: #6b7280; color: white; }
            .btn-secondary:hover { background: #4b5563; }
            .specifications { background: #f8f9fa; padding: 10px; border-radius: 4px; margin: 5px 0; font-size: 12px; }
            .valid-until { color: #dc2626; font-weight: bold; }
            h1, h2, h3 { margin-top: 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>💰 Your Quote is Ready!</h1>
                <p>Quote Request ID: #${data.quoteRequestId.slice(-8)}</p>
            </div>
            
            <div class="content">
                <h2>Dear ${data.customerName},</h2>
                
                <p>Thank you for your quote request! We're pleased to provide you with a competitive quote for your requirements.</p>

                <div class="price-highlight">
                    <h2 style="margin: 0; color: #f59e0b;">Total Quoted Price</h2>
                    <div style="font-size: 36px; font-weight: bold; color: #dc2626; margin: 10px 0;">
                        ₹${data.quotedPrice.toLocaleString("en-IN")}
                    </div>
                    <p class="valid-until">${validUntilText}</p>
                </div>

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
                        <div>
                            <div style="font-size: 24px; font-weight: bold; color: #22c55e;">₹${(data.quotedPrice / data.totalItems).toFixed(2)}</div>
                            <div style="font-size: 12px; color: #666;">Per Item Avg</div>
                        </div>
                    </div>
                </div>

                <div class="items-section">
                    <h3>🔧 Quoted Items</h3>
                    ${data.items
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

                ${
                  data.adminResponse
                    ? `
                    <div style="background: #eff6ff; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 20px 0;">
                        <h3 style="color: #1e40af;">💬 Additional Information</h3>
                        <p>${data.adminResponse}</p>
                    </div>
                `
                    : ""
                }

                <div class="action-buttons">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://sgtmake.com"}/quotes" class="btn btn-primary">
                        ✅ Accept Quote
                    </a>
                    <a href="mailto:${process.env.ADMIN_EMAIL || "support@sgtmake.com"}?subject=Quote%20Inquiry%20%23${data.quoteRequestId.slice(-8)}" class="btn btn-secondary">
                        💬 Ask Questions
                    </a>
                </div>

                <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #0ea5e9;">
                    <h4 style="margin: 0 0 10px 0; color: #0c4a6e;">📞 Need Help?</h4>
                    <p style="margin: 0; font-size: 14px; color: #0c4a6e;">
                        Our team is here to help! Contact us at <strong>${process.env.ADMIN_EMAIL || "support@sgtmake.com"}</strong> 
                        or call us for any questions about this quote.
                    </p>
                </div>
            </div>
            
            <div class="footer">
                <p><strong>SGTMake - Your Trusted Fastener Partner</strong></p>
                <p style="font-size: 12px; color: #666;">
                    This quote is ${validUntilText.toLowerCase()}. Please respond promptly to secure these prices.
                </p>
                <p style="font-size: 12px; color: #666;">
                    Generated on ${formatDate(new Date())}
                </p>
            </div>
        </div>
    </body>
    </html>
  `
}
