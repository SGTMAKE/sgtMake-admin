"use client"
import { formateDate } from "@/lib/utils"
import { FileViewer } from "@/components/dashboard/services/file-viewer"
import { ArrowLeft, Mail, Phone, User, Edit2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Button, Chip } from "@nextui-org/react"
import UpdateServiceStatus from "@/components/dialog/services/update-service-status"
import { useState } from "react"
import { useService } from "@/api-hooks/services/get-service"
import { useDownloadServiceFile } from "@/api-hooks/services/download-service-file"

interface ServiceDetailClientProps {
  id: string
}

export default function ServiceDetailClient({ id }: ServiceDetailClientProps) {
  const { data, isLoading, error } = useService(id)
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const downloadMutation = useDownloadServiceFile()

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading service details...</div>
        </div>
      </div>
    )
  }

  if (error || !data?.service) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-500">Error loading service details</div>
        </div>
      </div>
    )
  }

  const service = data.service

  // Helper function to render form details based on service type
  const renderFormDetails = () => {
    const { type } = service

    if (type === "batteryPack") {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DetailItem label="Chemistry" value={service.formDetails.chemistry} />
          <DetailItem label="Cell Brand" value={service.formDetails.cellBrand} />
          <DetailItem label="Series Config" value={service.formDetails.seriesConfig} />
          <DetailItem label="Parallel Config" value={service.formDetails.parallelConfig} />
          <DetailItem label="Normal Discharge" value={service.formDetails.normalDischarge} />
          <DetailItem label="Peak Discharge" value={service.formDetails.peakDischarge} />
          <DetailItem label="Charging" value={service.formDetails.charging} />
          <DetailItem label="Life Cycle" value={service.formDetails.lifeCycle} />
          <DetailItem label="Pack Voltage" value={service.formDetails.packVoltage} />
          <DetailItem label="BMS Choice" value={service.formDetails.bmsChoice} />
          <DetailItem label="Modulus Count" value={service.formDetails.modulusCount} />
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-sm font-medium text-gray-500">Dimensions</h3>
            <div className="grid grid-cols-3 gap-2 mt-1">
              <p className="text-sm">H: {service.formDetails.dimensions?.H}</p>
              <p className="text-sm">W: {service.formDetails.dimensions?.W}</p>
              <p className="text-sm">L: {service.formDetails.dimensions?.L}</p>
            </div>
          </div>
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-sm font-medium text-gray-500">Additional Info</h3>
            <p className="text-sm mt-1">{service.formDetails.additionalInfo || "N/A"}</p>
          </div>
        </div>
      )
    } else if (type === "wiringHarness") {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DetailItem label="Quantity" value={service.formDetails.quantity} />
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-sm font-medium text-gray-500">Description</h3>
            <p className="text-sm mt-1">{service.formDetails.description || "N/A"}</p>
          </div>
        </div>
      )
    } else if (type.includes("cnc") || type.includes("laser") || type.includes("3d-printing")) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DetailItem label="Service Type" value={service.type} />
          <DetailItem label="Material" value={service.formDetails.material} />
          <DetailItem label="Surface Finish" value={service.formDetails.surfaceFinish ? "Yes" : "No"} />
          <DetailItem label="Quantity" value={service.formDetails.quantity} />

          {service.type === "3d-printing" && (
            <>
              <DetailItem label="PrintType" value={service.formDetails.printType} />
            </>
          )}

          <div className="col-span-1 md:col-span-2">
            <h3 className="text-sm font-medium text-gray-500">Remarks</h3>
            <p className="text-sm mt-1">{service.formDetails.remarks || "N/A"}</p>
          </div>
        </div>
      )
    }

    return (
      <div className="text-sm">
        <pre className="bg-gray-100 p-4 rounded-md overflow-auto">{JSON.stringify(service.formDetails, null, 2)}</pre>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/dashboard/services" className="flex items-center text-primary hover:underline">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Services
        </Link>
      </div>

      <div className="rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Service Details</h1>
          <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">{service.type}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
            <div className="space-y-3">
              <DetailItem label="Service ID" value={service.id} />
              <DetailItem label="User ID" value={service.userId} />
              <DetailItem label="Created At" value={formateDate(service.createdAt)} />
              <DetailItem label="Updated At" value={formateDate(service.updatedAt)} />
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Status</h3>
                  <Chip
                    className="capitalize mt-1"
                    color={
                      service.status === "delivered"
                        ? "success"
                        : service.status === "pending"
                          ? "warning"
                          : service.status === "cancelled" || service.status === "cancel_requested"
                            ? "danger"
                            : "primary"
                    }
                    size="sm"
                    variant="flat"
                  >
                    {service.status?.replace("_", " ") || "pending"}
                  </Chip>
                </div>
                <Button
                  size="sm"
                  variant="flat"
                  startContent={<Edit2 size={16} />}
                  onPress={() => setIsStatusModalOpen(true)}
                >
                  Update Status
                </Button>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">File Information</h2>
            <div className="space-y-3">
              <DetailItem label="File Type" value={service.fileType || "N/A"} />
              {service.fileUrl ? (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">File</h3>
                  <div className="flex gap-2">
                    <FileViewer mimetype={service.fileType} fileUrl={service.fileUrl} />
                    <Button
                      size="sm"
                      variant="flat"
                      color="primary"
                      isLoading={downloadMutation.isPending}
                      onPress={() => downloadMutation.mutate(service.id)}
                    >
                      {downloadMutation.isPending ? "Preparing..." : "Download File"}
                    </Button>
                  </div>
                </div>
              ) : (
                <DetailItem label="File" value="No file uploaded" />
              )}
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Customer Information</h2>
          <div className="p-4 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 relative rounded-full overflow-hidden flex items-center justify-center">
                {service.user?.image ? (
                  <Image
                    src={service.user.image || "/placeholder.svg"}
                    alt={service.user?.name || "User"}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <User className="h-8 w-8 text-gray-400" />
                )}
              </div>
              <div>
                <h3 className="font-medium text-lg">{service.user?.name || "Unknown User"}</h3>
                <div className="flex flex-col mt-1 text-sm text-gray-600">
                  {service.user?.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <a href={`mailto:${service.user.email}`} className="hover:underline">
                        {service.user.email}
                      </a>
                    </div>
                  )}
                  {service.user?.phone && (
                    <div className="flex items-center gap-2 mt-1">
                      <Phone className="h-4 w-4" />
                      <a href={`tel:${service.user.phone}`} className="hover:underline">
                        {service.user.phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Form Details</h2>
          {renderFormDetails()}
        </div>
      </div>

      {service && (
        <UpdateServiceStatus isOpen={isStatusModalOpen} onClose={() => setIsStatusModalOpen(false)} service={service} />
      )}
    </div>
  )
}

// Helper component for displaying detail items
function DetailItem({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <h3 className="text-sm font-medium text-gray-500">{label}</h3>
      <p className="text-sm mt-1">{value?.toString() || "N/A"}</p>
    </div>
  )
}
