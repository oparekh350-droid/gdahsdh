"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AttendanceDashboard } from "./attendance-dashboard"
import { LeaveManagement } from "./leave-management"
import { GeoFenceSetup } from "./geo-fence-setup"
import { ShiftManagement } from "./shift-management"
import { AttendanceAnalytics } from "./attendance-analytics"
import { useAuth } from "@/hooks/use-auth"
import { PremiumGate } from "@/components/PremiumGate"
import { planService } from "@/lib/plan-service"

export function AttendanceMain() {
  const { user } = useAuth()
  const isOwnerOrManager = user?.role === "owner" || user?.role === "co_founder" || user?.role === "manager"
  const hasAdvanced = planService.isFeatureAvailable("advanced-attendance")

  return (
    <div className="space-y-6">
      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="leave">Leave</TabsTrigger>
          {isOwnerOrManager && (
            <>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="shifts">Shifts</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="dashboard">
          <AttendanceDashboard />
        </TabsContent>

        <TabsContent value="leave">
          <LeaveManagement />
        </TabsContent>

        {isOwnerOrManager && (
          <>
            <TabsContent value="analytics">
              <PremiumGate
                featureId="advanced-attendance"
                featureName="Advanced Attendance Analytics"
                description="Unlock geo-fencing, late/OT insights, trendlines and exports with Premium."
                showPreview={!hasAdvanced}
              >
                <AttendanceAnalytics />
              </PremiumGate>
            </TabsContent>

            <TabsContent value="shifts">
              <PremiumGate
                featureId="advanced-attendance"
                featureName="Shift & Break Management"
                description="Define shifts, breaks, lateness and OT rules in Premium."
                showPreview={!hasAdvanced}
              >
                <ShiftManagement />
              </PremiumGate>
            </TabsContent>

            <TabsContent value="settings">
              <PremiumGate
                featureId="advanced-attendance"
                featureName="Geo-fencing & Face Verification"
                description="Restrict check-ins by location and enable photo verification in Premium."
                showPreview={!hasAdvanced}
              >
                <GeoFenceSetup />
              </PremiumGate>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  )
}
