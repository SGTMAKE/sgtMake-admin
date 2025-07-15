"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Send, DollarSign, Package, User } from "lucide-react"
import type { QuoteRequest } from "@/lib/types/types"
import { toast } from "sonner"

interface QuoteResponseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  quote: QuoteRequest | null
  onSuccess: () => void
}

export function QuoteResponseDialog({ open, onOpenChange, quote, onSuccess }: QuoteResponseDialogProps) {
  const [quotedPrice, setQuotedPrice] = useState("")
  const [adminResponse, setAdminResponse] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!quote || !quotedPrice || !adminResponse) {
      toast.error("Please provide both quoted price and response message")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/admin/quotes/${quote.id}/respond`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quotedPrice: Number.parseFloat(quotedPrice),
          adminResponse,
          status: "QUOTED",
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Quote sent successfully!")
        setQuotedPrice("")
        setAdminResponse("")
        onSuccess()
      } else {
        toast.error(data.error || "Failed to send quote")
      }
    } catch (error) {
      console.error("Error sending quote:", error)
      toast.error("Failed to send quote")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!quote) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Send Quote Response - #{quote.id.slice(-8)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Info */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <User className="h-5 w-5 text-gray-500" />
            <div>
              <p className="font-semibold">{quote.user?.name}</p>
              <p className="text-sm text-gray-600">{quote.user?.email}</p>
            </div>
          </div>

          {/* Quote Summary */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-blue-50 rounded-lg">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{quote.totalItems}</p>
              <p className="text-sm text-gray-600">Total Items</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{quote.items.length}</p>
              <p className="text-sm text-gray-600">Product Types</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{new Set(quote.items.map((item) => item.type)).size}</p>
              <p className="text-sm text-gray-600">Categories</p>
            </div>
          </div>

          {/* Pricing Input */}
          <div className="space-y-2">
            <Label htmlFor="quotedPrice">Quoted Price (₹)</Label>
            <div className="relative">
              <Input
                id="quotedPrice"
                type="number"
                placeholder="Enter quoted price"
                value={quotedPrice}
                onChange={(e) => setQuotedPrice(e.target.value)}
                className="pl-10"
              />
            </div>
            {quotedPrice && (
              <p className="text-sm text-gray-600">
                Per item average: ₹{(Number.parseFloat(quotedPrice) / quote.totalItems).toFixed(2)}
              </p>
            )}
          </div>

          {/* Response Message */}
          <div className="space-y-2">
            <Label htmlFor="adminResponse">Response Message</Label>
            <Textarea
              id="adminResponse"
              placeholder="Enter your response message to the customer..."
              value={adminResponse}
              onChange={(e) => setAdminResponse(e.target.value)}
              rows={4}
            />
          </div>

          {/* Customer Notes */}
          {quote.notes && (
            <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
              <h4 className="font-semibold text-yellow-800 mb-2">Customer Notes:</h4>
              <p className="text-yellow-700">{quote.notes}</p>
            </div>
          )}

          {/* Items Preview */}
          <div className="space-y-2">
            <Label>Items Summary</Label>
            <div className="max-h-32 overflow-y-auto space-y-2">
              {quote.items.slice(0, 3).map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium">{item.categoryName}</span>
                    <Badge variant="outline" className="text-xs">
                      {item.type}
                    </Badge>
                  </div>
                  <span className="text-sm font-bold text-orange-600">×{item.quantity}</span>
                </div>
              ))}
              {quote.items.length > 3 && (
                <p className="text-sm text-gray-500 text-center">... and {quote.items.length - 3} more items</p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!quotedPrice || !adminResponse || isSubmitting}
            className="bg-orange-500 hover:bg-orange-600"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Sending...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Send className="h-4 w-4" />
                Send Quote
              </div>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
