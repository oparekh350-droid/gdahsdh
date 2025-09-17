import { getDB } from "../db"
import type { AttendanceRecord, AttendanceStatus, WorkLocation } from "../../../../shared/types"

export class AttendanceRepository {
  async create(record: Omit<AttendanceRecord, "id">): Promise<AttendanceRecord> {
    const db = await getDB()
    const id = crypto.randomUUID()
    const attendanceRecord: AttendanceRecord = { ...record, id }
    await db.add("attendance_records", attendanceRecord)
    return attendanceRecord
  }

  async getByBusinessId(businessId: string): Promise<AttendanceRecord[]> {
    const db = await getDB()
    return db.getAllFromIndex("attendance_records", "businessId", businessId)
  }

  async getByStaffId(staffId: string): Promise<AttendanceRecord[]> {
    const db = await getDB()
    return db.getAllFromIndex("attendance_records", "staffId", staffId)
  }

  async getByDateRange(businessId: string, startDate: string, endDate: string): Promise<AttendanceRecord[]> {
    const db = await getDB()
    const allRecords = await this.getByBusinessId(businessId)
    return allRecords.filter((record) => record.date >= startDate && record.date <= endDate)
  }

  async getTodayRecord(businessId: string, staffId: string): Promise<AttendanceRecord | null> {
    const today = new Date().toISOString().split("T")[0]
    const records = await this.getByStaffId(staffId)
    return records.find((record) => record.businessId === businessId && record.date === today) || null
  }

  async update(id: string, updates: Partial<AttendanceRecord>): Promise<void> {
    const db = await getDB()
    const existing = await db.get("attendance_records", id)
    if (existing) {
      await db.put("attendance_records", { ...existing, ...updates })
    }
  }

  async checkIn(
    businessId: string,
    staffId: string,
    location: WorkLocation,
    coordinates?: { lat: number; lng: number },
  ): Promise<AttendanceRecord> {
    const today = new Date().toISOString().split("T")[0]
    const now = new Date().toISOString()

    const existingRecord = await this.getTodayRecord(businessId, staffId)

    if (existingRecord) {
      throw new Error("Already checked in today")
    }

    return this.create({
      businessId,
      staffId,
      date: today,
      checkInTime: now,
      location,
      coordinates,
      status: "present" as AttendanceStatus,
    })
  }

  async checkOut(businessId: string, staffId: string): Promise<void> {
    const today = new Date().toISOString().split("T")[0]
    const now = new Date().toISOString()

    const record = await this.getTodayRecord(businessId, staffId)

    if (!record || !record.checkInTime) {
      throw new Error("No check-in record found for today")
    }

    if (record.checkOutTime) {
      throw new Error("Already checked out today")
    }

    await this.update(record.id, { checkOutTime: now })
  }
}

export const attendanceRepository = new AttendanceRepository()
