import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, Plus, X, Train, Bus, Plane, Edit, Trash2, Download } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "../contexts/auth-context"
import { useRouter } from "next/navigation"
import { CalendarDays, MapPin, NotebookPen, Map } from 'lucide-react'
import { useState, useEffect } from "react"
import { api } from "../utils/api"

type TravelMode = 'train' | 'bus' | 'flight'

interface TravelInfo {
  id: string
  mode: TravelMode
  vehicleNumber: string
  vehicleName: string
  from: string
  to: string
  date: string
  ticket?: File
}

interface Member {
  id: number
  name: string
  email: string
  avatar?: string
  initials: string
}

interface Trip {
  id: string
  title: string
  startDate: string
  endDate: string
  description?: string
  members: Member[]
  travelInfo: TravelInfo[]
  createdBy: string
  createdByUsername: string  // Add this line
  creatorAvatar?: string
}

export function HomeContent() {
  const { user, isAdmin, logout } = useAuth()
  const router = useRouter()
  
  const [trips, setTrips] = useState<Trip[]>([])
  const [isCreateTripOpen, setIsCreateTripOpen] = useState(false)
  const [isEditTripOpen, setIsEditTripOpen] = useState(false)
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null)
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null)
  const [newTrip, setNewTrip] = useState({
    title: '',
    startDate: '',
    endDate: '',
    description: '',
    members: [] as Member[],
    travelInfo: [] as TravelInfo[]
  })
  const [newMember, setNewMember] = useState({ name: '', email: '', avatar: '' })
  const [newTravelInfo, setNewTravelInfo] = useState({
    mode: 'train' as TravelMode,
    vehicleNumber: '',
    vehicleName: '',
    from: '',
    to: '',
    date: '',
    ticket: undefined as File | undefined
  })
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTrips = async () => {
      if (user && user.name) {  // Use username instead of email
        try {
          console.log("Fetching trips for username:", user.name);
          const data = await api.getTrips(user.name); // Pass username
          setTrips(data);
        } catch (error) {
          console.error('Error loading trips:', error);
        } finally {
          setLoading(false);
        }
      }
    }
    
    loadTrips();
  }, [user]);

  if (!user) {
    router.push('/login')
    return null
  }

 
