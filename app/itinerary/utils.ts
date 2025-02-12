import type { Activity, GroupedActivities } from "./types"
import { jsPDF } from "jspdf"
import { format, parseISO } from "date-fns"

export function groupActivitiesByDate(activities: Activity[]) {
  return activities.reduce((acc, activity) => {
    const date = activity.date
    if (!acc[date]) acc[date] = []
    acc[date].push(activity)
    return acc
  }, {} as Record<string, Activity[]>)
}

export function sortActivitiesByTime(activities: Activity[]) {
  return [...activities].sort((a, b) => {
    const aTime = new Date(`${a.date}T${a.startTime}`).getTime()
    const bTime = new Date(`${b.date}T${b.startTime}`).getTime()
    return aTime - bTime
  })
}

export function getTimeOfDay(hours: number) {
  if (hours < 5) return 'Late Night'
  if (hours < 12) return 'Morning'
  if (hours < 17) return 'Afternoon'
  if (hours < 21) return 'Evening'
  return 'Night'
}

export const generatePDF = (activities: Activity[]) => {
  const doc = new jsPDF()
  const grouped = groupActivitiesByDate(activities)
  let y = 20

  doc.setFontSize(20)
  doc.text("Trip Itinerary", 20, y)
  y += 20

  Object.entries(grouped).forEach(([date, dayActivities]) => {
    if (y > 250) {
      doc.addPage()
      y = 20
    }

    doc.setFontSize(16)
    doc.text(format(parseISO(date), "MMMM d, yyyy"), 20, y)
    y += 10

    sortActivitiesByTime(dayActivities).forEach((activity) => {
      if (y > 250) {
        doc.addPage()
        y = 20
      }

      doc.setFontSize(12)
      doc.text(`${activity.startTime} - ${activity.endTime}`, 20, y)
      doc.setFontSize(14)
      doc.text(activity.title, 50, y)
      y += 7

      if (activity.location) {
        doc.setFontSize(10)
        doc.text(`Location: ${activity.location}`, 20, y)
        y += 7
      }

      if (activity.description) {
        doc.setFontSize(10)
        doc.text(activity.description, 20, y, { maxWidth: 170 })
        y += 7
      }

      y += 5
    })

    y += 10
  })

  doc.save("itinerary.pdf")
}

