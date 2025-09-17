"use client"

import type React from "react"

import { Badge } from "@/components/ui/badge"
import { Crown, Shield } from "lucide-react"
import { planService } from "@/lib/plan-service"

interface PlanBadgeProps {
  className?: string
  showIcon?: boolean
}

export const PlanBadge: React.FC<PlanBadgeProps> = ({ className = "", showIcon = true }) => {
  const currentPlan = planService.getCurrentPlan()
  const isPremium = currentPlan === "PREMIUM"

  return (
    <Badge
      variant={isPremium ? "default" : "secondary"}
      className={`${
        isPremium
          ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-yellow-400"
          : "bg-gray-100 text-gray-700 border-gray-300"
      } ${className}`}
    >
      {showIcon && <>{isPremium ? <Crown className="w-3 h-3 mr-1" /> : <Shield className="w-3 h-3 mr-1" />}</>}
      {currentPlan}
    </Badge>
  )
}

export default PlanBadge
