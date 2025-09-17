"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, CalendarIcon } from "lucide-react"
import { attendanceService } from "@/lib/attendance-service"
import { useAuth } from "@/hooks/use-auth"
import type { AttendanceRecord } from "../../../shared/types"

interface AttendanceCalendarProps {
  staffId?: string
  showAllStaff?: boolean
}

export function AttendanceCalendar({ staffId, showAllStaff = false }: AttendanceCalendarProps) {
  const { user, business } = useAuth()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const targetStaffId = staffId || user?.id

  useEffect(() => {
    loadMonthlyAttendance()
  }, [currentDate, targetStaffId, business?.id])

  const loadMonthlyAttendance = async () => {
    if (!business?.id || !targetStaffId) return

    setIsLoading(true)
    try {
      const records = await attendanceService.getMonthlyAttendance(
        business.id,
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
      )

      const filteredRecords = showAllStaff ? records : records.filter((r) => r.staffId === targetStaffId)

      setAttendanceData(filteredRecords)
    } catch (error) {
      console.error("Failed to load monthly attendance:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }

    return days
  }

  const getAttendanceForDate = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`
    return attendanceData.filter((record) => record.date === dateStr)
  }

  const getStatusColor = (records: AttendanceRecord[]) => {
    if (records.length === 0) return "bg-gray-100"

    const hasPresent = records.some((r) => r.status === "present")
    const hasLate = records.some((r) => r.isLate)
    const hasWFH = records.some((r) => r.location === "wfh")

    if (hasLate) return "bg-yellow-200"
    if (hasWFH) return "bg-blue-200"
    if (hasPresent) return "bg-green-200"
    return "bg-red-200"
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Attendance Calendar
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-medium min-w-[140px] text-center">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">Loading calendar...</div>
        ) : (
          <>
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {/* Day headers */}
              {dayNames.map((day) => (
                <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                  {day}
                </div>
              ))}

              {/* Calendar days */}
              {getDaysInMonth(currentDate).map((day, index) => {
                if (day === null) {
                  return <div key={index} className="p-2" />
                }

                const dayRecords = getAttendanceForDate(day)
                const statusColor = getStatusColor(dayRecords)
                const isToday =
                  new Date().toDateString() ===
                  new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString()

                return (
                  <div
                    key={day}
                    className={`
                      p-2 text-center text-sm border rounded-md cursor-pointer hover:bg-gray-50
                      ${statusColor}
                      ${isToday ? "ring-2 ring-primary" : ""}
                    `}
                    title={dayRecords.length > 0 ? `${dayRecords.length} record(s)` : "No records"}
                  >
                    <div className="font-medium">{day}</div>
                    {dayRecords.length > 0 && (
                      <div className="flex justify-center mt-1">
                        <div className="w-2 h-2 rounded-full bg-current opacity-60" />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-200 rounded" />
                <span>Present</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-yellow-200 rounded" />
                <span>Late</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-200 rounded" />
                <span>WFH</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-200 rounded" />
                <span>Absent</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-gray-100 rounded" />
                <span>No Record</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
