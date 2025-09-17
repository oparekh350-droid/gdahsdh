import { attendanceRepository } from "../services/indexeddb/repositories/attendanceRepository"
import { leaveRepository } from "../services/indexeddb/repositories/leaveRepository"
import { notificationService } from "./notification-service"
import type { AttendanceRecord, LeaveRequest, WorkLocation } from "../../shared/types"
import { businessRepository } from "@/services/indexeddb/repositories/businessRepository"

class AttendanceService {
  async checkIn(
    businessId: string,
    staffId: string,
    location: WorkLocation,
    coordinates?: { lat: number; lng: number },
  ): Promise<AttendanceRecord> {
    try {
      // Validate business exists (enforces valid Business Code context)
      const business = await businessRepository.findById(businessId)
      if (!business) {
        throw new Error("Invalid Business Code. Please join a valid business to check in.")
      }

      const record = await attendanceRepository.checkIn(businessId, staffId, location, coordinates)

      // Send notification to owner
      await notificationService.createNotification({
        businessId,
        recipientId: "owner",
        type: "staff_checkin",
        title: "Staff Check-in",
        message: `Staff member has checked in (${location})`,
        data: { staffId, recordId: record.id },
      })

      return record
    } catch (error) {
      throw new Error(`Check-in failed: ${error.message}`)
    }
  }

  async checkOut(businessId: string, staffId: string): Promise<void> {
    try {
      await attendanceRepository.checkOut(businessId, staffId)

      // Send notification to owner
      await notificationService.createNotification({
        businessId,
        recipientId: "owner",
        type: "staff_checkout",
        title: "Staff Check-out",
        message: "Staff member has checked out",
        data: { staffId },
      })
    } catch (error) {
      throw new Error(`Check-out failed: ${error.message}`)
    }
  }

  async getTodayAttendance(businessId: string): Promise<AttendanceRecord[]> {
    const today = new Date().toISOString().split("T")[0]
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    return attendanceRepository.getByDateRange(businessId, today, tomorrow)
  }

  async getMonthlyAttendance(businessId: string, year: number, month: number): Promise<AttendanceRecord[]> {
    const startDate = `${year}-${month.toString().padStart(2, "0")}-01`
    const endDate = `${year}-${month.toString().padStart(2, "0")}-31`
    return attendanceRepository.getByDateRange(businessId, startDate, endDate)
  }

  async requestLeave(
    businessId: string,
    staffId: string,
    startDate: string,
    endDate: string,
    type: string,
    reason: string,
  ): Promise<LeaveRequest> {
    const request = await leaveRepository.create({
      businessId,
      staffId,
      startDate,
      endDate,
      type: type as any,
      reason,
      status: "pending",
      requestedAt: new Date().toISOString(),
    })

    // Notify owner of leave request
    await notificationService.createNotification({
      businessId,
      recipientId: "owner",
      type: "leave_request",
      title: "Leave Request",
      message: `Staff member has requested leave from ${startDate} to ${endDate}`,
      data: { staffId, requestId: request.id },
    })

    return request
  }

  async approveLeave(requestId: string, approvedBy: string): Promise<void> {
    await leaveRepository.approveLeave(requestId, approvedBy)
  }

  async rejectLeave(requestId: string, rejectedBy: string, reason?: string): Promise<void> {
    await leaveRepository.rejectLeave(requestId, rejectedBy, reason)
  }

  async getAttendanceStats(businessId: string, staffId: string, month: number, year: number) {
    const records = await this.getMonthlyAttendance(businessId, year, month)
    const staffRecords = records.filter((r) => r.staffId === staffId)

    const totalDays = staffRecords.length
    const presentDays = staffRecords.filter((r) => r.status === "present").length
    const lateDays = staffRecords.filter((r) => r.isLate).length

    return {
      totalDays,
      presentDays,
      absentDays: totalDays - presentDays,
      lateDays,
      attendancePercentage: totalDays > 0 ? (presentDays / totalDays) * 100 : 0,
    }
  }
}

export const attendanceService = new AttendanceService()