const handleDownloadTicket = (ticket: File) => {
  const url = URL.createObjectURL(ticket)
  const link = document.createElement('a')
  link.href = url
  link.download = `ticket-${Date.now()}.pdf`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const handleCreateTrip = async () => {
  try {
    if (!user || !user.name) {
      console.error('User name is missing');
      return;
    }

    const tripData = {
      ...newTrip,
      createdBy: user.email,
      createdByUsername: user.name,  // Make sure this is included
      members: newTrip.members,
      travelInfo: newTrip.travelInfo
    };

    console.log('Creating trip with data:', tripData); // Debug log
    
    const result = await api.createTrip(tripData);
    console.log('Trip creation result:', result); // Debug log
    
    setTrips([...trips, {...tripData, id: result.id}]);
    setIsCreateTripOpen(false);
    resetForm();
  } catch (error) {
    console.error('Error creating trip:', error);
  }
};

const handleEditTrip = async () => {
  if (!currentTrip || !user?.name) return;
  
  try {
    const tripData = {
      ...currentTrip,
      ...newTrip,
      id: currentTrip.id,  // Ensure we keep the original ID
      createdByUsername: currentTrip.createdByUsername  // Keep original creator
    };

    console.log('Updating trip with data:', tripData); // Debug log
    
    await api.updateTrip(currentTrip.id, tripData, user.name);
    
    const updatedTrips = trips.map(trip => 
      trip.id === currentTrip.id ? tripData : trip
    );
    setTrips(updatedTrips);
    setIsEditTripOpen(false);
    resetForm();
  } catch (error) {
    console.error('Error updating trip:', error);
    alert(error.message || 'Failed to update trip');
  }
};

const handleDeleteTrip = async (tripId: string) => {
  if (window.confirm('Are you sure you want to delete this trip?')) {
    try {
      await api.deleteTrip(tripId)
      setTrips(trips.filter(trip => trip.id !== tripId))
    } catch (error) {
      console.error('Error deleting trip:', error)
    }
  }
}

  const resetForm = () => {
    setNewTrip({
      title: '',
      startDate: '',
      endDate: '',
      description: '',
      members: [],
      travelInfo: []
    })
    setCurrentTrip(null)
  }

  const handleEditClick = (trip: Trip) => {
    setCurrentTrip(trip)
    setNewTrip({
      title: trip.title,
      startDate: trip.startDate,
      endDate: trip.endDate,
      description: trip.description || '',
      members: trip.members,
      travelInfo: trip.travelInfo
    })
    setIsEditTripOpen(true)
  }

  const handleAddMember = () => {
    if (!newMember.name || !newMember.email) return
    
    const initials = newMember.name.split(' ').map(n => n[0]).join('')
    const member: Member = {
      id: Date.now(),
      ...newMember,
      initials
    }
    setNewTrip({
      ...newTrip,
      members: [...newTrip.members, member]
    })
    setNewMember({ name: '', email: '', avatar: '' })
  }

  const handleAddTravelInfo = () => {
    if (!newTravelInfo.vehicleNumber || !newTravelInfo.from || !newTravelInfo.to || !newTravelInfo.date) return
    
    const travelInfo: TravelInfo = {
      id: Date.now().toString(),
      ...newTravelInfo
    }
    setNewTrip({
      ...newTrip,
      travelInfo: [...newTrip.travelInfo, travelInfo]
    })
    setNewTravelInfo({
      mode: 'train',
      vehicleNumber: '',
      vehicleName: '',
      from: '',
      to: '',
      date: '',
      ticket: undefined
    })
  }
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4 flex-wrap">
        <Avatar className="h-8 w-8 ring-2 ring-gray-100">
        <AvatarImage src={user.avatar || '/curious_cat.png'} />
  <AvatarFallback className="bg-gradient-to-r from-blue-100 to-purple-100">
    {user.name?.charAt(0)}
  </AvatarFallback>
</Avatar>
          <span className="text-sm text-muted-foreground">
            Signed in as {user.name} ({user.role})
          </span>
          <Button variant="outline" onClick={() => {
            logout()
            router.push('/login')
          }}>
            Sign Out
          </Button>
        </div>
        {isAdmin && (
          <Button onClick={() => setIsCreateTripOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Trip
          </Button>
        )}
      </div>
  
      {/* Trip Details Dialog */}
      <Dialog open={!!selectedTrip} onOpenChange={(open) => !open && setSelectedTrip(null)}>
        <DialogContent className="max-w-2xl h-[90vh] md:h-[80vh] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {selectedTrip?.title}
            </DialogTitle>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
  Created by {selectedTrip?.createdByUsername}
</div>
          </DialogHeader>
          
          <ScrollArea className="h-full pr-4">
            <div className="space-y-6 py-4">
              {/* Cover Section */}
              <div className="relative h-40 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700">
                <div className="absolute bottom-4 left-4">
                  <div className="flex items-center gap-2 text-lg font-medium">
                    <CalendarDays className="h-5 w-5" />
                    <span>
                      {new Date(selectedTrip?.startDate || '').toLocaleDateString('en-US', { 
                        month: 'long', 
                        day: 'numeric' 
                      })} 
                      {' - '}
                      {new Date(selectedTrip?.endDate || '').toLocaleDateString('en-US', { 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                </div>
              </div>
              {/* Description Section */}
            {selectedTrip?.description && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <NotebookPen className="h-5 w-5 text-blue-600" />
                  Trip Description
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {selectedTrip.description}
                </p>
              </div>
            )}

            {/* Members Section */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                Travel Companions
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedTrip?.members.map((member) => (
                  <div key={member.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-100 to-purple-100">
                        {member.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{member.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{member.email}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Travel Information Section */}
            {selectedTrip?.travelInfo.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Map className="h-5 w-5 text-purple-600" />
                  Travel Plans
                </h3>
                <div className="space-y-4">
                  {selectedTrip.travelInfo.map((info) => (
                    <div key={info.id} className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-3 mb-3">
                        {info.mode === 'train' && (
                          <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900">
                            <Train className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                          </div>
                        )}
                        {info.mode === 'bus' && (
                          <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900">
                            <Bus className="h-6 w-6 text-green-600 dark:text-green-300" />
                          </div>
                        )}
                        {info.mode === 'flight' && (
                          <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900">
                            <Plane className="h-6 w-6 text-purple-600 dark:text-purple-300" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium">{info.vehicleName}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {info.vehicleNumber}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="space-y-1">
                          <div className="text-gray-500 dark:text-gray-400">From</div>
                          <div className="font-medium">{info.from}</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-gray-500 dark:text-gray-400">To</div>
                          <div className="font-medium">{info.to}</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-gray-500 dark:text-gray-400">Departure</div>
                          <div className="font-medium">
                            {new Date(info.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>

                      {info.ticket && (
                        <Button
                          variant="default"
                          size="sm"
                          className="mt-4 w-full"
                          onClick={() => handleDownloadTicket(info.ticket!)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download Ticket
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
    {/* Create/Edit Trip Dialog */}
    <Dialog 
      open={isCreateTripOpen || isEditTripOpen} 
      onOpenChange={(open) => {
        if (!open) {
          setIsCreateTripOpen(false)
          setIsEditTripOpen(false)
          resetForm()
        }
      }}
    >
      <DialogContent className="max-w-2xl h-[80vh] flex flex-col p-6">
        <DialogHeader className="mb-4">
          <DialogTitle>{isEditTripOpen ? 'Edit Trip' : 'Create New Trip'}</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1 pr-4 overflow-y-auto">
          <div className="space-y-6">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Trip Title</Label>
                <Input
                  id="title"
                  value={newTrip.title}
                  onChange={(e) => setNewTrip({...newTrip, title: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={newTrip.startDate}
                    onChange={(e) => setNewTrip({...newTrip, startDate: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={newTrip.endDate}
                    onChange={(e) => setNewTrip({...newTrip, endDate: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={newTrip.description}
                  onChange={(e) => setNewTrip({...newTrip, description: e.target.value})}
                  className="min-h-[100px]"
                />
              </div>
            </div>

            {/* Members Section */}
            <Card className="border rounded-lg">
              <CardHeader>
                <CardTitle>Add Members</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
  <Input
    placeholder="Name"
    value={newMember.name}
    onChange={(e) => setNewMember({...newMember, name: e.target.value})}
  />
  <Input
    placeholder="Email"
    type="email"
    value={newMember.email}
    onChange={(e) => setNewMember({...newMember, email: e.target.value})}
  />
  <Input
    placeholder="Avatar URL"
    value={newMember.avatar}
    onChange={(e) => setNewMember({...newMember, avatar: e.target.value})}
  />
</div>
                <Button onClick={handleAddMember} className="w-full">Add Member</Button>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  {newTrip.members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 border rounded-md">
                      <span className="text-sm">{member.name} ({member.email})</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setNewTrip({
                          ...newTrip,
                          members: newTrip.members.filter(m => m.id !== member.id)
                        })}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Travel Info Section */}
            <Card className="border rounded-lg">
              <CardHeader>
                <CardTitle>Travel Information (Optional)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select
                  value={newTravelInfo.mode}
                  onValueChange={(value: TravelMode) => setNewTravelInfo({...newTravelInfo, mode: value})}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select travel mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="train">Train</SelectItem>
                    <SelectItem value="bus">Bus</SelectItem>
                    <SelectItem value="flight">Flight</SelectItem>
                  </SelectContent>
                </Select>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder={`${newTravelInfo.mode} number`}
                    value={newTravelInfo.vehicleNumber}
                    onChange={(e) => setNewTravelInfo({...newTravelInfo, vehicleNumber: e.target.value})}
                  />
                  <Input
                    placeholder={`${newTravelInfo.mode} name`}
                    value={newTravelInfo.vehicleName}
                    onChange={(e) => setNewTravelInfo({...newTravelInfo, vehicleName: e.target.value})}
                  />
                  <Input
                    placeholder="From"
                    value={newTravelInfo.from}
                    onChange={(e) => setNewTravelInfo({...newTravelInfo, from: e.target.value})}
                  />
                  <Input
                    placeholder="To"
                    value={newTravelInfo.to}
                    onChange={(e) => setNewTravelInfo({...newTravelInfo, to: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="date"
                    value={newTravelInfo.date}
                    onChange={(e) => setNewTravelInfo({...newTravelInfo, date: e.target.value})}
                  />
                  <Input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setNewTravelInfo({
                      ...newTravelInfo,
                      ticket: e.target.files?.[0]
                    })}
                  />
                </div>
                
                <Button onClick={handleAddTravelInfo} className="w-full">Add Travel Info</Button>
                
                <div className="space-y-2 mt-4">
                  {newTrip.travelInfo.map((info) => (
                    <div key={info.id} className="flex items-center justify-between p-3 border rounded-md">
                      <span className="text-sm">{info.mode}: {info.from} to {info.to}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setNewTrip({
                          ...newTrip,
                          travelInfo: newTrip.travelInfo.filter(t => t.id !== info.id)
                        })}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        <DialogFooter className="mt-6">
          <Button onClick={isEditTripOpen ? handleEditTrip : handleCreateTrip}>
            {isEditTripOpen ? 'Save Changes' : 'Create Trip'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    {/* Display Trips */}
    {loading ? (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {trips
          .map((trip) => (
            <Card 
              key={trip.id}
              className="cursor-pointer hover:shadow-lg transition-all duration-300 rounded-xl border border-gray-100 dark:border-gray-800"
              onClick={() => setSelectedTrip(trip)}
            >
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {trip.title}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short' })}
                      {' - '}
                      {new Date(trip.endDate).toLocaleDateString('en-US', { month: 'short' })}
                    </span>
                    {(isAdmin || trip.members.some(member => 
    member.name.toLowerCase() === user.name.toLowerCase()
  )) && (
                      <div className="flex gap-1 ml-2" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditClick(trip);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 text-destructive hover:text-destructive/80"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTrip(trip.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <CalendarDays className="h-4 w-4" />
                    <span>
                      {new Date(trip.startDate).toLocaleDateString()} - {' '}
                      {new Date(trip.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <Users className="h-4 w-4" />
                    <span>{trip.members.length + 1} Members</span>
                  </div>

                  {trip.travelInfo.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <MapPin className="h-4 w-4" />
                      <span className="flex items-center gap-1">
                        {trip.travelInfo.map((info, index) => (
                          <span key={info.id} className="flex items-center gap-1">
                            {info.mode === 'train' && <Train className="h-4 w-4 text-blue-600" />}
                            {info.mode === 'bus' && <Bus className="h-4 w-4 text-green-600" />}
                            {info.mode === 'flight' && <Plane className="h-4 w-4 text-purple-600" />}
                            {index < trip.travelInfo.length - 1 && '·'}
                          </span>
                        ))}
                      </span>
                    </div>
                  )}

<div className="flex items-center -space-x-2">
  {trip.members.slice(0, 3).map((member) => (
    <Avatar 
      key={member.id} 
      className="h-8 w-8 border-2 border-white dark:border-gray-800 hover:-translate-y-1 transition-transform ring-2 ring-gray-100 dark:ring-gray-700"
    >
      <AvatarImage src={member.avatar} />
      <AvatarFallback className="bg-gradient-to-r from-blue-100 to-purple-100 text-xs">
        {member.initials}
      </AvatarFallback>
    </Avatar>
  ))}
  {trip.members.length > 3 && (
    <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs border-2 border-white dark:border-gray-800 ring-2 ring-gray-100 dark:ring-gray-700">
      +{trip.members.length - 3}
    </div>
  )}
</div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    )}
  </div>
  )}