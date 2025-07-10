"use client"

import { CheckCircle, Circle, Mail, Eye, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"

interface EmailStatusStepperProps {
  status: string
  emailSent?: boolean
  emailOpened?: boolean
  responseReceived?: boolean
}

export function EmailStatusStepper({
  status,
  emailSent = false,
  emailOpened = false,
  responseReceived = false,
}: EmailStatusStepperProps) {
  const steps = [
    {
      id: "submitted",
      label: "Quote Submitted",
      icon: Circle,
      completed: true,
    },
    {
      id: "email-sent",
      label: "Quote Email Sent",
      icon: Mail,
      completed: emailSent || status !== "pending",
    },
    {
      id: "email-opened",
      label: "Email Opened",
      icon: Eye,
      completed: emailOpened,
    },
    {
      id: "response",
      label: "Response Received",
      icon: MessageSquare,
      completed: responseReceived || status === "accepted" || status === "rejected",
    },
  ]

  return (
    <div className="flex items-center space-x-4 overflow-x-auto pb-2">
      {steps.map((step, index) => {
        const Icon = step.completed ? CheckCircle : step.icon
        const isLast = index === steps.length - 1

        return (
          <div key={step.id} className="flex items-center space-x-2 min-w-0">
            <div className="flex flex-col items-center space-y-1">
              <div
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full border-2",
                  step.completed
                    ? "bg-green-100 border-green-500 text-green-600"
                    : "bg-gray-100 border-gray-300 text-gray-400",
                )}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span
                className={cn(
                  "text-xs text-center whitespace-nowrap",
                  step.completed ? "text-green-600 font-medium" : "text-gray-500",
                )}
              >
                {step.label}
              </span>
            </div>
            {!isLast && (
              <div
                className={cn(
                  "h-0.5 w-8 mx-2",
                  step.completed && steps[index + 1]?.completed ? "bg-green-500" : "bg-gray-300",
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
