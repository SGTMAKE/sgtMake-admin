import { createZohoTransporter } from "./zoho-config"
import { getServiceStatusEmailTemplate } from "./templates/service-status-templates"
import type { ServiceProps, ServiceStatus } from "@/lib/types/service-types"

export const sendServiceStatusEmail = async (
  service: ServiceProps,
  newStatus: ServiceStatus,
): Promise<{ success: boolean; message: string }> => {
  try {
    if (!service.user?.email) {
      return { success: false, message: "No email address found for user" }
    }

    if (!process.env.ZOHO_EMAIL || !process.env.ZOHO_PASSWORD) {
      console.warn("Zoho email credentials not configured")
      return { success: false, message: "Email service not configured" }
    }

    const transporter = createZohoTransporter()
    const emailTemplate = getServiceStatusEmailTemplate(service, newStatus)

    const mailOptions = {
      from: {
        name: "SGTMAKE Services",
        address: process.env.ZOHO_EMAIL,
      },
      to: service.user.email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    }

    await transporter.sendMail(mailOptions)

    return {
      success: true,
      message: `Status update email sent to ${service.user.email}`,
    }
  } catch (error) {
    console.error("Failed to send service status email:", error)
    return {
      success: false,
      message: `Failed to send email: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}
