export interface MediaItem {
  id: string
  type: 'photo' | 'video'
  url: string
  thumbnail: string
  title: string
  tags: string[]
  uploadedAt: Date
  uploadedBy: string
}

export interface FilterOptions {
  uploader: string | null
  tags: string[]
  personTags: string[]
}