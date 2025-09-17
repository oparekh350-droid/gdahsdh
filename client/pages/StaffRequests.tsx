"use client"

import { useState, useEffect } from "react"
import { Check, X, Clock, User, Mail, Phone, Calendar, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { staffRequestRepository } from "@/services/indexeddb/repositories/staffRequestRepository"
import { notificationService } from "@/lib/notification-service"
import { authService } from "@/lib/auth-service"
import type { StaffRequest } from "@/lib/validators/staffRequest"

export default function StaffRequests() {
  const [requests, setRequests] = useState<StaffRequest[]>([])
  const [selectedRequest, setSelectedRequest] = useState<StaffRequest | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const user = authService.getCurrentUser()
  const businessData = authService.getBusinessData()

  useEffect(() => {
    loadRequests()
  }, [])

  const loadRequests = async () => {
    if (!businessData?.businessCode) return

    try {
      const allRequests = await staffRequestRepository.getByBusinessCode(businessData.businessCode)
      setRequests(allRequests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
    } catch (error) {
      console.error("Failed to load staff requests:", error)
    }
  }

  const handleApprove = async (requestId: string) => {
    setIsLoading(true)
    setError("")

    try {
      const approvedRequest = await staffRequestRepository.approve(requestId)

      if (approvedRequest) {
        await notificationService.sendNotification({
          type: "staff_approved",
          title: "Staff Request Approved",
          message: `Your request to join ${businessData?.businessName} has been approved. You can now sign in with your credentials.`,
          recipientId: approvedRequest.email,
          businessId: businessData?.id || "",
          metadata: {
            businessCode: businessData?.businessCode,
            staffName: approvedRequest.name,
          },
        })

        await loadRequests()
      }
    } catch (error: any) {
      setError(error.message || "Failed to approve request")
    } finally {
      setIsLoading(false)
    }
  }

  const handleReject = async (requestId: string) => {
    setIsLoading(true)
    setError("")

    try {
      const rejectedRequest = await staffRequestRepository.reject(requestId, rejectionReason)

      if (rejectedRequest) {
        await notificationService.sendNotification({
          type: "staff_rejected",
          title: "Staff Request Rejected",
          message: `Your request to join ${businessData?.businessName} has been rejected. ${rejectionReason ? `Reason: ${rejectionReason}` : ""}`,
          recipientId: rejectedRequest.email,
          businessId: businessData?.id || "",
          metadata: {
            businessCode: businessData?.businessCode,
            staffName: rejectedRequest.name,
            reason: rejectionReason,
          },
        })

        await loadRequests()
        setSelectedRequest(null)
        setRejectionReason("")
      }
    } catch (error: any) {
      setError(error.message || "Failed to reject request")
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      PENDING: "bg-yellow-100 text-yellow-800",
      ACTIVE: "bg-green-100 text-green-800",
      REJECTED: "bg-red-100 text-red-800",
    }
    return variants[status as keyof typeof variants] || variants.PENDING
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock className="h-4 w-4" />
      case "ACTIVE":
        return <Check className="h-4 w-4" />
      case "REJECTED":
        return <X className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const pendingRequests = requests.filter((req) => req.status === "PENDING")
  const processedRequests = requests.filter((req) => req.status !== "PENDING")

  if (!user || !authService.hasPermission("manage_team")) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertDescription>You don't have permission to manage staff requests.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Requests</h1>
          <p className="text-gray-600">Review and manage staff join requests</p>
        </div>

        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="text-sm">
            {pendingRequests.length} Pending
          </Badge>
          <Badge variant="outline" className="text-sm">
            Business Code: {businessData?.businessCode}
          </Badge>
        </div>
      </div>

      {error && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 text-orange-600">Pending Approval</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingRequests.map((request) => (
              <Card key={request.id} className="border-orange-200 bg-orange-50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-orange-600" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{request.name}</CardTitle>
                        <Badge className={getStatusBadge(request.status)}>
                          {getStatusIcon(request.status)}
                          <span className="ml-1">{request.status}</span>
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-4 w-4 mr-2" />
                      {request.email}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-2" />
                      {request.phone}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(request.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <Button size="sm" onClick={() => handleApprove(request.id)} disabled={isLoading} className="flex-1">
                      <Check className="h-4 w-4 mr-1" />
                      Approve
                    </Button>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedRequest(request)}
                          disabled={isLoading}
                          className="flex-1"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Reject Staff Request</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <p className="text-sm text-gray-600">
                            Are you sure you want to reject {request.name}'s request to join your team?
                          </p>

                          <div>
                            <Label htmlFor="reason">Reason (Optional)</Label>
                            <Textarea
                              id="reason"
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              placeholder="Provide a reason for rejection..."
                              rows={3}
                            />
                          </div>

                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => setSelectedRequest(null)}>
                              Cancel
                            </Button>
                            <Button variant="destructive" onClick={() => handleReject(request.id)} disabled={isLoading}>
                              {isLoading ? "Rejecting..." : "Reject Request"}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Processed Requests */}
      {processedRequests.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Request History</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {processedRequests.map((request) => (
              <Card key={request.id} className="opacity-75">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{request.name}</CardTitle>
                        <Badge className={getStatusBadge(request.status)}>
                          {getStatusIcon(request.status)}
                          <span className="ml-1">{request.status}</span>
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    {request.email}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    {new Date(request.createdAt).toLocaleDateString()}
                  </div>
                  {request.reason && (
                    <div className="text-sm text-red-600 mt-2">
                      <strong>Reason:</strong> {request.reason}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {requests.length === 0 && (
        <div className="text-center py-12">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No staff requests found.</p>
          <p className="text-sm text-gray-400 mt-2">
            Staff members can request to join using your business code: <strong>{businessData?.businessCode}</strong>
          </p>
        </div>
      )}
    </div>
  )
}
