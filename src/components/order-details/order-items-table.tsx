"use client"

import React from "react"
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, User } from "@nextui-org/react"
import { formatCurrency } from "@/lib/utils"
import type { OrderItemProps } from "@/lib/types/types"

const columns = [
  { name: "PRODUCT ", uid: "product-details" },
  { name: "DETAILS", uid: "color" },
  { name: "PRICE", uid: "price" },
  { name: "QUANTITY", uid: "quantity" },
  { name: "TOTAL", uid: "total" },
]

export default function OrderItemsTable({ data }: { data: OrderItemProps[] }) {
  const renderCell = React.useCallback((order: OrderItemProps, columnKey: React.Key): React.ReactNode => {
    const cellValue = order[columnKey as keyof OrderItemProps]

    switch (columnKey) {
      case "product-details":
        return (
          <User
            avatarProps={{
              size: "lg",
              radius: "none",
              showFallback: true,
              src: order.customProduct
                ? (order.customProduct as { image?: string })?.image || "/placeholder.svg"
                : process.env.NEXT_PUBLIC_IMAGE_URL + order.Image,
            }}
            description={order.customProduct ? "Custom Product" : `Color: ${order.color}`}
            name={
              order.customProduct ? (order.customProduct as { title?: string })?.title || "Custom Product" : order.title
            }
          />
        )
      case "color":
        return order.color || order.customProduct && order.customProduct?.options && (
          <div className="mt-1">
            {Object.entries(order.customProduct.options).map(([key, value]) => {
              // Skip non-display fields
              if (["quantity","totalPrice", "fastenerType", "image","title"].includes(key)) {
                return null
              }
              
              return (
               value && <p key={key} className="text-xs ">
                  {key.charAt(0).toUpperCase() + key.slice(1)}: {value as string}
                </p>
              )
            })}
          </div>
        )
      case "price":
        return <h1 className="font-Roboto">{formatCurrency(order.offerPrice / order.quantity)}</h1>
      case "total":
        return <h1 className="font-Roboto">{formatCurrency(order.offerPrice)}</h1>
      default:
        return cellValue as React.ReactNode
    }
  }, [])

  return (
    <Table
      aria-label="Product details"
      classNames={{
        wrapper: "px-0 shadow-none",
      }}
    >
      <TableHeader columns={columns}>
        {(column) => (
          <TableColumn key={column.uid} className={column.uid === "total" ? "text-right" : "text-left"}>
            {column.name}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody items={data}>
        {(item) => (
          <TableRow key={item.id}>
            {(columnKey) => <TableCell className="last:text-right">{renderCell(item, columnKey)}</TableCell>}
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
