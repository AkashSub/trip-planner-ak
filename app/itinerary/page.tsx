"use client"

import type { Activity } from "./types"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Trash2, Calendar } from "lucide-react"
import { format, parseISO } from "date-fns"
import { ActivityForm } from "./components/activity-form"
import { ActivityCard } from "./components/activity-card"
import { groupActivitiesByDate, sortActivitiesByTime } from "./utils"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState, useEffect, useContext } from "react"
import { api } from "../utils/api"
import { useAuth } from "../contexts/auth-context"
import { v4 as uuidv4 } from 'uuid';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const currentUser = "John Doe" // This would come from authentication

export default function ItineraryPage() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [deletedActivities, setDeletedActivities] = useState<Activity[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showDeletedItems, setShowDeletedItems] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  

  useEffect(() => {
    loadItinerary();
  }, []);

  const loadItinerary = async () => {
    try {
      const data = await api.getItinerary();
      const processedActivities = data.activities.map(activity => ({
        ...activity,
        id: activity.id || uuidv4() // Ensure ID exists
      }));
  
      setActivities(processedActivities);
      setDeletedActivities(data.deletedActivities || []);
    } catch (error) {
      console.error("Failed to load itinerary:", error);
    } finally {
      setLoading(false);
    }
  };



  const persistItinerary = async (updatedActivities: Activity[], updatedDeleted: Activity[] = deletedActivities) => {
    try {
      await api.updateItinerary({
        activities: updatedActivities,
        deletedActivities: updatedDeleted
      })
    } catch (error) {
      console.error("Failed to save itinerary:", error)
    }
  }

  const handleAddActivity = async (newActivity: Partial<Activity>) => {
    const activity: Activity = {
      ...newActivity,
      id: uuidv4(), // Generate unique ID using UUID
      likes: [],
      dislikes: [],
      comments: [],
      lastModified: new Date().toISOString(),
    } as Activity;
  
    try {
      const updatedActivities = [...activities, activity];
      setActivities(updatedActivities);
      await api.updateItinerary({ activities: updatedActivities, deletedActivities });
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Failed to add activity:", error);
    }
  };

  // const handleUpdateActivity = async (activityId: string, updatedData: Partial<Activity>) => {
  //   const updatedActivities = activities.map(activity =>
  //     activity.id === activityId
  //       ? { ...activity, ...updatedData, lastModified: new Date().toISOString() }
  //       : activity
  //   );
    
  //   setActivities(updatedActivities);
  //   await persistItinerary(updatedActivities);
  //   setEditingActivity(null);
  //   setIsDialogOpen(false);
  // };

  const handleEditClick = (activity: Activity) => {
    console.log('Full activity being edited:', activity);
    
    // Ensure activity.id exists before setting state
    if (!activity.id) {
      console.error('Activity being edited has no ID');
      return;
    }
  
    setEditingActivity({ ...activity });
    setIsDialogOpen(true);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setTimeout(() => {
        setEditingActivity(null);
      }, 300);
    }
  };

  const handleUpdateActivity = async (activityId: string, updatedData: Partial<Activity>) => {
    try {
      if (!activityId) {
        console.error('No activity ID provided');
        return;
      }
  
      console.log('Full update data:', {
        activityId, 
        updatedData,
        currentActivities: activities.map(a => a.id)
      });
  
      const finalData = {
        ...updatedData,
        id: activityId,
        lastModified: new Date().toISOString()
      };
    
      const updatedActivities = activities.map(activity =>
        activity.id === activityId ? { ...activity, ...finalData } : activity
      );
      
      setActivities(updatedActivities);
      await api.updateItineraryActivity(activityId, finalData);
      setIsDialogOpen(false);
      setEditingActivity(null);
    } catch (error) {
      console.error('Detailed update error:', error);
      await loadItinerary();
    }
  };

  const handleLike = async (activityId: string) => {
    if (!user) return;
  
    const updated = activities.map(activity => {
      if (activity.id === activityId) {
        const likes = activity.likes.includes(user.name)
          ? activity.likes.filter(u => u !== user.name)
          : [...activity.likes, user.name];
        
        return { ...activity, likes };
      }
      return activity;
    });
  
    setActivities(updated);
    const targetActivity = updated.find(a => a.id === activityId);
    if (targetActivity) {
      try {
        await api.updateItineraryActivity(activityId, { 
          likes: targetActivity.likes 
        });
      } catch (error) {
        console.error('Failed to update likes:', error);
        await loadItinerary(); // Revert to server state if update fails
      }
    }
  };
  
  const handleDislike = async (activityId: string) => {
    if (!user) return;
  
    const updated = activities.map(activity => {
      if (activity.id === activityId) {
        const dislikes = activity.dislikes.includes(user.name)
          ? activity.dislikes.filter(u => u !== user.name)
          : [...activity.dislikes, user.name];
        
        return { ...activity, dislikes };
      }
      return activity;
    });
  
    setActivities(updated);
    const targetActivity = updated.find(a => a.id === activityId);
    if (targetActivity) {
      try {
        await api.updateItineraryActivity(activityId, { 
          dislikes: targetActivity.dislikes 
        });
      } catch (error) {
        console.error('Failed to update dislikes:', error);
        await loadItinerary(); // Revert to server state if update fails
      }
    }
  };
  
  const handleVote = async (activityId: string, optionId: string) => {
    const updated = activities.map(activity => {
      if (activity.id === activityId && activity.poll) {
        const updatedPoll = {
          ...activity.poll,
          options: activity.poll.options.map(option =>
            option.id === optionId
              ? { ...option, votes: [...option.votes, user?.name || ''] }
              : option
          )
        };
        return { ...activity, poll: updatedPoll };
      }
      return activity;
    });
  
    setActivities(updated);
    const targetActivity = updated.find(a => a.id === activityId);
    if (targetActivity) {
      try {
        await api.updateItineraryActivity(activityId, { 
          poll: targetActivity.poll 
        });
      } catch (error) {
        console.error('Failed to update poll:', error);
        await loadItinerary(); // Revert to server state if update fails
      }
    }
  };
  
  const handleEdit = async (activityId: string, updatedActivity: Partial<Activity>) => {
    const updated = activities.map(activity => 
      activity.id === activityId 
        ? { ...activity, ...updatedActivity, lastModified: new Date().toISOString() }
        : activity
    );
  
    setActivities(updated);
    try {
      await api.updateItineraryActivity(activityId, updatedActivity);
    } catch (error) {
      console.error('Failed to update activity:', error);
      await loadItinerary(); // Revert to server state if update fails
    }
  };
  
  const handleComment = async (activityId: string, text: string) => {
    if (!user?.name) return;
  
    const newComment = {
      id: Math.random().toString(36).substr(2, 9),
      author: user.name,
      text,
      createdAt: new Date().toISOString(),
      authorProfilePhoto: user.profilePhoto
    };
  
    const updated = activities.map(activity => {
      if (activity.id === activityId) {
        return {
          ...activity,
          comments: [...activity.comments, newComment]
        };
      }
      return activity;
    });
  
    setActivities(updated);
    try {
      await api.updateItineraryActivity(activityId, { 
        comments: updated.find(a => a.id === activityId)?.comments 
      });
    } catch (error) {
      console.error('Failed to add comment:', error);
      await loadItinerary(); // Revert to server state if update fails
    }
  };

  const handleDelete = async (activityId: string) => {
    const activityToDelete = activities.find(a => a.id === activityId)
    if (!activityToDelete) return

    const updatedActivities = activities.filter(a => a.id !== activityId)
    const updatedDeleted = [...deletedActivities, activityToDelete]
    
    setActivities(updatedActivities)
    setDeletedActivities(updatedDeleted)
    await persistItinerary(updatedActivities, updatedDeleted)
  }


  const handleRestore = async (activityId: string) => {
    const activityToRestore = deletedActivities.find(a => a.id === activityId);
    if (!activityToRestore) return;

    const updatedDeleted = deletedActivities.filter(a => a.id !== activityId);
    const updatedActivities = [...activities, activityToRestore];
    
    setDeletedActivities(updatedDeleted);
    setActivities(updatedActivities);
    await persistItinerary(updatedActivities, updatedDeleted);
  };


  const groupedActivities = groupActivitiesByDate(
    activities.filter(activity => 
      !selectedDate || activity.date === selectedDate
    )
  )
  if (loading) return <div className="p-4">Loading itinerary...</div>


  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 max-w-4xl">
  <div className="flex flex-col gap-4 mb-6">
    <h1 className="text-2xl sm:text-3xl font-bold px-2">Trip Itinerary</h1>
    
    <div className="flex flex-col sm:flex-row gap-2 px-2">
      <Input
        type="date"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
        className="w-full sm:w-40"
      />
      <Button
        variant="outline"
        onClick={() => setShowDeletedItems(!showDeletedItems)}
        className="flex items-center gap-2"
      >
        <Trash2 className="h-4 w-4" />
        <span className="hidden sm:inline">
          {showDeletedItems ? 'Hide Deleted' : 'Show Deleted'}
        </span>
      </Button>
    </div>

    <Dialog 
      open={isDialogOpen} 
      onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) {
          setEditingActivity(null);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Add Activity
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editingActivity ? 'Edit Activity' : 'Add New Activity'}
          </DialogTitle>
        </DialogHeader>
        <ActivityForm
  key={editingActivity?.id || 'new'}
  initialData={editingActivity}
  onSubmit={async (data) => {
    if (editingActivity) {
      // Verify the ID is being passed
      console.log('Submitting edit for activity ID:', editingActivity.id);
      await handleUpdateActivity(editingActivity.id, data);
    } else {
      await handleAddActivity(data);
    }
  }}
  onClose={() => setIsDialogOpen(false)}
