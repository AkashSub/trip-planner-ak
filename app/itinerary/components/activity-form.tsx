import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import type { Activity, Poll } from "../types"
import { Plus, Trash2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface ActivityFormProps {
  onSubmit: (activity: Partial<Activity>) => Promise<void>;
  initialData: Activity | null;
  onClose: () => void;
}

export function ActivityForm({ onSubmit, initialData, onClose }: ActivityFormProps) {
  const [formData, setFormData] = useState<Partial<Activity>>(() => ({
    startTime: initialData?.startTime || '',
    endTime: initialData?.endTime || '',
    date: initialData?.date || '',
    title: initialData?.title || '',
    location: initialData?.location || '',
    googleMapsUrl: initialData?.googleMapsUrl || '',
    description: initialData?.description || '',
  }));

  const [pollEnabled, setPollEnabled] = useState(!!initialData?.poll);
  const [pollQuestion, setPollQuestion] = useState(initialData?.poll?.question || '');
  const [pollOptions, setPollOptions] = useState<string[]>(
    initialData?.poll?.options?.map(o => o.text) || ['', '']
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        startTime: initialData.startTime || '',
        endTime: initialData.endTime || '',
        date: initialData.date || '',
        title: initialData.title || '',
        location: initialData.location || '',
        googleMapsUrl: initialData.googleMapsUrl || '',
        description: initialData.description || '',
      });
      setPollEnabled(!!initialData.poll);
      setPollQuestion(initialData.poll?.question || '');
      setPollOptions(initialData.poll?.options?.map(o => o.text) || ['', '']);
    }
  }, [initialData]);

  // useEffect(() => {
  //   if (!initialData) {
  //     // Reset form when there's no initial data
  //     setFormData({
  //       id: '',
  //       startTime: '',
  //       endTime: '',
  //       date: '',
  //       title: '',
  //       location: '',
  //       googleMapsUrl: '',
  //       description: '',
  //       likes: [],
  //       dislikes: [],
  //       comments: [],
  //       poll: undefined,
  //     });
  //     setPollEnabled(false);
  //     setPollQuestion("");
  //     setPollOptions(["", ""]);
  //   }
  // }, [initialData]);

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault(); // Crucial: prevent default form submission
    
  //   try {
  //     const poll = pollEnabled ? {
  //       id: initialData?.poll?.id || Math.random().toString(36).substr(2, 9),
  //       question: pollQuestion,
  //       options: pollOptions
  //         .filter(opt => opt.trim())
  //         .map(opt => ({
  //           id: Math.random().toString(36).substr(2, 9),
  //           text: opt,
  //           votes: initialData?.poll?.options?.find(o => o.text === opt)?.votes || []
  //         }))
  //     } : undefined;

  //     const activityData: Partial<Activity> = {
  //       ...formData,
  //       poll,
  //       lastModified: new Date().toISOString()
  //     };

  //     console.log('Submitting activity:', activityData); // Debug log
  //     await onSubmit(activityData);
  //     onClose(); // Close dialog after successful submission
  //   } catch (error) {
  //     console.error('Form submission failed:', error);
  //     // Keep dialog open to show error
  //   }
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const finalData: Partial<Activity> = {
        ...formData,
        poll: pollEnabled ? {
          id: initialData?.poll?.id || Math.random().toString(36).substr(2, 9),
          question: pollQuestion,
          options: pollOptions
            .filter(opt => opt.trim())
            .map(opt => ({
              id: Math.random().toString(36).substr(2, 9),
              text: opt,
              votes: initialData?.poll?.options?.find(o => o.text === opt)?.votes || []
            }))
        } : undefined,
      };

      await onSubmit(finalData);
      onClose();
    } catch (error) {
      console.error('Form submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-h-[80vh] overflow-y-auto px-4 py-2">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-4 sm:p-6 rounded-xl">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            <Separator />
            <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 mt-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                  className="rounded-lg h-10"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="Activity title"
                  className="rounded-lg h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                  required
                  className="rounded-lg h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                  required
                  className="rounded-lg h-10"
                />
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Location Details</h3>
            <Separator />
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Location</Label>
                <Input
                  id="location"
                  value={formData.location || ""}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Enter location"
                  className="rounded-lg h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Google Maps URL</Label>
                <Input
                  id="googleMapsUrl"
                  value={formData.googleMapsUrl || ""}
                  onChange={(e) => setFormData({ ...formData, googleMapsUrl: e.target.value })}
                  placeholder="Paste Google Maps URL"
                  className="rounded-lg h-10"
                />
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Description</h3>
            <Separator />
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter activity description"
                  className="min-h-[100px]"
                />
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Poll</h3>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={pollEnabled}
                  onCheckedChange={setPollEnabled}
                  id="poll-switch"
                />
                <Label htmlFor="poll-switch">Enable Poll</Label>
              </div>
            </div>
            {pollEnabled && (
              <>
                <Separator />
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="pollQuestion">Poll Question</Label>
                    <Input
                      id="pollQuestion"
                      value={pollQuestion}
                      onChange={(e) => setPollQuestion(e.target.value)}
                      placeholder="Enter your question"
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Options</Label>
                    {pollOptions.map((option, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...pollOptions];
                            newOptions[index] = e.target.value;
                            setPollOptions(newOptions);
                          }}
                          placeholder={`Option ${index + 1}`}
                          className="w-full"
                        />
                        {index >= 2 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setPollOptions(pollOptions.filter((_, i) => i !== index));
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setPollOptions([...pollOptions, ""])}
                      className="mt-2"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Option
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </Card>

        <Button 
          type="submit" 
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : (initialData ? "Save Changes" : "Create Activity")}
        </Button>
      </form>
    </div>
  )
}