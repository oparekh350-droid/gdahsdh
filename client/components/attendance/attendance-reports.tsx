"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, FileText, Calendar, TrendingUp } from "lucide-react"
import { AttendanceCalendar } from "./attendance-calendar"
import { attendanceService } from "@/lib/attendance-service"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "@/hooks/use-toast"
import type { AttendanceRecord } from "../../../shared/types"
import * as XLSX from "xlsx"
import jsPDF from "jspdf"

export function AttendanceReports() {
  const { user, business } = useAuth()
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [monthlyData, setMonthlyData] = useState<AttendanceRecord[]>([])
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadMonthlyData()
  }, [selectedMonth, selectedYear, business?.id, user?.id])

  const loadMonthlyData = async () => {
    if (!business?.id || !user?.id) return

    setIsLoading(true)
    try {
      const records = await attendanceService.getMonthlyAttendance(business.id, selectedYear, selectedMonth)
      const userRecords = records.filter((r) => r.staffId === user.id)
      setMonthlyData(userRecords)

      const monthStats = await attendanceService.getAttendanceStats(business.id, user.id, selectedMonth, selectedYear)
      setStats(monthStats)
    } catch (error) {
      console.error("Failed to load monthly data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const exportCSV = async () => {
    const csvContent = generateCSVContent()
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `attendance-${selectedYear}-${selectedMonth.toString().padStart(2, "0")}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    toast({
      title: "Export Successful",
      description: "Attendance report has been downloaded as CSV",
    })
  }

  const exportExcel = () => {
    const headers = ["Date", "Check In", "Check Out", "Location", "Status", "Working Hours"]
    const rows = monthlyData.map((record) => ({
      Date: record.date,
      "Check In": record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString() : "-",
      "Check Out": record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString() : "-",
      Location: record.location,
      Status: record.status,
      "Working Hours": record.workingHours ?? "-",
    }))
    const worksheet = XLSX.utils.json_to_sheet(rows, { header: headers })
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance")
    XLSX.writeFile(workbook, `attendance-${selectedYear}-${selectedMonth.toString().padStart(2, "0")}.xlsx`)

    toast({ title: "Export Successful", description: "Excel file downloaded" })
  }

  const exportPDF = () => {
    const doc = new jsPDF()
    doc.setFontSize(14)
    doc.text("Attendance Report", 14, 16)
    doc.setFontSize(10)
    doc.text(`Period: ${selectedYear}-${selectedMonth.toString().padStart(2, "0")}`, 14, 22)

    let y = 30
    const lineHeight = 6
    doc.text("Date | In | Out | Loc | Status | Hours", 14, y)
    y += lineHeight
    monthlyData.forEach((r) => {
      const line = `${r.date} | ${r.checkInTime ? new Date(r.checkInTime).toLocaleTimeString() : "-"} | ${r.checkOutTime ? new Date(r.checkOutTime).toLocaleTimeString() : "-"} | ${r.location} | ${r.status} | ${r.workingHours ?? "-"}`
      doc.text(line, 14, y)
      y += lineHeight
      if (y > 280) {
        doc.addPage()
        y = 20
      }
    })

    doc.save(`attendance-${selectedYear}-${selectedMonth.toString().padStart(2, "0")}.pdf`)
    toast({ title: "Export Successful", description: "PDF downloaded" })
  }

  const exportPayrollCSV = () => {
    const headers = ["Date", "Present", "Hours", "OvertimeHours"]
    const rows = monthlyData.map((r) => {
      const hours = r.workingHours || 0
      const overtime = Math.max(0, hours - 8)
      return [r.date, r.status === "present" ? 1 : 0, hours, overtime]
    })
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `payroll-${selectedYear}-${selectedMonth.toString().padStart(2, "0")}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    toast({ title: "Export Successful", description: "Payroll summary CSV downloaded" })
  }

  const generateCSVContent = () => {
    const headers = ["Date", "Check In", "Check Out", "Location", "Status", "Working Hours"]
    const rows = monthlyData.map((record) => [
      record.date,
      record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString() : "-",
      record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString() : "-",
      record.location,
      record.status,
      record.workingHours ? `${record.workingHours}h` : "-",
    ])

    return [headers, ...rows].map((row) => row.join(",")).join("\n")
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Attendance Reports</h2>
        <div className="flex gap-2">
          <Button onClick={exportCSV} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
          <Button onClick={exportExcel} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Excel
          </Button>
          <Button onClick={exportPDF} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
          <Button onClick={exportPayrollCSV} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Payroll CSV
          </Button>
        </div>
      </div>

      {/* Month/Year Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Report Period
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Month</label>
              <Select
                value={selectedMonth.toString()}
                onValueChange={(value) => setSelectedMonth(Number.parseInt(value))}
              >
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
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Year</label>
              <Select
                value={selectedYear.toString()}
                onValueChange={(value) => setSelectedYear(Number.parseInt(value))}
              >
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
        </CardContent>
      </Card>

      {/* Monthly Statistics */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Days</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDays}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Present Days</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.presentDays}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Attendance %</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.attendancePercentage.toFixed(1)}%</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Late Days</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.lateDays}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Calendar View */}
      <AttendanceCalendar staffId={user?.id} />

      {/* Detailed Records */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Records</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">Loading records...</div>
          ) : (
            <div className="space-y-2">
              {monthlyData.length > 0 ? (
                monthlyData.map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">{new Date(record.date).toLocaleDateString()}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant={record.status === "present" ? "default" : "secondary"}>{record.status}</Badge>
                        <Badge variant="outline">
                          {record.location === "wfh" ? "WFH" : record.location === "onsite" ? "On-site" : "Field"}
                        </Badge>
                        {record.isLate && <Badge variant="destructive">Late</Badge>}
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      {record.checkInTime && <div>In: {new Date(record.checkInTime).toLocaleTimeString()}</div>}
                      {record.checkOutTime && <div>Out: {new Date(record.checkOutTime).toLocaleTimeString()}</div>}
                      {record.workingHours && (
                        <div className="text-muted-foreground">{record.workingHours}h worked</div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No attendance records found for this period
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
