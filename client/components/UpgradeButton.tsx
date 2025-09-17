"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Crown, Sparkles } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { planService } from "@/lib/plan-service"

interface UpgradeButtonProps {
  variant?: "default" | "outline" | "ghost"
  size?: "sm" | "default" | "lg"
  className?: string
  children?: React.ReactNode
}

export const UpgradeButton: React.FC<UpgradeButtonProps> = ({
  variant = "default",
  size = "default",
  className = "",
  children,
}) => {
  const navigate = useNavigate()
  const isPremium = planService.isPremiumUser()

  if (isPremium) {
    return null // Don't show upgrade button for premium users
  }

  const handleUpgrade = () => {
    navigate("/upgrade-to-premium")
  }

  return (
    <Button
      onClick={handleUpgrade}
      variant={variant}
      size={size}
      className={`bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white border-0 ${className}`}
    >
      <Crown className="w-4 h-4 mr-2" />
      {children || "Upgrade to Premium"}
    </Button>
  )
}

interface UpgradePromptButtonProps {
  featureName: string
  className?: string
}

export const UpgradePromptButton: React.FC<UpgradePromptButtonProps> = ({ featureName, className = "" }) => {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate("/upgrade-to-premium")
  }

  return (
    <Button
      onClick={handleClick}
      size="sm"
      className={`bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white ${className}`}
    >
      <Sparkles className="w-4 h-4 mr-2" />
      Unlock {featureName}
    </Button>
  )
}

export default UpgradeButton