/>
      </DialogContent>
    </Dialog>
        </div>


        <ScrollArea className="h-[calc(100vh-180px)] sm:h-[calc(100vh-200px)] pr-2">
  {showDeletedItems ? (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold sticky top-0 bg-background/95 backdrop-blur py-3 z-10 px-2">
        Deleted Activities
      </h2>
      {deletedActivities.map((activity) => (
        <ActivityCard
          key={activity.id}
          activity={{ ...activity, deleted: true }}
          currentUser={user?.name || ''}
          onRestore={handleRestore}
          showRestoreButton={true}
        />
      ))}
    </div>
  ) : (
    Object.entries(groupedActivities).map(([date, dateActivities]) => (
      <div key={date} className="space-y-4">
        <h2 className="text-xl font-semibold sticky top-0 bg-background/95 backdrop-blur py-3 z-10 px-2">
          {format(parseISO(date), 'EEEE, MMMM d')}
        </h2>
        <div className="grid gap-4">
        {sortActivitiesByTime(dateActivities).map((activity) => (
        <ActivityCard
          key={activity.id}
          activity={activity}
          currentUser={user?.name || ''}
          onLike={handleLike}
          onDislike={handleDislike}
          onComment={handleComment}
          onDelete={handleDelete}
          onEdit={handleEditClick}
          onVote={handleVote}  
        />
      ))}
        </div>
      </div>
    ))
  )}
</ScrollArea>
    </div>
  )
}
