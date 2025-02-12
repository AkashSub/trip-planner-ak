import { useState, useEffect } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, X, Download } from "lucide-react"
import type { MediaItem } from "../types"

interface SlideshowProps {
  items: MediaItem[]
  initialIndex: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function Slideshow({ items, initialIndex, open, onOpenChange }: SlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  useEffect(() => {
    setCurrentIndex(initialIndex)
  }, [initialIndex])

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0))
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowLeft") handlePrevious()
    if (e.key === "ArrowRight") handleNext()
  }

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const currentItem = items[currentIndex]

  if (!currentItem) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl w-full h-[90vh] p-0">
        <div className="relative h-full flex items-center justify-center bg-black">
          {currentItem.type === "photo" ? (
            <img
              src={currentItem.url || "/placeholder.svg"}
              alt={currentItem.title}
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <video src={currentItem.url} controls className="max-h-full max-w-full" />
          )}

          <div className="absolute top-4 right-4 flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-white"
              onClick={() => {
                const link = document.createElement("a")
                link.href = currentItem.url
                link.download = currentItem.title
                link.click()
              }}
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white"
            onClick={handlePrevious}
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white"
            onClick={handleNext}
          >
            <ChevronRight className="h-8 w-8" />
          </Button>

          <div className="absolute bottom-4 left-4 right-4 text-center text-white">
            <p className="text-sm">
              {currentItem.title} • {currentIndex + 1} of {items.length}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

