import { createZohoTransporter } from "./zoho-config"
import { getOrderStatusEmailTemplate } from "./templates/order-status-templates"
export type OrderStatus = 'pending' | 'ongoing' | 'delivered' | 'cancelled'


export const sendOrderStatusEmail = async (
  order: any,
  newStatus: OrderStatus,
): Promise<{ success: boolean; message: string }> => {
  try {
    if (!order.User?.email) {
      return { success: false, message: "No email address found for user" }
    }

    if (!process.env.ZOHO_EMAIL || !process.env.ZOHO_PASSWORD) {
      console.warn("Zoho email credentials not configured")
      return { success: false, message: "Email service not configured" }
    }

    const transporter = createZohoTransporter()
    const emailTemplate = getOrderStatusEmailTemplate(order, newStatus)

    const mailOptions = {
      from: {
        name: "SGTMAKE Store",
        address: process.env.ZOHO_EMAIL,
      },
      to: order.User.email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    }

    await transporter.sendMail(mailOptions)

    return {
      success: true,
      message: `Order status update email sent to ${order.User.email}`,
    }
  } catch (error) {
    console.error("Failed to send order status email:", error)
    return {
      success: false,
      message: `Failed to send email: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}
