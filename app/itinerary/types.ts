
export interface Activity {
  id: string
  title: string
  date: string
  startTime: string
  endTime: string
  location?: string
  googleMapsUrl?: string
  description?: string
  lastModified: string
  likes: string[]
  dislikes: string[]
  comments: Comment[]
  poll?: Poll
  deleted?: boolean
}

export interface Comment {
  id: string
  author: string
  text: string
  createdAt: string
  authorProfilePhoto?: string
}

export interface Poll {
  id: string
  question: string
  options: PollOption[]
}

export interface PollOption {
  id: string
  text: string
  votes: string[]
}

export interface GroupedActivities {
  [date: string]: Activity[]
}

