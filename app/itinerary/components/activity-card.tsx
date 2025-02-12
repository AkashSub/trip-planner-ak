"use client"

import { useState } from "react"
import type { Activity } from "../types"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Clock, 
  MapPin, 
  MessageCircle, 
  ThumbsUp, 
  ThumbsDown, 
  Send, 
  Undo2, 
  ChevronDown, 
  ChevronUp,
  ChevronRight,
  Edit,
  Trash2
} from "lucide-react"
import { format, parseISO } from "date-fns"
import Link from "next/link"
import { getTimeOfDay } from '@/app/utils/dateUtils'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ActivityForm } from "./activity-form"
import { cn } from "@/lib/utils"

interface ActivityCardProps {
  activity: Activity
  currentUser: string
  onLike: (activityId: string) => void
  onDislike: (activityId: string) => void
  onVote: (activityId: string, optionId: string) => void
  onComment: (activityId: string, text: string, user: string) => void
  onDelete: (activityId: string) => void
  onRestore: (activityId: string) => void
  onEdit: (activity: Activity) => void;
  className?: string
}

export function ActivityCard({
  activity,
  onEdit,
  currentUser,
  onLike,
  onDislike,
  onVote,
  onComment,
  onDelete,
  onRestore,
  className = ""
}: ActivityCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [comment, setComment] = useState("")
  const [showAllComments, setShowAllComments] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const combineDateAndTime = (date: string, time: string) => {
    return `${date}T${time}`
  }

  const startDateTime = parseISO(combineDateAndTime(activity.date, activity.startTime))
  const endDateTime = parseISO(combineDateAndTime(activity.date, activity.endTime))
  
  const timeOfDay = getTimeOfDay(startDateTime.getHours())
  const canDelete = activity.likes.length <= 4
  const hasVoted = activity.poll?.options.some((option) => option.votes.includes(currentUser))
  
  const visibleComments = showAllComments 
    ? activity.comments 
    : activity.comments.slice(-1)

  const isLiked = activity.likes.includes(currentUser)
  const isDisliked = activity.dislikes.includes(currentUser)

  const handleLike = () => {
    if (isDisliked) {
      onDislike(activity.id) // Remove dislike first
    }
    onLike(activity.id)
  }

  const handleDislike = () => {
    if (isLiked) {
      onLike(activity.id) // Remove like first
    }
    onDislike(activity.id)
  }

  return (
    <Card className={cn(
      "transition-all duration-200 overflow-hidden",
      expanded ? "ring-1 ring-primary/20 shadow-lg" : "hover:shadow-md",
      activity.deleted ? "opacity-70 bg-red-50" : "bg-background",
      className
    )}>
      <div className="flex items-center justify-between p-3 sm:p-4 group">
        <div className="flex items-center gap-2 sm:gap-4 flex-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg hover:bg-primary/10"
            onClick={() => setExpanded(!expanded)}
          >
            <ChevronRight className={cn(
              "h-4 w-4 transition-transform text-muted-foreground",
              expanded ? "transform rotate-90 text-primary" : ""
            )} />
          </Button>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{activity.title}</h3>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">
                  {format(startDateTime, 'h:mm a')} - {format(endDateTime, 'h:mm a')}
                </span>
              </div>
              {activity.location && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{activity.location}</span>
                  {activity.googleMapsUrl && (
                    <Link 
                      href={activity.googleMapsUrl}
                      target="_blank"
                      className="text-primary hover:underline text-xs ml-1"
                    >
                      View Map
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!activity.deleted && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(activity);
                }}
                className="h-8 w-8"
              >
                <Edit className="h-4 w-4" />
              </Button>
              {canDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(activity.id)
                  }}
                  className="h-8 w-8 text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </>
          )}
          {activity.deleted && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onRestore(activity.id)
              }}
            >
              <Undo2 className="h-4 w-4 mr-2" />
              Restore
            </Button>
          )}
        </div>
      </div>

      {expanded && (
        <CardContent className="pb-4 space-y-4">
          <div className="space-y-4">
            {/* <div className="absolute left-12 top-0 bottom-0 w-px bg-border/50" /> */}

            {activity.description && (
              <div className="pl-2 border-l-4 border-primary/20">
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {activity.description}
                </p>
              </div>
            )}

            {activity.googleMapsUrl && (
              <div className="aspect-video w-full rounded-lg overflow-hidden border">
                <iframe
                  src={`${activity.googleMapsUrl}&output=embed`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            )}


            {activity.poll && (
              <div className="bg-primary/5 p-4 rounded-xl space-y-4 border border-primary/10">
                <h4 className="font-medium text-lg flex items-center gap-2 text-primary">
                  <span>🗳️</span>
                  {activity.poll.question}
                </h4>
                <div className="space-y-3">
                  {activity.poll.options.map((option) => {
                    const voteCount = option.votes.length
                    const totalVotes = activity.poll!.options.reduce(
                      (sum, opt) => sum + opt.votes.length, 
                      0
                    )
                    const percentage = totalVotes === 0 ? 0 : (voteCount / totalVotes) * 100

                    return (
                      <div key={option.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{option.text}</span>
                          <span className="text-sm text-muted-foreground">
                            {voteCount} {voteCount === 1 ? 'vote' : 'votes'}
                          </span>
                        </div>
                        <div className="relative h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="absolute inset-y-0 left-0 bg-primary transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        {!hasVoted && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full mt-1"
                            onClick={() => onVote(activity.id, option.id)}
                          >
                            Vote
                          </Button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="flex items-center gap-4 pt-2 border-t">
              <Button
                variant={isLiked ? "default" : "ghost"}
                size="sm"
                onClick={handleLike}
                className={cn(
                  isLiked && "bg-green-500 text-white hover:bg-green-600"
                )}
              >
                <ThumbsUp className="h-4 w-4 mr-1" />
                {activity.likes.length}
              </Button>
              <Button
                variant={isDisliked ? "default" : "ghost"}
                size="sm"
                onClick={handleDislike}
                className={cn(
                  isDisliked && "bg-red-500 text-white hover:bg-red-600"
                )}
              >
                <ThumbsDown className="h-4 w-4 mr-1" />
                {activity.dislikes.length}
              </Button>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                <span className="font-medium text-sm">Comments</span>
              </div>
              <div className="space-y-3">
                {visibleComments.map((comment, index) => (
                  <div key={index} className="bg-muted/20 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm text-primary">
                        {comment.user}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(comment.createdAt), 'MMM d, h:mm a')}
                      </span>
                    </div>
                    <p className="text-sm">{comment.text}</p>
                  </div>
                ))}
                
                {activity.comments.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAllComments(!showAllComments)}
                    className="text-xs w-full justify-center"
                  >
                    {showAllComments ? (
                      <>
                        <ChevronUp className="h-4 w-4 mr-1" />
                        Show less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4 mr-1" />
                        View {activity.comments.length - 1} more comments
                      </>
                    )}
                  </Button>
                )}

                <div className="flex gap-2">
                  <Input
                    placeholder="Add a comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="rounded-full bg-background"
                  />
                  <Button
                    size="sm"
                    className="rounded-full"
                    onClick={() => {
                      if (comment.trim()) {
                        onComment(activity.id, comment, currentUser)
                        setComment("")
                      }
                    }}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Activity</DialogTitle>
          </DialogHeader>
          <ActivityForm
            initialData={activity}
            onSubmit={(updatedActivity) => {
              onEdit(activity.id, updatedActivity)
              setIsEditDialogOpen(false)
            }}
          />
        </DialogContent>
      </Dialog>
    </Card>
  )
}