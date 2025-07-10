"use client"

import React from "react"
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Pagination,
  type Selection,
  type SortDescriptor,
  Chip,
  type ChipProps,
  Select,
  SelectItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Textarea,
} from "@nextui-org/react"
import { ChevronDown, Eye, Search, DollarSign, Send, Package, User } from "lucide-react"
import { capitalize, formatCurrency } from "@/lib/utils"
import Link from "next/link"
import type { QuoteRequest } from "@/lib/types/types"
import { toast } from "sonner"
import { useMutation, useQueryClient } from "@tanstack/react-query"

const statusColorMap: Record<string, ChipProps["color"]> = {
  PENDING: "warning",
  QUOTED: "primary",
  ACCEPTED: "success",
  REJECTED: "danger",
}

const columns = [
  { name: "QUOTE ID", uid: "quoteId" },
  { name: "CUSTOMER", uid: "customer" },
  { name: "ITEMS", uid: "totalItems", sortable: true },
  { name: "SUBMITTED", uid: "createdAt", sortable: true },
  { name: "STATUS", uid: "status" },
  { name: "QUOTED PRICE", uid: "quotedPrice", sortable: true },
  { name: "EMAIL STATUS", uid: "emailStatus" },
  { name: "ACTIONS", uid: "actions" },
]

const INITIAL_VISIBLE_COLUMNS = ["quoteId", "customer", "totalItems", "createdAt", "status", "quotedPrice", "actions"]

interface QuotesTableProps {
  quotes?: QuoteRequest[]
}

