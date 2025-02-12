import React, { useState } from 'react'
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Download, ChevronLeft, ChevronRight, X, Check } from "lucide-react"
import type { MediaItem } from '../types'
import JSZip from 'jszip'

interface MediaGalleryProps {
  items: MediaItem[]
}

export function MediaGallery({ items }: MediaGalleryProps) {
  const [selectedItem, setSelectedItem] = useState<number | null>(null)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  const handleNext = () => {
    if (selectedItem !== null && selectedItem < items.length - 1) {
      setSelectedItem(selectedItem + 1)
    }
  }

  const handlePrev = () => {
    if (selectedItem !== null && selectedItem > 0) {
      setSelectedItem(selectedItem - 1)
    }
  }

  const handleDownload = async () => {
    const itemsToDownload = isSelectionMode ? 
      items.filter(item => selectedItems.includes(item.id)) :
      [items[selectedItem!]]
    
    if (itemsToDownload.length === 1) {
      const item = itemsToDownload[0]
      const link = document.createElement('a')
      link.href = item.url
      link.download = item.title
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else {
      setIsDownloading(true)
      try {
        const zip = new JSZip()
        
        for (const item of itemsToDownload) {
          const response = await fetch(item.url)
          const blob = await response.blob()
          zip.file(item.title, blob)
        }
        
        const content = await zip.generateAsync({ type: "blob" })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(content)
        link.download = "media-download.zip"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } catch (error) {
        console.error('Download error:', error)
      } finally {
        setIsDownloading(false)
      }
    }
  }

  const toggleSelection = (id: string) => {
    setSelectedItems(prevSelected => 
      prevSelected.includes(id)
        ? prevSelected.filter(itemId => itemId !== id)
        : [...prevSelected, id]
    )
  }

  return (
    <div className="relative">
      <div className="flex justify-end mb-4 gap-2">
        <Button
          variant="outline"
          onClick={() => {
            setIsSelectionMode(!isSelectionMode)
            setSelectedItems([])
          }}
        >
          {isSelectionMode ? 'Cancel Selection' : 'Select Items'}
        </Button>
        {selectedItems.length > 0 && (
          <Button 
            onClick={handleDownload}
            disabled={isDownloading}
          >
            <Download className="mr-2 h-4 w-4" />
            {isDownloading ? 'Preparing...' : `Download Selected (${selectedItems.length})`}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((item, index) => (
          <div key={item.id} className="relative group">
            {isSelectionMode && (
              <div 
                className={`absolute top-2 left-2 z-10 w-6 h-6 rounded-full cursor-pointer border-2 
                  ${selectedItems.includes(item.id) 
                    ? 'bg-blue-500 border-blue-500' 
                    : 'bg-white/80 border-gray-400'}`}
                onClick={(e) => {
                  e.stopPropagation()
                  toggleSelection(item.id)
                }}
              >
                {selectedItems.includes(item.id) && (
                  <Check className="h-full w-full p-1 text-white" />
                )}
              </div>
            )}
            <div
              className="aspect-square cursor-pointer overflow-hidden rounded-lg relative"
              onClick={() => {
                if (isSelectionMode) {
                  toggleSelection(item.id)
                } else {
                  setSelectedItem(index)
                }
              }}
            >
              {item.type === 'photo' ? (
                <>
                  <img
                    src={item.url}
                    alt={item.title}
                    className="object-cover w-full h-full hover:scale-105 transition-transform"
                  />
                  {selectedItems.includes(item.id) && (
                    <div className="absolute inset-0 bg-black/40" />
                  )}
                </>
              ) : (
                <>
                  <video
                    src={item.url}
                    className="object-cover w-full h-full"
                  />
                  {selectedItems.includes(item.id) && (
                    <div className="absolute inset-0 bg-black/40" />
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={selectedItem !== null} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-[90vw] h-[90vh] p-0">
          <div className="relative w-full h-full flex items-center justify-center bg-black/95">
            <Button
              variant="ghost"
              className="absolute top-4 right-4 text-white z-50"
              onClick={() => setSelectedItem(null)}
            >
              <X className="h-6 w-6" />
            </Button>
            
            {selectedItem !== null && (
              <div className="relative w-full h-full flex items-center justify-center">
                {items[selectedItem].type === 'photo' ? (
                  <img
                    src={items[selectedItem].url}
                    alt={items[selectedItem].title}
                    className="max-h-[80vh] max-w-[80vw] object-contain"
                  />
                ) : (
                  <video
                    src={items[selectedItem].url}
                    controls
                    className="max-h-[80vh] max-w-[80vw]"
                  />
                )}
                <Button
                  variant="secondary"
                  className="absolute bottom-4 right-4"
                  onClick={() => handleDownload()}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            )}

            <Button
              variant="ghost"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white"
              onClick={handlePrev}
              disabled={selectedItem === 0}
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>

            <Button
              variant="ghost"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white"
              onClick={handleNext}
              disabled={selectedItem === items.length - 1}
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}