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
} from "@nextui-org/react"
import { ChevronDown, Search, Filter } from "lucide-react"
import { capitalize } from "@/lib/utils"
import type { Category } from "@/lib/types/types"
import { useCategories } from "@/api-hooks/categories/get-categories"
import DeleteCategory from "../dialog/category/delete-category"
import EditCategory from "../dialog/category/edit-category"

const categoryTypeColorMap: Record<string, ChipProps["color"]> = {
  parent: "primary",
  subcategory: "secondary",
}

const columns = [
  { name: "ID", uid: "id", sortable: true },
  { name: "CATEGORY", uid: "name", sortable: true },
  { name: "TYPE", uid: "type" },
  { name: "DESCRIPTION", uid: "description" },
  { name: "PRODUCTS", uid: "_count", sortable: true },
  { name: "ACTIONS", uid: "actions" },
]

const INITIAL_VISIBLE_COLUMNS = ["id", "name", "type", "parentId", "description", "_count", "actions"]

// Filter options
const categoryTypeOptions = [
  { key: "all", label: "All Categories" },
  { key: "parent", label: "Parent Categories" },
  { key: "subcategory", label: "Subcategories" },
]

const productCountOptions = [
  { key: "all", label: "All" },
  { key: "with_products", label: "With Products" },
  { key: "without_products", label: "Without Products" },
]

