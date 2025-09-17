"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, Users, Clock, Target, DollarSign, AlertTriangle, Award } from "lucide-react"
import { attendanceService } from "@/lib/attendance-service"
import { useAuth } from "@/hooks/use-auth"
import type { AttendanceRecord } from "../../../shared/types"

interface StaffAnalytics {
  staffId: string
  staffName: string
  totalDays: number
  presentDays: number
  lateDays: number
  absentDays: number
  wfhDays: number
  attendancePercentage: number
  punctualityScore: number
  averageWorkingHours: number
  overtimeHours: number
}

interface BusinessAnalytics {
  totalStaff: number
  averageAttendance: number
  punctualityRate: number
  wfhUtilization: number
  totalWorkingHours: number
  overtimeCost: number
  trends: {
    attendance: number
    punctuality: number
    productivity: number
  }
}

export function AttendanceAnalytics() {
  const { business } = useAuth()
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [staffAnalytics, setStaffAnalytics] = useState<StaffAnalytics[]>([])
  const [businessAnalytics, setBusinessAnalytics] = useState<BusinessAnalytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadAnalytics()
  }, [selectedMonth, selectedYear, business?.id])

  const loadAnalytics = async () => {
    if (!business?.id) return

    setIsLoading(true)
    try {
      const records = await attendanceService.getMonthlyAttendance(business.id, selectedYear, selectedMonth)

      // Calculate staff analytics
      const staffMap = new Map<string, AttendanceRecord[]>()
      records.forEach((record) => {
        if (!staffMap.has(record.staffId)) {
          staffMap.set(record.staffId, [])
        }
        staffMap.get(record.staffId)!.push(record)
      })

      const staffAnalyticsData: StaffAnalytics[] = Array.from(staffMap.entries()).map(([staffId, staffRecords]) => {
        const totalDays = staffRecords.length
        const presentDays = staffRecords.filter((r) => r.status === "present").length
        const lateDays = staffRecords.filter((r) => r.isLate).length
        const absentDays = totalDays - presentDays
        const wfhDays = staffRecords.filter((r) => r.location === "wfh").length

        const attendancePercentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 0
        const punctualityScore = presentDays > 0 ? ((presentDays - lateDays) / presentDays) * 100 : 0

        const workingHoursRecords = staffRecords.filter((r) => r.workingHours)
        const averageWorkingHours =
          workingHoursRecords.length > 0
            ? workingHoursRecords.reduce((sum, r) => sum + (r.workingHours || 0), 0) / workingHoursRecords.length
            : 0

        const overtimeHours = workingHoursRecords.reduce((sum, r) => {
          const hours = r.workingHours || 0
          return sum + Math.max(0, hours - 8) // Assuming 8 hours is standard
        }, 0)

        return {
          staffId,
          staffName: `Staff ${staffId.slice(-4)}`, // Mock name
          totalDays,
          presentDays,
          lateDays,
          absentDays,
          wfhDays,
          attendancePercentage,
          punctualityScore,
          averageWorkingHours,
          overtimeHours,
        }
      })

      setStaffAnalytics(staffAnalyticsData)

      // Calculate business analytics
      const totalStaff = staffAnalyticsData.length
      const averageAttendance =
        totalStaff > 0 ? staffAnalyticsData.reduce((sum, s) => sum + s.attendancePercentage, 0) / totalStaff : 0

      const punctualityRate =
        totalStaff > 0 ? staffAnalyticsData.reduce((sum, s) => sum + s.punctualityScore, 0) / totalStaff : 0

      const wfhUtilization =
        records.length > 0 ? (records.filter((r) => r.location === "wfh").length / records.length) * 100 : 0

      const totalWorkingHours = staffAnalyticsData.reduce((sum, s) => sum + s.averageWorkingHours * s.presentDays, 0)
      const overtimeCost = staffAnalyticsData.reduce((sum, s) => sum + s.overtimeHours, 0) * 25 // $25/hour overtime

      setBusinessAnalytics({
        totalStaff,
        averageAttendance,
        punctualityRate,
        wfhUtilization,
        totalWorkingHours,
        overtimeCost,
        trends: {
          attendance: Math.random() > 0.5 ? 5.2 : -2.1, // Mock trend data
          punctuality: Math.random() > 0.5 ? 3.8 : -1.5,
          productivity: Math.random() > 0.5 ? 7.3 : -0.8,
        },
      })
    } catch (error) {
      console.error("Failed to load analytics:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const months = [
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

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600"
    if (percentage >= 75) return "text-yellow-600"
    return "text-red-600"
  }

  const getPerformanceBadge = (percentage: number) => {
    if (percentage >= 95) return { label: "Excellent", variant: "default" as const }
    if (percentage >= 85) return { label: "Good", variant: "secondary" as const }
    if (percentage >= 70) return { label: "Average", variant: "outline" as const }
    return { label: "Needs Improvement", variant: "destructive" as const }
  }

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading analytics...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Attendance Analytics</h1>
        <div className="flex gap-4">
          <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(Number.parseInt(value))}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((month, index) => (
                <SelectItem key={month} value={(index + 1).toString()}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(Number.parseInt(value))}>
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Business Overview */}
      {businessAnalytics && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Attendance</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{businessAnalytics.averageAttendance.toFixed(1)}%</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  {businessAnalytics.trends.attendance > 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1 text-red-600" />
                  )}
                  {Math.abs(businessAnalytics.trends.attendance)}% from last month
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Punctuality Rate</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{businessAnalytics.punctualityRate.toFixed(1)}%</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  {businessAnalytics.trends.punctuality > 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1 text-red-600" />
                  )}
                  {Math.abs(businessAnalytics.trends.punctuality)}% from last month
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">WFH Utilization</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{businessAnalytics.wfhUtilization.toFixed(1)}%</div>
                <div className="text-xs text-muted-foreground">{businessAnalytics.totalStaff} total staff</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overtime Cost</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${businessAnalytics.overtimeCost.toFixed(0)}</div>
                <div className="text-xs text-muted-foreground">
                  {businessAnalytics.totalWorkingHours.toFixed(0)} total hours
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Performance Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Attendance Trend</span>
                    {businessAnalytics.trends.attendance > 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <Progress value={Math.abs(businessAnalytics.trends.attendance) * 10} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {businessAnalytics.trends.attendance > 0 ? "Improving" : "Declining"} by{" "}
                    {Math.abs(businessAnalytics.trends.attendance)}%
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Punctuality Trend</span>
                    {businessAnalytics.trends.punctuality > 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <Progress value={Math.abs(businessAnalytics.trends.punctuality) * 10} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {businessAnalytics.trends.punctuality > 0 ? "Improving" : "Declining"} by{" "}
                    {Math.abs(businessAnalytics.trends.punctuality)}%
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Productivity Trend</span>
                    {businessAnalytics.trends.productivity > 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <Progress value={Math.abs(businessAnalytics.trends.productivity) * 10} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {businessAnalytics.trends.productivity > 0 ? "Improving" : "Declining"} by{" "}
                    {Math.abs(businessAnalytics.trends.productivity)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Staff Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Staff Performance Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {staffAnalytics.length > 0 ? (
              staffAnalytics.map((staff) => {
                const performanceBadge = getPerformanceBadge(staff.attendancePercentage)

                return (
                  <div key={staff.staffId} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h4 className="font-medium">{staff.staffName}</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant={performanceBadge.variant}>{performanceBadge.label}</Badge>
                          <span className="text-sm text-muted-foreground">ID: {staff.staffId.slice(-6)}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${getPerformanceColor(staff.attendancePercentage)}`}>
                          {staff.attendancePercentage.toFixed(1)}%
                        </div>
                        <div className="text-sm text-muted-foreground">Attendance</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="font-medium text-green-600">{staff.presentDays}</div>
                        <div className="text-muted-foreground">Present Days</div>
                      </div>
                      <div>
                        <div className="font-medium text-yellow-600">{staff.lateDays}</div>
                        <div className="text-muted-foreground">Late Days</div>
                      </div>
                      <div>
                        <div className="font-medium text-blue-600">{staff.wfhDays}</div>
                        <div className="text-muted-foreground">WFH Days</div>
                      </div>
                      <div>
                        <div className="font-medium">{staff.averageWorkingHours.toFixed(1)}h</div>
                        <div className="text-muted-foreground">Avg Hours</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Punctuality Score</span>
                        <span className={getPerformanceColor(staff.punctualityScore)}>
                          {staff.punctualityScore.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={staff.punctualityScore} className="h-2" />
                    </div>

                    {staff.overtimeHours > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <span className="text-muted-foreground">
                          {staff.overtimeHours.toFixed(1)} overtime hours this month
                        </span>
                      </div>
                    )}
                  </div>
                )
              })
            ) : (
              <div className="text-center py-8 text-muted-foreground">No staff data available for this period</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
