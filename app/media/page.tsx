"use client"

import React, { useState, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImagePlus, Video } from "lucide-react"
import type { MediaItem, FilterOptions } from "./types"
import { MediaFilters } from "./components/media-filters"
import { BulkUploadDialog } from "./components/bulk-upload-dialog"
import { MediaGallery } from "./components/media-gallery"

const currentUser = "John Doe" // This would come from authentication

export default function MediaPage() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [filters, setFilters] = useState<FilterOptions>({
    uploader: null,
    tags: [],
    personTags: [],
  })

  const handleBulkUpload = useCallback((files: File[], tags: string[]) => {
    const newItems: MediaItem[] = files.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      type: file.type.startsWith("image/") ? "photo" : "video",
      url: URL.createObjectURL(file),
      thumbnail: file.type.startsWith("image/") 
        ? URL.createObjectURL(file) 
        : "/api/placeholder/400/320",
      title: file.name,
      tags: tags,
      uploadedAt: new Date(),
      uploadedBy: currentUser,
    }))

    setMediaItems((prev) => [...prev, ...newItems])
  }, [])

  const filterItems = useCallback(
    (items: MediaItem[]) => {
      return items.filter((item) => {
        if (filters.uploader && item.uploadedBy !== filters.uploader) return false
        if (filters.tags.length > 0 && !filters.tags.every((tag) => item.tags.includes(tag)))
          return false
        if (filters.personTags.length > 0 && !filters.personTags.some((person) => item.tags.includes(person)))
          return false
        return true
      })
    },
    [filters]
  )

  const availableTags = Array.from(new Set(mediaItems.flatMap((item) => item.tags)))
  const availableUploaders = Array.from(new Set(mediaItems.map((item) => item.uploadedBy)))
  const availablePersonTags = ["Me", "John", "Alice", "Bob"] // This would be dynamic in a real app

  const filteredItems = filterItems(mediaItems)
  const photos = filteredItems.filter((item) => item.type === "photo")
  const videos = filteredItems.filter((item) => item.type === "video")

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-4xl font-bold">Media Gallery</h1>
        <div className="w-full sm:w-auto flex flex-wrap gap-2">
          <MediaFilters
            filters={filters}
            onFilterChange={setFilters}
            availableTags={availableTags}
            availableUploaders={availableUploaders}
            availablePersonTags={availablePersonTags}
          />
          <Button onClick={() => setIsUploadDialogOpen(true)}>
            <ImagePlus className="mr-2 h-4 w-4" />
            Upload Media
          </Button>
        </div>
      </div>

      <Tabs defaultValue="photos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="photos">Photos ({photos.length})</TabsTrigger>
          <TabsTrigger value="videos">Videos ({videos.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="photos" className="space-y-4">
          {photos.length > 0 ? (
            <MediaGallery items={photos} />
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <ImagePlus className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No photos uploaded yet</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="videos" className="space-y-4">
          {videos.length > 0 ? (
            <MediaGallery items={videos} />
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Video className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No videos uploaded yet</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <BulkUploadDialog 
        open={isUploadDialogOpen} 
        onOpenChange={setIsUploadDialogOpen} 
        onUpload={handleBulkUpload} 
      />
    </div>
  )
}