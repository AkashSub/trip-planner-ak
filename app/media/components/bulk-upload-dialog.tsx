import React, { useCallback, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ImagePlus, X, Upload } from "lucide-react"

interface BulkUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpload: (files: File[], tags: string[]) => void
}

export function BulkUploadDialog({ open, onOpenChange, onUpload }: BulkUploadDialogProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [isDragging, setIsDragging] = useState(false)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files)
      const mediaFiles = files.filter(file => 
        file.type.startsWith('image/') || file.type.startsWith('video/')
      )
      setSelectedFiles(prevFiles => [...prevFiles, ...mediaFiles])
    }
  }

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    setIsDragging(false)

    const files = Array.from(event.dataTransfer.files)
    const mediaFiles = files.filter(file => 
      file.type.startsWith('image/') || file.type.startsWith('video/')
    )
    setSelectedFiles(prevFiles => [...prevFiles, ...mediaFiles])
  }, [])

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    setIsDragging(false)
  }, [])

  const handleTagAdd = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && tagInput.trim()) {
      setTags(prevTags => [...new Set([...prevTags, tagInput.trim()])])
      setTagInput('')
    }
  }

  const removeFile = (index: number) => {
    setSelectedFiles(files => files.filter((_, i) => i !== index))
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags => tags.filter(tag => tag !== tagToRemove))
  }

  const handleUpload = () => {
    onUpload(selectedFiles, tags)
    setSelectedFiles([])
    setTags([])
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Upload Media</DialogTitle>
        </DialogHeader>

        <div
          className={`mt-4 p-8 border-2 border-dashed rounded-lg text-center ${
            isDragging ? 'border-primary bg-primary/10' : 'border-muted'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <ImagePlus className="mx-auto h-12 w-12 text-muted-foreground" />
          <div className="mt-4">
            <Button 
              variant="secondary" 
              className="mr-2"
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              Choose Files
            </Button>
            <input
              id="file-upload"
              type="file"
              multiple
              accept="image/*,video/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <span className="text-sm text-muted-foreground">
              or drag and drop files here
            </span>
          </div>
        </div>

        {selectedFiles.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">Selected Files ({selectedFiles.length})</h4>
            <div className="max-h-32 overflow-y-auto space-y-2">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                  <span className="text-sm truncate max-w-[80%]">{file.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4">
          <label className="text-sm font-medium">
            Add Tags
            <input
              type="text"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={handleTagAdd}
              className="mt-1 w-full rounded-md border border-input px-3 py-2 text-sm"
              placeholder="Type tag and press Enter"
            />
          </label>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map(tag => (
                <Badge key={tag} variant="secondary" className="px-2 py-1">
                  {tag}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-1 h-4 w-4 p-0"
                    onClick={() => removeTag(tag)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={selectedFiles.length === 0}
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload {selectedFiles.length} files
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}