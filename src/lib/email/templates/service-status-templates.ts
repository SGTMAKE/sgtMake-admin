import type { ServiceProps, ServiceStatus } from "@/lib/types/service-types"

// Helper function to get status display name and color
const getStatusInfo = (status: ServiceStatus) => {
  const statusMap: Record<ServiceStatus, { label: string; color: string; bgColor: string }> = {
    pending: { label: "Requested", color: "#FF9800", bgColor: "#FFF3E0" },
    approved: { label: "Review & Approved", color: "#FF9800", bgColor: "#FFF3E0" },
    production: { label: "In Production", color: "#2196F3", bgColor: "#E3F2FD" },
    testing: { label: "Quality Test", color: "#2196F3", bgColor: "#E3F2FD" },
    shipped: { label: "Shipped", color: "#4CAF50", bgColor: "#E8F5E9" },
    delivered: { label: "Delivered", color: "#4CAF50", bgColor: "#E8F5E9" },
    cancelled: { label: "Cancelled", color: "#F44336", bgColor: "#FFEBEE" },
    cancel_requested: { label: "Cancel Requested", color: "#F44336", bgColor: "#FFEBEE" },
  }

  return statusMap[status] || { label: status, color: "#757575", bgColor: "#EEEEEE" }
}

// Helper function to get progress percentage based on status
const getProgressPercentage = (status: ServiceStatus): number => {
  const statusProgress: Record<ServiceStatus, number> = {
    pending: 10,
    approved: 25,
    production: 50,
    testing: 75,
    shipped: 90,
    delivered: 100,
    cancelled: 0,
    cancel_requested: 0,
  }

  return statusProgress[status] || 0
}

