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

} from "@nextui-org/react"
import { ChevronDown, Eye, Search } from "lucide-react"
import { capitalize, formateDate } from "@/lib/utils"
import Link from "next/link"
import type { ServiceProps, ServiceStatus } from "@/lib/types/service-types"
import { useUpdateServiceStatus } from "@/api-hooks/services/update-status"

const statusColorMap: Record<string, ChipProps["color"]> = {
  completed: "success",
  pending: "danger",
  processing: "warning",
}

const columns = [
  { name: "SERVICE ID", uid: "id" },
  { name: "USER ID", uid: "userId" },
  { name: "SERVICE TYPE", uid: "serviceType", sortable: true },
  { name: "CREATED DATE", uid: "createdAt", sortable: true },
  { name: "UPDATED DATE", uid: "updatedAt", sortable: true },
  { name: "STATUS", uid: "status", sortable: true },
  { name: "FILE", uid: "file" },
  { name: "ACTIONS", uid: "actions" },
]

const INITIAL_VISIBLE_COLUMNS = ["id", "userId", "serviceType", "status", "createdAt", "file", "actions"]

export default function ServicesTable({ services }: { services?: ServiceProps[] }) {
  const [filterValue, setFilterValue] = React.useState("")
  const [visibleColumns, setVisibleColumns] = React.useState<Selection>(new Set(INITIAL_VISIBLE_COLUMNS))
  const [rowsPerPage, setRowsPerPage] = React.useState(5)
  const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>({
    column: "createdAt",
    direction: "descending",
  })
  const [page, setPage] = React.useState(1)

  const updateStatusMutation = useUpdateServiceStatus()

  const statusOptions: { value: ServiceStatus; label: string }[] = [
    { value: "pending", label: "Requested",   },
  { value: "approved", label: "Review & Approved"  },
  { value: "production", label: "In Production" },
  { value: "testing", label: "Quality Test"  },
  { value: "shipped", label: "Shipped"  },
  { value: "delivered", label: "Delivered"},
  { value: "cancelled", label: "Cancelled" },
  ]

  const hasSearchFilter = Boolean(filterValue)

  const headerColumns = React.useMemo(() => {
    if (visibleColumns === "all") return columns

    return columns.filter((column) => Array.from(visibleColumns).includes(column.uid))
  }, [visibleColumns])

  const filteredItems = React.useMemo(() => {
    let filteredServices = [...(services || [])]

    if (hasSearchFilter) {
      filteredServices = filteredServices.filter(
        (service) =>
          service.id.toLowerCase().includes(filterValue.toLowerCase()) ||
          service.type.toLowerCase().includes(filterValue.toLowerCase()),
      )
    }

    return filteredServices
  }, [services, filterValue])

  const pages = Math.ceil((filteredItems?.length || 0) / rowsPerPage)

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage
    const end = start + rowsPerPage

    return filteredItems?.slice(start, end)
  }, [page, filteredItems, rowsPerPage])

  const sortedItems = React.useMemo(() => {
    return [...(items || [])].sort((a: ServiceProps, b: ServiceProps) => {
      const first = a[sortDescriptor.column as keyof ServiceProps] as string
      const second = b[sortDescriptor.column as keyof ServiceProps] as string
      const cmp = first < second ? -1 : first > second ? 1 : 0

      return sortDescriptor.direction === "descending" ? -cmp : cmp
    })
  }, [sortDescriptor, items])

  const renderCell = React.useCallback((service: ServiceProps, columnKey: React.Key) => {
    switch (columnKey) {
      case "id":
        return <span className="text-xs">{service.id}</span>
      case "userId":
        return <span className="text-xs">{service.userId}</span>
      case "serviceType":
        return (
          <Chip
            className="capitalize"
            color={
              service.type === "batteryPack"
                ? "primary"
                : service.type === "wiringHarness"
                  ? "warning"
                  : service.type.includes("cnc")
                    ? "success"
                    : service.type.includes("laser")
                      ? "danger"
                      : "default"
            }
            size="sm"
            variant="flat"
          >
            {service.type}
          </Chip>
        )
      case "createdAt":
        return formateDate(service.createdAt)
      case "updatedAt":
        return formateDate(service.updatedAt)
      case "status":
        return (
          // <Select
          //   size="sm"
          //   variant="flat"
          //   selectedKeys={[service.status]}
          //   onSelectionChange={(keys) => {
          //     const newStatus = Array.from(keys)[0] as ServiceStatus
          //     if (newStatus !== service.status) {
          //       updateStatusMutation.mutate({
          //         serviceId: service.id,
          //         status: newStatus,
          //       })
          //     }
          //   }}
          //   className="min-w-[120px]"
          // >
          //   {statusOptions.map((option) => (
          //     <SelectItem key={option.value} value={option.value}>
          //       <Chip
          //         size="sm"
          //         variant="flat"
          //         color={
          //           option.value === "completed"
          //             ? "success"
          //             : option.value === "processing"
          //               ? "warning"
          //               : option.value === "cancelled" || option.value === "cancel_requested"
          //                 ? "danger"
          //                 : "default"
          //         }
          //       >
          //         {option.label}
          //       </Chip>
          //     </SelectItem>
          //   ))}
          // </Select>
          
                          <Chip
                          className=" capitalize"
                                  size="sm"
                                  variant="flat"
                                  color={service.status === "delivered"
                                    ? "success"
                                    : service.status === "pending"
                                      ? "warning"
                                      : service.status === "cancelled" || service.status === "cancel_requested"
                                        ? "danger"
                                        : "primary"
                                  }
                                >
                                  {service.status}
                                </Chip>
        )
      case "file":
        return service.fileUrl ? (
          <a
            href={service.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline text-xs"
          >
            {service.fileName || "View File"}
          </a>
        ) : (
          <span className="text-gray-400 text-xs">No file</span>
        )
      case "actions":
        return (
          <div className="flex items-center justify-center">
            <Button
              isIconOnly
              size="sm"
              variant="light"
              as={Link}
              radius="full"
              href={`/dashboard/services/${service.id}`}
            >
              <Eye className="text-zinc-500" />
            </Button>
          </div>
        )
      default:
        return String(service[columnKey as keyof ServiceProps] || "")
    }
  }, [])

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
            placeholder="Search by service id or type..."
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
          <span className="text-small text-default-400">Total {services?.length || 0} services</span>
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
  }, [filterValue, visibleColumns, onSearchChange, onRowsPerPageChange, services?.length, hasSearchFilter])

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
  }, [items?.length, page, pages, hasSearchFilter])

  return (
    <Table
      aria-label="Services table"
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
      <TableBody emptyContent={"No Services found"} items={sortedItems || []}>
        {(item) => (
          <TableRow key={item.id}>{(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}</TableRow>
        )}
      </TableBody>
    </Table>
  )
}
