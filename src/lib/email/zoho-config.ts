// lib/zoho.ts
import nodemailer from "nodemailer"

export const createZohoTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp.zoho.in', // or 'smtp.zoho.com' if needed
    port: 465,
    secure: true,
    auth: {
      user: process.env.ZOHO_EMAIL as string,
      pass: process.env.ZOHO_PASSWORD as string,
    },
  })
}

export const verifyZohoConnection = async () => {
  try {
    const transporter = createZohoTransporter()
    await transporter.verify()
    return { success: true, message: "Zoho connection verified successfully" }
  } catch (error) {
    console.error("Zoho verification failed:", error)
    return { success: false, message: "Failed to connect to Zoho" }
  }
}
