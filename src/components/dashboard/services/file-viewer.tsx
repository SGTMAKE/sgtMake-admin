"use client"

import { Button, Modal, ModalBody, ModalContent, ModalHeader, useDisclosure } from "@nextui-org/react"
interface FileViewerProps {
  mimetype: string | undefined
  fileUrl: string | undefined
}

export function FileViewer({ mimetype, fileUrl}: FileViewerProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  

  const viewer = () => {
    if (!mimetype || !fileUrl) return null

    if (mimetype.includes("application/octet-stream")) {
      return (
        <iframe
          src={`https://sharecad.org/cadframe/load?url=${encodeURIComponent(fileUrl)}`}
          width="100%"
          height="800"
          frameBorder="0"
        />
      )
    }
    else{
      const ext = fileUrl.split('.').pop()?.toLowerCase();

  if (!ext) return <p>Invalid file URL</p>;

  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
    return <img src={fileUrl} alt="Preview" className="w-full max-h-[600px] object-contain" />;
  }

  if (['mp4', 'webm', 'ogg'].includes(ext)) {
    return (
      <video src={fileUrl} controls className="w-full max-h-[600px]">
        Your browser does not support the video tag.
      </video>
    );
  }

  if (ext === 'pdf' || ext === 'docx' || ext === 'doc' ||ext==='csv') {
    
    return (
      <iframe
      src={`https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(fileUrl)}`}
      width="100%"
      height="800"
      frameBorder="0"
    />
    );
  }

  if (['xls', 'xlsx'].includes(ext)) {
    return (
      <iframe
        src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`}
        className="w-full h-[800px]"
        frameBorder={0}
      />
    );
  }

  return <p className="text-red-500">Unsupported file type: .{ext}</p>;
    }
  }

  return (
    <>
      <Button onPress={onOpen} color="primary" size="sm">
        File Preview
      </Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="center" size="5xl" scrollBehavior="inside">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">File Viewer</ModalHeader>
              <ModalBody className="mb-5">
                {fileUrl && mimetype ? viewer() : <div className="text-center py-8">No file available to preview</div>}
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}
