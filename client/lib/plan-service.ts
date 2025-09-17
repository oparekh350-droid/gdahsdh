import { authService } from "@/lib/auth-service"
import { notificationService } from "@/lib/notification-service"

export type PlanType = "FREE" | "PREMIUM"

export interface PlanLimits {
  maxStaff: number
  hasAdvancedAnalytics: boolean
  hasFullNotifications: boolean
  hasSupportTickets: boolean
  hasTaskAllotment: boolean
  hasDocumentation: boolean
  hasAdvancedAttendance: boolean
  hasExportFeatures: boolean
  hasLeaderboards: boolean
  hasTrendAnalysis: boolean
  hasEBITDACalculation: boolean
  hasPATCalculation: boolean
}

export interface PlanFeature {
  id: string
  name: string
  description: string
  category: "analytics" | "staff" | "communication" | "productivity" | "reports"
  isPremiumOnly: boolean
}

class PlanService {
  private readonly PLAN_LIMITS: Record<PlanType, PlanLimits> = {
    FREE: {
      maxStaff: 3,
      hasAdvancedAnalytics: false,
      hasFullNotifications: false,
      hasSupportTickets: false,
      hasTaskAllotment: false,
      hasDocumentation: false,
      hasAdvancedAttendance: false,
      hasExportFeatures: false,
      hasLeaderboards: false,
      hasTrendAnalysis: false,
      hasEBITDACalculation: false,
      hasPATCalculation: false,
    },
    PREMIUM: {
      maxStaff: 30,
      hasAdvancedAnalytics: true,
      hasFullNotifications: true,
      hasSupportTickets: true,
      hasTaskAllotment: true,
      hasDocumentation: true,
      hasAdvancedAttendance: true,
      hasExportFeatures: true,
      hasLeaderboards: true,
      hasTrendAnalysis: true,
      hasEBITDACalculation: true,
      hasPATCalculation: true,
    },
  }

  private readonly PREMIUM_FEATURES: PlanFeature[] = [
    {
      id: "advanced-analytics",
      name: "Advanced Analytics",
      description: "Gross/net profit, EBITDA, PAT calculations with detailed insights",
      category: "analytics",
      isPremiumOnly: true,
    },
    {
      id: "support-tickets",
      name: "Support Ticket System",
      description: "Staff can raise tickets, owners/admins can resolve them",
      category: "communication",
      isPremiumOnly: true,
    },
    {
      id: "task-allotment",
      name: "Task Allotment",
      description: "Assign tasks with deadlines, statuses, and progress tracking",
      category: "productivity",
      isPremiumOnly: true,
    },
    {
      id: "documentation",
      name: "Documentation Center",
      description: "Upload/share files, SOPs, training materials",
      category: "productivity",
      isPremiumOnly: true,
    },
    {
      id: "advanced-attendance",
      name: "Advanced Staff Attendance",
      description: "Detailed attendance tracking with location, overtime, and reports",
      category: "staff",
      isPremiumOnly: true,
    },
    {
      id: "full-notifications",
      name: "Full Notification System",
      description: "In-app notifications with bell icon, categories, mark as read",
      category: "communication",
      isPremiumOnly: true,
    },
    {
      id: "leaderboards",
      name: "Staff Leaderboards",
      description: "Performance rankings and achievement tracking",
      category: "staff",
      isPremiumOnly: true,
    },
    {
      id: "trend-analysis",
      name: "Trend Analysis",
      description: "Historical data analysis and forecasting",
      category: "analytics",
      isPremiumOnly: true,
    },
    {
      id: "export-features",
      name: "Export to Excel/PDF",
      description: "Export reports and data in multiple formats",
      category: "reports",
      isPremiumOnly: true,
    },
    {
      id: "extended-staff",
      name: "Up to 30 Staff Members",
      description: "Manage larger teams with extended staff limits",
      category: "staff",
      isPremiumOnly: true,
    },
  ]

  getCurrentPlan(): PlanType {
    const businessData = authService.getBusinessData()
    return businessData?.plan || "FREE"
  }

  getPlanLimits(plan?: PlanType): PlanLimits {
    const currentPlan = plan || this.getCurrentPlan()
    return this.PLAN_LIMITS[currentPlan]
  }

  isFeatureAvailable(featureId: string): boolean {
    const currentPlan = this.getCurrentPlan()
    const limits = this.getPlanLimits(currentPlan)

    switch (featureId) {
      case "advanced-analytics":
        return limits.hasAdvancedAnalytics
      case "support-tickets":
        return limits.hasSupportTickets
      case "task-allotment":
        return limits.hasTaskAllotment
      case "documentation":
        return limits.hasDocumentation
      case "advanced-attendance":
        return limits.hasAdvancedAttendance
      case "full-notifications":
        return limits.hasFullNotifications
      case "leaderboards":
        return limits.hasLeaderboards
      case "trend-analysis":
        return limits.hasTrendAnalysis
      case "export-features":
        return limits.hasExportFeatures
      case "ebitda-calculation":
        return limits.hasEBITDACalculation
      case "pat-calculation":
        return limits.hasPATCalculation
      default:
        return true // Default features are available to all plans
    }
  }

