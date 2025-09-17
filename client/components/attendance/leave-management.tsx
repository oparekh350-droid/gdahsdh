"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Calendar, Clock, CheckCircle, XCircle } from "lucide-react"
import { LeaveRequestForm } from "./leave-request-form"
import { leaveRepository } from "@/services/indexeddb/repositories/leaveRepository"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "@/hooks/use-toast"
import type { LeaveRequest, LeaveStatus } from "../../../shared/types"

export function LeaveManagement() {
  const { user, business } = useAuth()
  const [myRequests, setMyRequests] = useState<LeaveRequest[]>([])
  const [pendingRequests, setPendingRequests] = useState<LeaveRequest[]>([])
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  const isOwnerOrManager = user?.role === "owner" || user?.role === "co_founder" || user?.role === "manager"

  useEffect(() => {
    loadLeaveData()
  }, [user?.id, business?.id])

  const loadLeaveData = async () => {
    if (!business?.id || !user?.id) return

    setIsLoading(true)
    try {
      // Load user's own requests
      const userRequests = await leaveRepository.getByStaffId(user.id)
      setMyRequests(userRequests.filter((r) => r.businessId === business.id))

      // Load pending requests for approval (if user has permission)
      if (isOwnerOrManager) {
        const pending = await leaveRepository.getPendingRequests(business.id)
        setPendingRequests(pending)
      }
    } catch (error) {
      console.error("Failed to load leave data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async (requestId: string) => {
    if (!user?.id) return

    try {
      await leaveRepository.approveLeave(requestId, user.id)
      await loadLeaveData()

      toast({
        title: "Leave approved",
        description: "Leave request has been approved successfully",
      })
    } catch (error) {
      toast({
        title: "Failed to approve",
        description: "Please try again",
        variant: "destructive",
      })
    }
  }

  const handleReject = async (requestId: string) => {
    if (!user?.id) return

    try {
      await leaveRepository.rejectLeave(requestId, user.id, rejectionReason)
      await loadLeaveData()
      setIsDialogOpen(false)
      setRejectionReason("")

      toast({
        title: "Leave rejected",
        description: "Leave request has been rejected",
      })
    } catch (error) {
      toast({
        title: "Failed to reject",
        description: "Please try again",
        variant: "destructive",
      })
    }
  }

  const openRejectDialog = (request: LeaveRequest) => {
    setSelectedRequest(request)
    setIsDialogOpen(true)
  }

  const getStatusColor = (status: LeaveStatus) => {
    switch (status) {
      case "approved":
        return "default"
      case "rejected":
        return "destructive"
      case "pending":
        return "secondary"
      default:
        return "outline"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const calculateDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
  }

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading leave data...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Leave Management</h1>
      </div>

      <Tabs defaultValue="request" className="space-y-6">
        <TabsList>
          <TabsTrigger value="request">Request Leave</TabsTrigger>
          <TabsTrigger value="my-requests">My Requests</TabsTrigger>
          {isOwnerOrManager && (
            <TabsTrigger value="approvals">
              Pending Approvals
              {pendingRequests.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {pendingRequests.length}
                </Badge>
              )}
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="request">
          <LeaveRequestForm onRequestSubmitted={loadLeaveData} />
        </TabsContent>

        <TabsContent value="my-requests" className="space-y-4">
          {myRequests.length > 0 ? (
            myRequests.map((request) => (
              <Card key={request.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold capitalize">{request.type} Leave</h3>
                        <Badge variant={getStatusColor(request.status)}>{request.status}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(request.startDate)} - {formatDate(request.endDate)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {calculateDays(request.startDate, request.endDate)} day
                          {calculateDays(request.startDate, request.endDate) !== 1 ? "s" : ""}
                        </div>
                      </div>
                      <p className="text-sm">{request.reason}</p>
                      {request.status === "rejected" && request.rejectionReason && (
                        <div className="p-3 bg-destructive/10 rounded-lg">
                          <p className="text-sm text-destructive">
                            <strong>Rejection Reason:</strong> {request.rejectionReason}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <div>Requested: {formatDate(request.requestedAt)}</div>
                      {request.approvedAt && <div>Approved: {formatDate(request.approvedAt)}</div>}
                      {request.rejectedAt && <div>Rejected: {formatDate(request.rejectedAt)}</div>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">No leave requests found</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {isOwnerOrManager && (
          <TabsContent value="approvals" className="space-y-4">
            {pendingRequests.length > 0 ? (
              pendingRequests.map((request) => (
                <Card key={request.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">
                            {request.staffName || request.staffId} - {request.type} Leave
                          </h3>
                          <Badge variant="secondary">Pending</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(request.startDate)} - {formatDate(request.endDate)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {calculateDays(request.startDate, request.endDate)} day
                            {calculateDays(request.startDate, request.endDate) !== 1 ? "s" : ""}
                          </div>
                        </div>
                        <p className="text-sm">{request.reason}</p>
                        <p className="text-xs text-muted-foreground">Requested on: {formatDate(request.requestedAt)}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(request.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => openRejectDialog(request)}>
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">No pending leave requests</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        )}
      </Tabs>

      {/* Rejection Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Leave Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rejectionReason">Reason for rejection</Label>
              <Textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please provide a reason for rejecting this leave request..."
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => selectedRequest && handleReject(selectedRequest.id)}
                disabled={!rejectionReason.trim()}
                className="flex-1"
              >
                Reject Request
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
