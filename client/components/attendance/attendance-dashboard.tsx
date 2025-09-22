"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Clock } from "lucide-react"
import { CheckInWidget } from "./check-in-widget"
import { AttendanceReports } from "./attendance-reports"
import { attendanceService } from "@/lib/attendance-service"
import { useAuth } from "@/hooks/use-auth"
import type { AttendanceRecord } from "../../../shared/types"

export function AttendanceDashboard() {
  const { user, business } = useAuth()
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord[]>([])
  const [monthlyStats, setMonthlyStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadAttendanceData()
  }, [business?.id])

  const loadAttendanceData = async () => {
    if (!business?.id) return

    setIsLoading(true)
    try {
      const today = await attendanceService.getTodayAttendance(business.id)
      setTodayAttendance(today)

      if (user?.id) {
        const now = new Date()
        const stats = await attendanceService.getAttendanceStats(
          business.id,
          user.id,
          now.getMonth() + 1,
          now.getFullYear(),
        )
        setMonthlyStats(stats)
      }
    } catch (error) {
      console.error("Failed to load attendance data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading attendance data...</div>
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="checkin" className="space-y-6">
        <TabsList>
          <TabsTrigger value="checkin">Check In/Out</TabsTrigger>
          <TabsTrigger value="today">Today's Attendance</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="checkin" className="space-y-6">
          <div className="flex justify-center">
            <CheckInWidget />
          </div>
        </TabsContent>

        <TabsContent value="today" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{todayAttendance.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Present</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {todayAttendance.filter((r) => r.status === "present").length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Late</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {todayAttendance.filter((r) => r.isLate).length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">WFH</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {todayAttendance.filter((r) => r.location === "wfh").length}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Today's Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {todayAttendance.map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">Staff ID: {record.staffId}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant={record.status === "present" ? "default" : "secondary"}>{record.status}</Badge>
                        <Badge variant="outline">
                          {record.location === "wfh"
                            ? "Work from Home"
                            : record.location === "onsite"
                              ? "On-site"
                              : "Field Work"}
                        </Badge>
                        {record.isLate && <Badge variant="destructive">Late</Badge>}
                      </div>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      {record.checkInTime && <div>In: {new Date(record.checkInTime).toLocaleTimeString()}</div>}
                      {record.checkOutTime && <div>Out: {new Date(record.checkOutTime).toLocaleTimeString()}</div>}
                    </div>
                  </div>
                ))}
                {todayAttendance.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">No attendance records for today</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <AttendanceReports />
        </TabsContent>
      </Tabs>
    </div>
  )
}