  canAddMoreStaff(): { allowed: boolean; currentCount: number; maxAllowed: number; message?: string } {
    const currentPlan = this.getCurrentPlan()
    const limits = this.getPlanLimits(currentPlan)

    // This would need to be implemented to get actual staff count
    // For now, returning mock data
    const currentStaffCount = 0 // TODO: Get from staff service

    return {
      allowed: currentStaffCount < limits.maxStaff,
      currentCount: currentStaffCount,
      maxAllowed: limits.maxStaff,
      message:
        currentStaffCount >= limits.maxStaff
          ? `Staff limit reached for ${currentPlan} plan (${limits.maxStaff} max). Upgrade to Premium for up to 30 staff members.`
          : undefined,
    }
  }

  getPremiumFeatures(): PlanFeature[] {
    return this.PREMIUM_FEATURES
  }

  getFeaturesByCategory(category: PlanFeature["category"]): PlanFeature[] {
    return this.PREMIUM_FEATURES.filter((feature) => feature.category === category)
  }

  isPremiumUser(): boolean {
    return this.getCurrentPlan() === "PREMIUM"
  }

  showUpgradePrompt(featureName: string): void {
    notificationService.info(
      "Premium Feature",
      `${featureName} is available in Premium plan. Upgrade to unlock this feature.`,
    )
  }

  async upgradeToPremium(): Promise<{ success: boolean; message: string }> {
    try {
      const user = authService.getCurrentUser()
      if (!user) {
        return { success: false, message: "User not authenticated" }
      }

      // This would integrate with actual payment processing
      // For now, we'll simulate the upgrade
      const { businessRepository } = await import("@/services/indexeddb/repositories/businessRepository")
      const business = await businessRepository.findById(user.businessId)

      if (!business) {
        return { success: false, message: "Business not found" }
      }

      const updatedBusiness = await businessRepository.setPlan(business.id, "PREMIUM")

      if (updatedBusiness) {
        // Update local storage
        const businessData = authService.getBusinessData()
        if (businessData) {
          businessData.plan = "PREMIUM"
          localStorage.setItem("hisaabb_business_data", JSON.stringify(businessData))
        }

        notificationService.success(
          "Upgrade Successful",
          "Your business has been upgraded to Premium! All premium features are now available.",
        )

        return { success: true, message: "Successfully upgraded to Premium plan" }
      }

      return { success: false, message: "Failed to upgrade plan" }
    } catch (error) {
      return { success: false, message: "Upgrade failed. Please try again." }
    }
  }

  getUpgradeUrl(): string {
    // This would return the actual payment URL
    return "/upgrade-to-premium"
  }

  // Module filtering based on plan
  filterModulesByPlan(modules: any[]): any[] {
    const currentPlan = this.getCurrentPlan()

    return modules.map((module) => {
      // Mark premium-only modules
      const isPremiumModule = this.isPremiumOnlyModule(module.id)

      return {
        ...module,
        isPremiumOnly: isPremiumModule,
        isAvailable: isPremiumModule ? currentPlan === "PREMIUM" : true,
        upgradeRequired: isPremiumModule && currentPlan === "FREE",
      }
    })
  }

  private isPremiumOnlyModule(moduleId: string): boolean {
    const premiumModules = [
      "support-tickets",
      "task-management",
      "documentation-center",
      "advanced-analytics",
      "staff-leaderboards",
      "advanced-attendance",
      "trend-analysis",
    ]

    return premiumModules.includes(moduleId)
  }

  // Analytics filtering
  filterAnalyticsByPlan(analytics: any): any {
    const currentPlan = this.getCurrentPlan()
    const limits = this.getPlanLimits(currentPlan)

    if (currentPlan === "FREE") {
      // Remove premium analytics features
      const { grossProfit, netProfit, ebitda, pat, leaderboards, trends, exportOptions, ...basicAnalytics } = analytics

      return {
        ...basicAnalytics,
        premiumFeaturesAvailable: false,
        upgradeMessage:
          "Upgrade to Premium for advanced analytics including gross/net profit, EBITDA, PAT, and trend analysis.",
      }
    }

    return {
      ...analytics,
      premiumFeaturesAvailable: true,
    }
  }
}

export const planService = new PlanService()
export type { PlanFeature }
