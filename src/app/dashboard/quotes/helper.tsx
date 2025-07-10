"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, Clock, CheckCircle, DollarSign } from "lucide-react"
import QuotesTable from "@/components/admin/quotes-table"
import type { QuoteRequest } from "@/lib/types/types"

interface QuoteStats {
  total: number
  pending: number
  quoted: number
  accepted: number
  rejected: number
  totalValue: number
}

export default function AdminQuotesPage() {
  const [activeTab, setActiveTab] = useState("all")

  const { data: quotesData, isLoading } = useQuery({
    queryKey: ["admin-quotes"],
    queryFn: async () => {
      const response = await fetch("/api/admin/quotes")
      if (!response.ok) throw new Error("Failed to fetch quotes")
      return response.json()
    },
  })

  const quotes: QuoteRequest[] = quotesData?.quoteRequests || []

  // Calculate stats
  const stats: QuoteStats = {
    total: quotes.length,
    pending: quotes.filter((q) => q.status === "PENDING").length,
    quoted: quotes.filter((q) => q.status === "QUOTED").length,
    accepted: quotes.filter((q) => q.status === "ACCEPTED").length,
    rejected: quotes.filter((q) => q.status === "REJECTED").length,
    totalValue: quotes.reduce((sum, q) => sum + (q.quotedPrice || 0), 0),
  }

  // Filter quotes based on active tab
  const filteredQuotes = quotes.filter((quote) => {
    if (activeTab === "all") return true
    return quote.status === activeTab.toUpperCase()
  })

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-orange-500">Quote Management</h1>
        <p className="text-gray-600">Manage customer quote requests and set pricing</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All quote requests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting response</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quoted</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.quoted}</div>
            <p className="text-xs text-muted-foreground">Quotes sent</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{stats.totalValue.toLocaleString("en-IN")}</div>
            <p className="text-xs text-muted-foreground">Quoted amount</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs and Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Quote Requests</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                {stats.pending} Pending
              </Badge>
              <Badge variant="outline" className="text-blue-600 border-blue-600">
                {stats.quoted} Quoted
              </Badge>
              <Badge variant="outline" className="text-green-600 border-green-600">
                {stats.accepted} Accepted
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
              <TabsTrigger value="quoted">Quoted ({stats.quoted})</TabsTrigger>
              <TabsTrigger value="accepted">Accepted ({stats.accepted})</TabsTrigger>
              <TabsTrigger value="rejected">Rejected ({stats.rejected})</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              <QuotesTable quotes={filteredQuotes} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
