"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, MapPin, Home, Building } from "lucide-react"
import { attendanceService } from "@/lib/attendance-service"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "@/hooks/use-toast"
import type { AttendanceRecord, WorkLocation } from "../../../shared/types"

export function CheckInWidget() {
  const { user, business } = useAuth()
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [location, setLocation] = useState<WorkLocation>("onsite")

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    loadTodayRecord()
  }, [user?.id, business?.id])

  const loadTodayRecord = async () => {
    if (!user?.id || !business?.id) return

    try {
      const records = await attendanceService.getTodayAttendance(business.id)
      const myRecord = records.find((r) => r.staffId === user.id)
      setTodayRecord(myRecord || null)
    } catch (error) {
      console.error("Failed to load today record:", error)
    }
  }

  const handleCheckIn = async () => {
    if (!user?.id || !business?.id) return

    setIsLoading(true)
    try {
      // Get location if geolocation is available
      let coordinates: { lat: number; lng: number } | undefined

      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 10000,
              enableHighAccuracy: true,
            })
          })
          coordinates = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
        } catch (error) {
          console.warn("Could not get location:", error)
        }
      }

      const record = await attendanceService.checkIn(business.id, user.id, location, coordinates)
      setTodayRecord(record)

      toast({
        title: "Checked In Successfully",
        description: `You've checked in for ${location === "wfh" ? "Work from Home" : location === "onsite" ? "On-site" : "Field Work"}`,
      })
    } catch (error) {
      toast({
        title: "Check-in Failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCheckOut = async () => {
    if (!user?.id || !business?.id) return

    setIsLoading(true)
    try {
      await attendanceService.checkOut(business.id, user.id)
      await loadTodayRecord()

      toast({
        title: "Checked Out Successfully",
        description: "Have a great day!",
      })
    } catch (error) {
      toast({
        title: "Check-out Failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (time: Date) => {
    return time.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    })
  }

  const getWorkingHours = () => {
    if (!todayRecord?.checkInTime || !todayRecord?.checkOutTime) return null

    const checkIn = new Date(todayRecord.checkInTime)
    const checkOut = new Date(todayRecord.checkOutTime)
    const diff = checkOut.getTime() - checkIn.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    return `${hours}h ${minutes}m`
  }

  return (
    <Card className="w-full max-w-md min-h-[140px]">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Clock className="h-5 w-5 md:h-6 md:w-6" />
          Attendance
        </CardTitle>
        <div className="text-2xl font-mono font-bold text-primary">{formatTime(currentTime)}</div>
        <div className="text-sm text-muted-foreground">
          {currentTime.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Location Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Work Location</label>
          <div className="flex gap-2">
            <Button
              variant={location === "onsite" ? "default" : "outline"}
              size="sm"
              onClick={() => setLocation("onsite")}
              className="flex-1"
            >
              <Building className="h-4 w-4 mr-1" />
              On-site
            </Button>
            <Button
              variant={location === "wfh" ? "default" : "outline"}
              size="sm"
              onClick={() => setLocation("wfh")}
              className="flex-1"
            >
              <Home className="h-4 w-4 mr-1" />
              WFH
            </Button>
          </div>
        </div>

        {/* Status Display */}
        {todayRecord ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status:</span>
              <Badge variant={todayRecord.checkOutTime ? "secondary" : "default"}>
                {todayRecord.checkOutTime ? "Checked Out" : "Checked In"}
              </Badge>
            </div>

            {todayRecord.checkInTime && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Check-in:</span>
                <span className="text-sm font-medium">
                  {new Date(todayRecord.checkInTime).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </span>
              </div>
            )}

            {todayRecord.checkOutTime && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Check-out:</span>
                <span className="text-sm font-medium">
                  {new Date(todayRecord.checkOutTime).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </span>
              </div>
            )}

            {getWorkingHours() && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Working Hours:</span>
                <span className="text-sm font-medium">{getWorkingHours()}</span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Location:</span>
              <div className="flex items-center gap-1">
                {todayRecord.location === "wfh" ? (
                  <Home className="h-3 w-3" />
                ) : todayRecord.location === "onsite" ? (
                  <Building className="h-3 w-3" />
                ) : (
                  <MapPin className="h-3 w-3" />
                )}
                <span className="text-sm font-medium capitalize">
                  {todayRecord.location === "wfh"
                    ? "Work from Home"
                    : todayRecord.location === "onsite"
                      ? "On-site"
                      : "Field Work"}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-4">You haven't checked in today</p>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2">
          {!todayRecord ? (
            <Button onClick={handleCheckIn} disabled={isLoading} className="w-full" size="lg">
              {isLoading ? "Checking In..." : "Check In"}
            </Button>
          ) : !todayRecord.checkOutTime ? (
            <Button
              onClick={handleCheckOut}
              disabled={isLoading}
              variant="outline"
              className="w-full bg-transparent"
              size="lg"
            >
              {isLoading ? "Checking Out..." : "Check Out"}
            </Button>
          ) : (
            <div className="text-center text-sm text-muted-foreground">You've completed your work for today</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
