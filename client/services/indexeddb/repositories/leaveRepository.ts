import { getDB } from "../db"
import type { LeaveRequest, LeaveStatus } from "../../../../shared/types"

export class LeaveRepository {
  async create(request: Omit<LeaveRequest, "id">): Promise<LeaveRequest> {
    const db = await getDB()
    const id = crypto.randomUUID()
    const leaveRequest: LeaveRequest = { ...request, id }
    await db.add("leave_requests", leaveRequest)
    return leaveRequest
  }

  async getByBusinessId(businessId: string): Promise<LeaveRequest[]> {
    const db = await getDB()
    return db.getAllFromIndex("leave_requests", "businessId", businessId)
  }

  async getByStaffId(staffId: string): Promise<LeaveRequest[]> {
    const db = await getDB()
    return db.getAllFromIndex("leave_requests", "staffId", staffId)
  }

  async getPendingRequests(businessId: string): Promise<LeaveRequest[]> {
    const allRequests = await this.getByBusinessId(businessId)
    return allRequests.filter((request) => request.status === "pending")
  }

  async update(id: string, updates: Partial<LeaveRequest>): Promise<void> {
    const db = await getDB()
    const existing = await db.get("leave_requests", id)
    if (existing) {
      await db.put("leave_requests", { ...existing, ...updates })
    }
  }

  async approveLeave(id: string, approvedBy: string): Promise<void> {
    await this.update(id, {
      status: "approved" as LeaveStatus,
      approvedBy,
      approvedAt: new Date().toISOString(),
    })
  }

  async rejectLeave(id: string, rejectedBy: string, rejectionReason?: string): Promise<void> {
    await this.update(id, {
      status: "rejected" as LeaveStatus,
      rejectedBy,
      rejectedAt: new Date().toISOString(),
      rejectionReason,
    })
  }
}

export const leaveRepository = new LeaveRepository()
