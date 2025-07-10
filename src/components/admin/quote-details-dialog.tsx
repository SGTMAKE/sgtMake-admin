"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Package, User, Calendar, Mail, Phone } from "lucide-react"
import type { QuoteRequest } from "@/lib/types/types"
import Image from "next/image"

interface QuoteDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  quote: QuoteRequest | null
}

export function QuoteDetailsDialog({ open, onOpenChange, quote }: QuoteDetailsDialogProps) {
  if (!quote) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Quote Request Details - #{quote.id.slice(-8)}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-6 pr-4">
            {/* Customer Information */}
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <User className="h-4 w-4" />
                Customer Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{quote.user?.name || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{quote.user?.email}</p>
                  </div>
                </div>
                {quote.user?.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{quote.user.phone}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Submitted</p>
                    <p className="font-medium">
                      {new Date(quote.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Quote Summary */}
            <div className="space-y-3">
              <h3 className="font-semibold">Quote Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-blue-50 rounded-lg">
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">{quote.totalItems}</p>
                  <p className="text-sm text-gray-600">Total Items</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{quote.items.length}</p>
                  <p className="text-sm text-gray-600">Product Types</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {new Set(quote.items.map((item) => item.type)).size}
                  </p>
                  <p className="text-sm text-gray-600">Categories</p>
                </div>
                <div className="text-center">
                  <Badge className="text-sm px-3 py-1">{quote.status.toLowerCase()}</Badge>
                  <p className="text-sm text-gray-600 mt-1">Status</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Requested Items */}
            <div className="space-y-3">
              <h3 className="font-semibold">Requested Items ({quote.totalItems} total)</h3>
              <div className="space-y-3">
                {quote.items.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center flex-shrink-0">
                        {item.image ? (
                          <Image
                            src={item.image || "/placeholder.svg"}
                            alt={item.categoryName}
                            width={48}
                            height={48}
                            className="object-contain"
                          />
                        ) : (
                          <Package className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">{item.categoryName}</h4>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{item.type}</Badge>
                            <span className="text-lg font-bold text-orange-600">×{item.quantity}</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{item.title}</p>

                        {/* Specifications */}
                        {Object.keys(item.specifications).length > 0 && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-md">
                            <p className="text-xs font-medium text-gray-700 mb-2">Specifications:</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                              {Object.entries(item.specifications)
                                .filter(([key, value]) => key !== "quantity" && key !== "remarks" && value)
                                .map(([key, value]) => (
                                  <div key={key}>
                                    <span className="text-gray-500 capitalize">{key.replace(/_/g, " ")}:</span>
                                    <span className="ml-1 font-medium">
                                      {Array.isArray(value) ? value.join(", ") : String(value)}
                                    </span>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Notes */}
            {quote.notes && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h3 className="font-semibold">Customer Notes</h3>
                  <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
                    <p className="text-gray-700">{quote.notes}</p>
                  </div>
                </div>
              </>
            )}

            {/* Admin Response */}
            {quote.adminResponse && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h3 className="font-semibold">Admin Response</h3>
                  <div className="p-4 bg-blue-50 border-l-4 border-blue-400 rounded-lg">
                    <p className="text-gray-700">{quote.adminResponse}</p>
                    {quote.quotedPrice && (
                      <div className="mt-3 pt-3 border-t border-blue-200">
                        <p className="text-sm text-gray-600">Quoted Price:</p>
                        <p className="text-2xl font-bold text-green-600">
                          ₹{quote.quotedPrice.toLocaleString("en-IN")}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
