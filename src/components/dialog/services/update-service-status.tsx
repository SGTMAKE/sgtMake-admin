"use client"

import React from "react"
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Select, SelectItem } from "@nextui-org/react"
import { useUpdateServiceStatus } from "@/api-hooks/services/update-status"
import type { ServiceProps, ServiceStatus } from "@/lib/types/service-types"

interface UpdateServiceStatusProps {
  isOpen: boolean
  onClose: () => void
  service: ServiceProps
}

const statusOptions: { value: ServiceStatus; label: string; color: string }[] = [
  // { value: "pending", label: "Pending", color: "warning" },
  // { value: "processing", label: "Processing", color: "primary" },
  // { value: "completed", label: "Completed", color: "success" },
  // { value: "cancel_requested", label: "Cancel Requested", color: "warning" },
  { value: "pending", label: "Requested", color: "warning"  },
  { value: "approved", label: "Review & Approved", color: "warning" },
  { value: "production", label: "In Production", color: "primary" },
  { value: "testing", label: "Quality Test", color: "primary" },
  { value: "shipped", label: "Shipped", color: "success" },
  { value: "delivered", label: "Delivered", color: "success"},
  { value: "cancelled", label: "Cancelled", color: "danger" },
]

export default function UpdateServiceStatus({ isOpen, onClose, service }: UpdateServiceStatusProps) {
  const [selectedStatus, setSelectedStatus] = React.useState<ServiceStatus>(service.status)
  const updateStatusMutation = useUpdateServiceStatus()

  const handleUpdateStatus = async () => {
    if (selectedStatus === service.status) {
      onClose()
      return
    }

    try {
      await updateStatusMutation.mutateAsync({
        id: service.id,
        status: selectedStatus,
      })
      onClose()
    } catch (error) {
      console.error("Failed to update status:", error)
    }
  }

  const handleClose = () => {
    setSelectedStatus(service.status)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h3 className="text-lg font-semibold">Update Service Status</h3>
          <p className="text-sm text-gray-500">Service ID: {service.id.slice(-8)}</p>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">
                Current Status: <span className="font-medium capitalize">{service.status.replace("_", " ")}</span>
              </p>
            </div>
            <Select
              label="New Status"
              placeholder="Select new status"
              selectedKeys={[selectedStatus]}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as ServiceStatus
                setSelectedStatus(selected)
              }}
            >
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </Select>
            <div className="text-xs text-gray-500">
              <p>• An email notification will be sent to the customer</p>
              <p>• Status changes are tracked and logged</p>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={handleClose}>
            Cancel
          </Button>
          <Button
            color="primary"
            onPress={handleUpdateStatus}
            isLoading={updateStatusMutation.isPending}
            isDisabled={selectedStatus === service.status}
          >
            Update Status
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
