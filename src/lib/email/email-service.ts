import nodemailer from "nodemailer"
import { generateQuoteResponseEmailTemplate } from "./templates/quote-response-email-template"
import { generateQuoteStatusEmailTemplate } from "./templates/quote-status-email-template"
import { generateQuoteAcceptanceEmailTemplate } from "./templates/quote-acceptance-email-template"

interface EmailConfig {
  to: string | string[]
  cc?: string[]
  subject: string
  html: string
}

interface QuoteRequestNotificationData {
  quoteRequestId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  submissionDate: Date
  items: Array<{
    type: "fastener" | "connector" | "wire"
    categoryName: string
    title: string
    quantity: number
    specifications: Record<string, any>
    image?: string
  }>
  totalItems: number
  notes: string
}

interface QuoteResponseData {
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

interface QuoteStatusUpdateData {
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

interface QuoteAcceptanceData {
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

class EmailService {
  private transporter: nodemailer.Transporter

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: "smtp.zoho.in",
      port: 465,
      secure: false,
      auth: {
        user: process.env.ZOHO_EMAIL,
        pass: process.env.ZOHO_PASSWORD,
      },
    })
  }

  private async sendEmail(config: EmailConfig): Promise<void> {
    try {
      const mailOptions = {
        from: `"SGTMake" <${process.env.ZOHO_EMAIL_USER}>`,
        to: Array.isArray(config.to) ? config.to.join(", ") : config.to,
        cc: config.cc?.join(", "),
        subject: config.subject,
        html: config.html,
      }

      const result = await this.transporter.sendMail(mailOptions)
      console.log("Email sent successfully:", result.messageId)
    } catch (error) {
      console.error("Email sending failed:", error)
      throw error
    }
  }

 

  async sendQuoteResponse(data: QuoteResponseData): Promise<void> {
    const html = generateQuoteResponseEmailTemplate(data)

    await this.sendEmail({
      to: data.customerEmail,
      cc: process.env.ADMIN_CC_EMAILS?.split(",") || [],
      subject: `Your Quote is Ready - ₹${data.quotedPrice.toLocaleString("en-IN")} | SGTMake`,
      html,
    })
  }

  async sendQuoteStatusUpdate(data: QuoteStatusUpdateData): Promise<void> {
    const html = generateQuoteStatusEmailTemplate(data)

    await this.sendEmail({
      to: data.customerEmail,
      cc: process.env.ADMIN_CC_EMAILS?.split(",") || [],
      subject: `Quote Status Update - ${data.newStatus} | SGTMake`,
      html,
    })
  }

  async sendQuoteAcceptanceNotification(data: QuoteAcceptanceData): Promise<void> {
    const html = generateQuoteAcceptanceEmailTemplate(data)

    await this.sendEmail({
      to: process.env.ADMIN_EMAIL || "admin@sgtmake.com",
      cc: process.env.ADMIN_CC_EMAILS?.split(",") || [],
      subject: `Quote Accepted - ₹${data.quotedPrice.toLocaleString("en-IN")} | ${data.customerName}`,
      html,
    })
  }
}

export const emailService = new EmailService()