export default function QuotesTable({ quotes = [] }: QuotesTableProps) {
  const [filterValue, setFilterValue] = React.useState("")
  const [visibleColumns, setVisibleColumns] = React.useState<Selection>(new Set(INITIAL_VISIBLE_COLUMNS))
  const [rowsPerPage, setRowsPerPage] = React.useState(10)
  const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>({
    column: "createdAt",
    direction: "descending",
  })
  const [page, setPage] = React.useState(1)
  const [selectedQuote, setSelectedQuote] = React.useState<QuoteRequest | null>(null)
  const [quotedPrice, setQuotedPrice] = React.useState("")
  const [adminResponse, setAdminResponse] = React.useState("")

  const { isOpen: isPricingOpen, onOpen: onPricingOpen, onOpenChange: onPricingOpenChange } = useDisclosure()
  const { isOpen: isDetailsOpen, onOpen: onDetailsOpen, onOpenChange: onDetailsOpenChange } = useDisclosure()

  const queryClient = useQueryClient()

  // Mutation for sending quote response
  const sendQuoteMutation = useMutation({
    mutationFn: async (data: { quoteId: string; quotedPrice: number; adminResponse: string }) => {
      const response = await fetch(`/api/admin/quotes/${data.quoteId}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quotedPrice: data.quotedPrice,
          adminResponse: data.adminResponse,
          status: "QUOTED",
        }),
      })
      if (!response.ok) throw new Error("Failed to send quote")
      return response.json()
    },
    onSuccess: () => {
      toast.success("Quote sent successfully!")
      queryClient.invalidateQueries({ queryKey: ["admin-quotes"] })
      onPricingOpenChange()
      setQuotedPrice("")
      setAdminResponse("")
    },
    onError: (error) => {
      toast.error("Failed to send quote")
      console.error(error)
    },
  })

  // Mutation for updating quote status
  const updateStatusMutation = useMutation({
    mutationFn: async (data: { quoteId: string; status: string }) => {
      const response = await fetch(`/api/admin/quotes/${data.quoteId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: data.status }),
      })
      if (!response.ok) throw new Error("Failed to update status")
      return response.json()
    },
    onSuccess: () => {
      toast.success("Status updated successfully!")
      queryClient.invalidateQueries({ queryKey: ["admin-quotes"] })
    },
    onError: (error) => {
      toast.error("Failed to update status")
      console.error(error)
    },
  })

  const hasSearchFilter = Boolean(filterValue)

  const headerColumns = React.useMemo(() => {
    if (visibleColumns === "all") return columns
    return columns.filter((column) => Array.from(visibleColumns).includes(column.uid))
  }, [visibleColumns])

  const filteredItems = React.useMemo(() => {
    let filteredQuotes = [...quotes]

    if (hasSearchFilter) {
      filteredQuotes = filteredQuotes.filter(
        (quote) =>
          quote.id.toLowerCase().includes(filterValue.toLowerCase()) ||
          quote.user?.name?.toLowerCase().includes(filterValue.toLowerCase()) ||
          quote.user?.email?.toLowerCase().includes(filterValue.toLowerCase()),
      )
    }

    return filteredQuotes
  }, [quotes, filterValue])

  const pages = Math.ceil(filteredItems.length / rowsPerPage)

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage
    const end = start + rowsPerPage
    return filteredItems.slice(start, end)
  }, [page, filteredItems, rowsPerPage])

  const sortedItems = React.useMemo(() => {
    return [...items].sort((a: QuoteRequest, b: QuoteRequest) => {
      let first: any
      let second: any

      switch (sortDescriptor.column) {
        case "totalItems":
          first = a.totalItems
          second = b.totalItems
          break
        case "createdAt":
          first = new Date(a.createdAt).getTime()
          second = new Date(b.createdAt).getTime()
          break
        case "quotedPrice":
          first = a.quotedPrice || 0
          second = b.quotedPrice || 0
          break
        default:
          first = a[sortDescriptor.column as keyof QuoteRequest]
          second = b[sortDescriptor.column as keyof QuoteRequest]
      }

      const cmp = first < second ? -1 : first > second ? 1 : 0
      return sortDescriptor.direction === "descending" ? -cmp : cmp
    })
  }, [sortDescriptor, items])

  const handlePriceQuote = (quote: QuoteRequest) => {
    setSelectedQuote(quote)
    setQuotedPrice(quote.quotedPrice?.toString() || "")
    setAdminResponse(quote.adminResponse || "")
    onPricingOpen()
  }

  const handleViewDetails = (quote: QuoteRequest) => {
    setSelectedQuote(quote)
    onDetailsOpen()
  }

  const handleSendQuote = () => {
    if (!selectedQuote || !quotedPrice || !adminResponse) {
      toast.error("Please provide both quoted price and response message")
      return
    }

    sendQuoteMutation.mutate({
      quoteId: selectedQuote.id,
      quotedPrice: Number.parseFloat(quotedPrice),
      adminResponse,
    })
  }

  const renderCell = React.useCallback(
    (quote: QuoteRequest, columnKey: React.Key) => {
      switch (columnKey) {
        case "quoteId":
          return (
            <div className="flex flex-col">
              <p className="text-bold text-sm capitalize">#{quote.id.slice(-8)}</p>
              <p className="text-bold text-tiny capitalize text-default-400">{quote.id}</p>
            </div>
          )
        case "customer":
          return (
            <div className="flex flex-col">
              <p className="text-bold text-sm capitalize">{quote.user?.name || "N/A"}</p>
              <p className="text-bold text-tiny capitalize text-default-400">{quote.user?.email}</p>
            </div>
          )
        case "totalItems":
          return (
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-default-400" />
              <span className="text-bold text-sm">{quote.totalItems}</span>
            </div>
          )
        case "createdAt":
          return (
            <div className="flex flex-col">
              <p className="text-bold text-sm">
                {new Date(quote.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
              <p className="text-bold text-tiny text-default-400">
                {new Date(quote.createdAt).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          )
        case "status":
          return (
            <Chip className="capitalize" color={statusColorMap[quote.status]} size="sm" variant="flat">
              {quote.status.toLowerCase()}
            </Chip>
          )
        case "quotedPrice":
          return quote.quotedPrice ? (
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4 text-success" />
              <span className="text-bold text-sm text-success">{formatCurrency(quote.quotedPrice)}</span>
            </div>
          ) : (
            <span className="text-default-400 text-sm">Not quoted</span>
          )
        case "emailStatus":
          return (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${quote.emailSent ? "bg-success" : "bg-default-300"}`} />
                <span className="text-tiny">Sent</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${quote.emailOpened ? "bg-success" : "bg-default-300"}`} />
                <span className="text-tiny">Opened</span>
              </div>
            </div>
          )
        case "actions":
          return (
            <div className="flex items-center gap-2">
              <Button isIconOnly size="sm" variant="light" onPress={() => handleViewDetails(quote)}>
                <Eye className="h-4 w-4 text-default-400" />
              </Button>
              {quote.status === "PENDING" && (
                <Button isIconOnly size="sm" variant="light" color="primary" onPress={() => handlePriceQuote(quote)}>
                  <DollarSign className="h-4 w-4" />
                </Button>
              )}
              {quote.status === "QUOTED" && (
                <Select
                  placeholder="Update"
                  className="max-w-[120px]"
                  size="sm"
                  onChange={(e) =>
                    updateStatusMutation.mutate({
                      quoteId: quote.id,
                      status: e.target.value,
                    })
                  }
                  isDisabled={updateStatusMutation.isPending}
                  classNames={{
                    trigger: "h-8 min-h-8 p-2",
                    value: "text-xs",
                  }}
                >
                  <SelectItem key="ACCEPTED" value="ACCEPTED" className="text-xs">
                    Accept
                  </SelectItem>
                  <SelectItem key="REJECTED" value="REJECTED" className="text-xs">
                    Reject
                  </SelectItem>
                </Select>
              )}
            </div>
          )
        default: {
          const value = quote[columnKey as keyof QuoteRequest]
          if (
            typeof value === "string" ||
            typeof value === "number" ||
            typeof value === "boolean" ||
            React.isValidElement(value)
          ) {
            return value
          }
          // For objects/arrays/undefined, render as a string or fallback
          if (value === undefined || value === null) return ""
          return JSON.stringify(value)
        }
      }
    },
    [updateStatusMutation.isPending],
  )

  const onNextPage = React.useCallback(() => {
    if (page < pages) {
      setPage(page + 1)
    }
  }, [page, pages])

  const onPreviousPage = React.useCallback(() => {
    if (page > 1) {
      setPage(page - 1)
    }
  }, [page])

  const onRowsPerPageChange = React.useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(e.target.value))
    setPage(1)
  }, [])

  const onSearchChange = React.useCallback((value?: string) => {
    if (value) {
      setFilterValue(value)
      setPage(1)
    } else {
      setFilterValue("")
    }
  }, [])

  const onClear = React.useCallback(() => {
    setFilterValue("")
    setPage(1)
  }, [])

  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <Input
            isClearable
            size="sm"
            className="w-full sm:max-w-[44%]"
            placeholder="Search by quote ID, customer name, or email..."
            startContent={<Search />}
            value={filterValue}
            onClear={() => onClear()}
            onValueChange={onSearchChange}
          />
          <div className="flex gap-3">
            <Dropdown>
              <DropdownTrigger className="z-0 hidden sm:flex">
                <Button endContent={<ChevronDown size={20} />} size="sm" variant="flat">
                  Columns
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                className="max-h-[250px] overflow-y-scroll scrollbar-hide"
                closeOnSelect={false}
                selectedKeys={visibleColumns}
                selectionMode="multiple"
                onSelectionChange={setVisibleColumns}
              >
                {columns.map((column) => (
                  <DropdownItem key={column.uid} className="capitalize">
                    {capitalize(column.name)}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-small text-default-400">Total {quotes.length} quote requests</span>
          <label className="flex items-center text-small text-default-400">
            Rows per page:
            <select className="bg-transparent text-small text-default-400 outline-none" onChange={onRowsPerPageChange}>
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
            </select>
          </label>
        </div>
      </div>
    )
  }, [filterValue, visibleColumns, onSearchChange, onRowsPerPageChange, quotes.length, hasSearchFilter])

  const bottomContent = React.useMemo(() => {
    return (
      <div className="flex items-center justify-between px-2 py-2">
        <Pagination isCompact showControls showShadow color="primary" page={page} total={pages} onChange={setPage} />
        <div className="hidden w-[30%] justify-end gap-2 sm:flex">
          <Button isDisabled={pages === 1} size="sm" variant="flat" onPress={onPreviousPage}>
            Previous
          </Button>
          <Button isDisabled={pages === 1} size="sm" variant="flat" onPress={onNextPage}>
            Next
          </Button>
        </div>
      </div>
    )
  }, [items.length, page, pages, hasSearchFilter])

  return (
    <>
      <Table
        aria-label="Quote requests table"
        isHeaderSticky
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        sortDescriptor={sortDescriptor}
        topContent={topContent}
        topContentPlacement="outside"
        onSortChange={setSortDescriptor}
      >
        <TableHeader columns={headerColumns}>
          {(column) => (
            <TableColumn
              key={column.uid}
              align={column.uid === "actions" ? "center" : "start"}
              allowsSorting={column.sortable}
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody emptyContent={"No quote requests found"} items={sortedItems}>
          {(item) => (
            <TableRow key={item.id}>{(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}</TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pricing Modal */}
      <Modal isOpen={isPricingOpen} onOpenChange={onPricingOpenChange} size="2xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h3>Set Quote Price</h3>
                <p className="text-sm text-default-500">Quote ID: #{selectedQuote?.id.slice(-8)}</p>
              </ModalHeader>
              <ModalBody>
                {selectedQuote && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-default-50 rounded-lg">
                      <User className="h-5 w-5 text-default-400" />
                      <div>
                        <p className="font-semibold">{selectedQuote.user?.name}</p>
                        <p className="text-sm text-default-500">{selectedQuote.user?.email}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 p-4 bg-default-50 rounded-lg">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-primary">{selectedQuote.totalItems}</p>
                        <p className="text-sm text-default-500">Total Items</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-secondary">{selectedQuote.items.length}</p>
                        <p className="text-sm text-default-500">Product Types</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-success">
                          {new Set(selectedQuote.items.map((item) => item.type)).size}
                        </p>
                        <p className="text-sm text-default-500">Categories</p>
                      </div>
                    </div>

                    <Input
                      type="number"
                      label="Quoted Price (₹)"
                      placeholder="Enter quoted price"
                      value={quotedPrice}
                      onValueChange={setQuotedPrice}
                      startContent={<DollarSign className="h-4 w-4 text-default-400" />}
                    />

                    <Textarea
                      label="Response Message"
                      placeholder="Enter your response message to the customer..."
                      value={adminResponse}
                      onValueChange={setAdminResponse}
                      minRows={3}
                    />

                    {selectedQuote.notes && (
                      <div className="p-4 bg-warning-50 border-l-4 border-warning rounded-lg">
                        <h4 className="font-semibold text-warning-800 mb-2">Customer Notes:</h4>
                        <p className="text-warning-700">{selectedQuote.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={handleSendQuote}
                  isLoading={sendQuoteMutation.isPending}
                  isDisabled={!quotedPrice || !adminResponse}
                  startContent={!sendQuoteMutation.isPending && <Send className="h-4 w-4" />}
                >
                  Send Quote
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Details Modal */}
      <Modal isOpen={isDetailsOpen} onOpenChange={onDetailsOpenChange} size="3xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h3>Quote Request Details</h3>
                <p className="text-sm text-default-500">Quote ID: #{selectedQuote?.id.slice(-8)}</p>
              </ModalHeader>
              <ModalBody>
                {selectedQuote && (
                  <div className="space-y-6">
                    {/* Customer Info */}
                    <div className="flex items-center gap-4 p-4 bg-default-50 rounded-lg">
                      <User className="h-6 w-6 text-default-400" />
                      <div className="flex-1">
                        <p className="font-semibold">{selectedQuote.user?.name}</p>
                        <p className="text-sm text-default-500">{selectedQuote.user?.email}</p>
                        {selectedQuote.user?.phone && (
                          <p className="text-sm text-default-500">{selectedQuote.user.phone}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-default-500">Submitted</p>
                        <p className="font-semibold">
                          {new Date(selectedQuote.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Items */}
                    <div>
                      <h4 className="font-semibold mb-3">Requested Items ({selectedQuote.totalItems} total)</h4>
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {selectedQuote.items.map((item, index) => (
                          <div key={index} className="border rounded-lg p-3">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h5 className="font-medium">{item.categoryName}</h5>
                                <p className="text-sm text-default-500">{item.title}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-primary">×{item.quantity}</p>
                                <Chip size="sm" variant="flat" color="secondary">
                                  {item.type}
                                </Chip>
                              </div>
                            </div>
                            {Object.keys(item.specifications).length > 0 && (
                              <div className="mt-2 p-2 bg-default-50 rounded text-xs">
                                <p className="font-medium mb-1">Specifications:</p>
                                {Object.entries(item.specifications)
                                  .filter(([key, value]) => key !== "quantity" && key !== "remarks" && value)
                                  .map(([key, value]) => (
                                    <p key={key}>
                                      <span className="capitalize">{key.replace(/_/g, " ")}:</span>{" "}
                                      {Array.isArray(value) ? value.join(", ") : String(value)}
                                    </p>
                                  ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Customer Notes */}
                    {selectedQuote.notes && (
                      <div className="p-4 bg-warning-50 border-l-4 border-warning rounded-lg">
                        <h4 className="font-semibold text-warning-800 mb-2">Customer Notes:</h4>
                        <p className="text-warning-700">{selectedQuote.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button
                  as={Link}
                  href={`/admin/quotes/${selectedQuote?.id}`}
                  color="primary"
                  startContent={<Eye className="h-4 w-4" />}
                >
                  View Full Details
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}
