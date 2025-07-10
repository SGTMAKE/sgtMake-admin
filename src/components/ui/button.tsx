import type { ButtonHTMLAttributes, ReactNode } from "react"
import clsx from "clsx"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline"
  children: ReactNode
}

export function Button({ variant = "default", className, ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        "px-4 py-2 rounded font-medium transition",
        variant === "outline"
          ? "border border-gray-300 bg-white text-gray-800 hover:bg-gray-100"
          : "bg-orange-500 text-white hover:bg-orange-700",
        className
      )}
      {...props}
    />
  )
}