export const getServiceStatusEmailTemplate = (service: ServiceProps, status: ServiceStatus) => {
  const statusInfo = getStatusInfo(status)
  const progressPercentage = getProgressPercentage(status)
  const serviceType = service.formDetails.type || "Service"
  const customerName = service.user?.name || "Valued Customer"
  const serviceId = service.id
  const formattedDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // Generate subject line based on status
  let subject = ""
  switch (status) {
    case "pending":
      subject = `Your ${serviceType} Request Has Been Received - SGTMake`
      break
    case "approved":
      subject = `Your ${serviceType} Request Has Been Approved - SGTMake`
      break
    case "production":
      subject = `Your ${serviceType} Is Now In Production - SGTMake`
      break
    case "testing":
      subject = `Your ${serviceType} Is In Quality Testing - SGTMake`
      break
    case "shipped":
      subject = `Your ${serviceType} Has Been Shipped - SGTMake`
      break
    case "delivered":
      subject = `Your ${serviceType} Has Been Delivered - SGTMake`
      break
    case "cancelled":
      subject = `Your ${serviceType} Request Has Been Cancelled - SGTMake`
      break
    case "cancel_requested":
      subject = `Your ${serviceType} Cancellation Request Received - SGTMake`
      break
    default:
      subject = `Update on Your ${serviceType} Request - SGTMake`
  }

  // Generate status-specific message
  let statusMessage = ""
  switch (status) {
    case "pending":
      statusMessage = `We've received your ${serviceType} request and it's currently under review. Our team will assess your requirements and get back to you shortly.`
      break
    case "approved":
      statusMessage = `Great news! Your ${serviceType} request has been reviewed and approved. We're preparing to begin work on your project.`
      break
    case "production":
      statusMessage = `We're excited to inform you that your ${serviceType} is now in production. Our skilled team is working diligently to meet your specifications.`
      break
    case "testing":
      statusMessage = `Your ${serviceType} has moved to quality testing. We're ensuring everything meets our high standards before proceeding to the next step.`
      break
    case "shipped":
      statusMessage = `Your ${serviceType} has been shipped and is on its way to you! You should receive it shortly.`
      break
    case "delivered":
      statusMessage = `Your ${serviceType} has been successfully delivered. We hope it meets your expectations and thank you for choosing SGTMake.`
      break
    case "cancelled":
      statusMessage = `Your ${serviceType} request has been cancelled as requested. If this was a mistake or you'd like to resubmit, please contact our support team.`
      break
    case "cancel_requested":
      statusMessage = `We've received your request to cancel your ${serviceType}. Our team is reviewing this request and will follow up shortly.`
      break
    default:
      statusMessage = `There's been an update to your ${serviceType} request. Please check your account for more details.`
  }

  // Generate next steps message
  let nextStepsMessage = ""
  switch (status) {
    case "pending":
      nextStepsMessage =
        "Our team will review your request and update the status to 'Approved' once we've confirmed all details."
      break
    case "approved":
      nextStepsMessage =
        "Your project will soon move to the production phase where our team will begin working on your specifications."
      break
    case "production":
      nextStepsMessage =
        "Once production is complete, your item will undergo quality testing to ensure it meets our standards."
      break
    case "testing":
      nextStepsMessage =
        "After passing quality tests, your item will be prepared for shipping to your specified address."
      break
    case "shipped":
      nextStepsMessage =
        "You can track your delivery using the information in your account. The status will update to 'Delivered' once received."
      break
    case "delivered":
      nextStepsMessage =
        "If you have any questions or need support with your delivered item, please don't hesitate to contact us."
      break
    case "cancelled":
      nextStepsMessage =
        "If you wish to resubmit your request or have any questions, please contact our customer support team."
      break
    case "cancel_requested":
      nextStepsMessage = "We'll review your cancellation request and update you on the status within 1-2 business days."
      break
    default:
      nextStepsMessage = "Log in to your account to view more details about your service request."
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
        
        .progress-container {
          margin: 25px 0;
        }
        
        .progress-label {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        
        .progress-text {
          font-size: 14px;
          color: #666666;
        }
        
        .progress-percentage {
          font-size: 14px;
          font-weight: 600;
          color: #FF6B00;
        }
        
        .progress-bar-bg {
          background-color: #E0E0E0;
          height: 8px;
          border-radius: 4px;
          overflow: hidden;
        }
        
        .progress-bar-fill {
          background: linear-gradient(90deg, #FF6B00 0%, #FF9800 100%);
          height: 100%;
          width: ${progressPercentage}%;
          border-radius: 4px;
        }
        
        .service-details {
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
          width:100%;
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
            width: 100%;
            max-width: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="email-header">
          <img src="https://media.licdn.com/dms/image/v2/D4D0BAQElFcX8-brRSA/company-logo_200_200/B4DZUx2Y_qHYAI-/0/1740298099195/sgtmake_logo?e=2147483647&v=beta&t=56h6EkagixhRNExEoUlMoreDVa5bDOWus3eZ55hz0ZE" alt="SGTMake Logo" class="logo">
          <h1>Service Status Update</h1>
        </div>
        
        <div class="email-body">
          <p class="greeting">Hello ${customerName},</p>
          
          <p class="message">${statusMessage}</p>
          
          <div class="status-container">
            <div class="status-label">Current Status:</div>
            <div class="status-value"> ${statusInfo.label}</div>
            
            <div class="progress-container">
              <div class="progress-label">
                <span class="progress-text">Progress </span>
                <span class="progress-percentage"> : ${progressPercentage}%</span>
              </div>
              <div class="progress-bar-bg">
                <div class="progress-bar-fill"></div>
              </div>
            </div>
          </div>
          
          <div class="service-details">
            <div class="detail-row">
              <span class="detail-label">Service ID : </span>
              <span class="detail-value"> ${serviceId}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Service Type : </span>
              <span class="detail-value"> ${serviceType}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Updated On : </span>
              <span class="detail-value"> ${formattedDate}</span>
            </div>
          </div>
          
          <div class="next-steps">
            <div class="next-steps-title">What's Next?</div>
            <p>${nextStepsMessage}</p>
          </div>
          
          <a href="${process.env.URL || "https://sgtmake.com"}/dashboard/services/${serviceId}" class="cta-button">View Details</a>
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
