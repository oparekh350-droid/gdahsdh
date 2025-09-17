"use client"

import { useState, useEffect } from "react"
import { planService } from "@/lib/plan-service"
import { useNavigate } from "react-router-dom"

export const usePremiumFeatures = () => {
  const navigate = useNavigate()
  const [currentPlan, setCurrentPlan] = useState(planService.getCurrentPlan())

  useEffect(() => {
    // Listen for plan changes (in a real app, this might be an event listener)
    const checkPlan = () => {
      const plan = planService.getCurrentPlan()
      setCurrentPlan(plan)
    }

    // Check plan on mount and set up interval to check for changes
    checkPlan()
    const interval = setInterval(checkPlan, 5000) // Check every 5 seconds

    return () => clearInterval(interval)
  }, [])

  const isFeatureAvailable = (featureId: string) => {
    return planService.isFeatureAvailable(featureId)
  }

  const isPremium = currentPlan === "PREMIUM"

  const requirePremium = (featureName: string, redirectToUpgrade = true) => {
    if (!isPremium) {
      if (redirectToUpgrade) {
        navigate("/upgrade-to-premium")
      } else {
        planService.showUpgradePrompt(featureName)
      }
      return false
    }
    return true
  }

  const getStaffLimits = () => {
    return planService.canAddMoreStaff()
  }

  const filterModulesByPlan = (modules: any[]) => {
    return planService.filterModulesByPlan(modules)
  }

  return {
    currentPlan,
    isPremium,
    isFeatureAvailable,
    requirePremium,
    getStaffLimits,
    filterModulesByPlan,
    planService,
  }
}