export default function CategoriesTable() {
  const { data: categories } = useCategories()

  const [filterValue, setFilterValue] = React.useState("")
  const [categoryTypeFilter, setCategoryTypeFilter] = React.useState("all")
  const [productCountFilter, setProductCountFilter] = React.useState("all")
  const [visibleColumns, setVisibleColumns] = React.useState<Selection>(new Set(INITIAL_VISIBLE_COLUMNS))
  const [rowsPerPage, setRowsPerPage] = React.useState(10)
  const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>({
    column: "name",
    direction: "ascending",
  })
  const [page, setPage] = React.useState(1)

  const hasSearchFilter = Boolean(filterValue)

  const headerColumns = React.useMemo(() => {
    if (visibleColumns === "all") return columns

    return columns.filter((column) => Array.from(visibleColumns).includes(column.uid))
  }, [visibleColumns])

  const filteredItems = React.useMemo(() => {
    let filteredCategories = [...(categories || [])]

    // Search filter
    if (hasSearchFilter) {
      filteredCategories = filteredCategories.filter(
        (category) =>
          category.name.toLowerCase().includes(filterValue.toLowerCase()) ||
          category.description?.toLowerCase().includes(filterValue.toLowerCase()),
      )
    }

    // Category type filter
    if (categoryTypeFilter !== "all") {
      if (categoryTypeFilter === "parent") {
        filteredCategories = filteredCategories.filter((category) => category.parentId === null)
      } else if (categoryTypeFilter === "subcategory") {
        filteredCategories = filteredCategories.filter((category) => category.parentId !== null)
      }
    }

    // Product count filter
    if (productCountFilter !== "all") {
      if (productCountFilter === "with_products") {
        filteredCategories = filteredCategories.filter((category) => category._count?category._count > 0:0)
      } else if (productCountFilter === "without_products") {
        filteredCategories = filteredCategories.filter((category) => category._count === 0)
      }
    }

    return filteredCategories
  }, [categories, filterValue, categoryTypeFilter, productCountFilter, hasSearchFilter])

  const pages = Math.ceil(filteredItems.length / rowsPerPage)

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage
    const end = start + rowsPerPage

    return filteredItems.slice(start, end)
  }, [page, filteredItems, rowsPerPage])

  const sortedItems = React.useMemo(() => {
    return [...items].sort((a: Category, b: Category) => {
      let first = a[sortDescriptor.column as keyof Category] as any
      let second = b[sortDescriptor.column as keyof Category] as any

      // Handle null values for parentId
      if (sortDescriptor.column === "parentId") {
        first = first === null ? -1 : first
        second = second === null ? -1 : second
      }

      // Handle string comparison for name and description
      if (typeof first === "string" && typeof second === "string") {
        first = first.toLowerCase()
        second = second.toLowerCase()
      }

      const cmp = first < second ? -1 : first > second ? 1 : 0

      return sortDescriptor.direction === "descending" ? -cmp : cmp
    })
  }, [sortDescriptor, items])

  const renderCell = React.useCallback(
    (category: Category, columnKey: React.Key) => {
      const cellValue = category[columnKey as keyof Category]

      switch (columnKey) {
        case "type":
          const isParent = category.parentId === null
          return (
            <Chip
              className="capitalize"
              color={categoryTypeColorMap[isParent ? "parent" : "subcategory"]}
              size="sm"
              variant="flat"
            >
              {isParent ? "Parent" : "Subcategory"}
            </Chip>
          )
        case "parentId":
          return cellValue === null ? (
            <span className="text-gray-400 italic">None</span>
          ) : (
            <span className="font-mono text-sm">{cellValue}</span>
          )
        case "_count":
          return (
            <div className="flex justify-center">
              <Chip
                size="sm"
                variant={cellValue === 0 ? "flat" : "solid"}
                color={cellValue === 0 ? "default" : "success"}
              >
                {cellValue}
              </Chip>
            </div>
          )
        case "description":
          return cellValue === "" || !cellValue ? (
            <span className="text-gray-400 italic">No description</span>
          ) : (
            <p className="line-clamp-2 max-w-xs" >
              {cellValue}
            </p>
          )
        case "name":
          return (
            <div className="flex flex-col">
              <p className="font-medium">{cellValue}</p>
              {category.parentId && (
                <p className="text-xs text-gray-500">
                  Parent: {categories?.find((c) => c.id === category.parentId)?.name || "Unknown"}
                </p>
              )}
            </div>
          )
        case "actions":
          return (
            <div className="relative flex items-center gap-2 justify-center">
              <EditCategory category={category} />
              <DeleteCategory id={category.id} />
            </div>
          )
        default:
          return cellValue
      }
    },
    [categories],
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

  const onCategoryTypeFilterChange = React.useCallback((value: string) => {
    setCategoryTypeFilter(value)
    setPage(1)
  }, [])

  const onProductCountFilterChange = React.useCallback((value: string) => {
    setProductCountFilter(value)
    setPage(1)
  }, [])

  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <Input
            isClearable
            size="sm"
            className="w-full sm:max-w-[44%]"
            placeholder="Search by category name or description..."
            startContent={<Search />}
            value={filterValue}
            onClear={() => onClear()}
            onValueChange={onSearchChange}
          />
          <div className="flex gap-3 w-full sm:w-auto">
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

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Select
            size="sm"
            placeholder="Category Type"
            className="max-w-xs"
            selectedKeys={[categoryTypeFilter]}
            onChange={(e) => onCategoryTypeFilterChange(e.target.value)}
            startContent={<Filter size={16} />}
          >
            {categoryTypeOptions.map((option) => (
              <SelectItem key={option.key} value={option.key}>
                {option.label}
              </SelectItem>
            ))}
          </Select>

          <Select
            size="sm"
            placeholder="Product Count"
            className="max-w-xs"
            selectedKeys={[productCountFilter]}
            onChange={(e) => onProductCountFilterChange(e.target.value)}
            startContent={<Filter size={16} />}
          >
            {productCountOptions.map((option) => (
              <SelectItem key={option.key} value={option.key}>
                {option.label}
              </SelectItem>
            ))}
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-small text-default-400">
            Total {filteredItems.length} categories
            {filteredItems.length !== (categories?.length || 0) && (
              <span className="text-primary"> (filtered from {categories?.length || 0})</span>
            )}
          </span>
          <label className="flex items-center text-small text-default-400">
            Rows per page:
            <select
              className="bg-transparent text-small text-default-400 outline-none ml-2"
              onChange={onRowsPerPageChange}
              value={rowsPerPage}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
              <option value="20">20</option>
            </select>
          </label>
        </div>
      </div>
    )
  }, [
    filterValue,
    visibleColumns,
    categoryTypeFilter,
    productCountFilter,
    onSearchChange,
    onRowsPerPageChange,
    filteredItems.length,
    categories?.length,
    hasSearchFilter,
    rowsPerPage,
  ])

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
  }, [page, pages, onPreviousPage, onNextPage])

  return (
    <Table
      aria-label="Categories table with filtering"
      isHeaderSticky
      bottomContent={bottomContent}
      bottomContentPlacement="outside"
      sortDescriptor={sortDescriptor}
      topContent={topContent}
      topContentPlacement="outside"
      onSortChange={setSortDescriptor}
      classNames={{
        wrapper: "",
      }}
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
      <TableBody emptyContent={"No categories found"} items={sortedItems || []}>
        {(item) => (
          <TableRow key={item.id}>{(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}</TableRow>
        )}
      </TableBody>
    </Table>
  )
}
