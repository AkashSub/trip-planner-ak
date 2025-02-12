// types.ts
interface TripMember {
    id: number
    name: string
    email: string
  }
  
  interface TravelInfo {
    id: number
    trainNumber: string
    trainName: string
    fromStation: string
    toStation: string
    departureDate: string
    ticketFile?: string
  }
  
  interface Trip {
    id: number
    title: string
    startDate: string
    endDate: string
    members: TripMember[]
    travelInfo: TravelInfo[]
    createdBy: string
  }