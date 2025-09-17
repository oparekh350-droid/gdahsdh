"use client"

import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Crown, Lock, Sparkles, ArrowRight, Check } from "lucide-react"
import { planService } from "@/lib/plan-service"
import { useNavigate } from "react-router-dom"

interface PremiumGateProps {
  featureId: string
  featureName: string
  description: string
  children?: React.ReactNode
  showPreview?: boolean
  className?: string
}

export const PremiumGate: React.FC<PremiumGateProps> = ({
  featureId,
  featureName,
  description,
  children,
  showPreview = false,
  className = "",
}) => {
  const navigate = useNavigate()
  const isFeatureAvailable = planService.isFeatureAvailable(featureId)
  const isPremium = planService.isPremiumUser()

  if (isFeatureAvailable) {
    return <>{children}</>
  }

  const handleUpgrade = () => {
    navigate("/upgrade-to-premium")
  }

  return (
    <div className={`relative ${className}`}>
      {showPreview && (
        <div className="absolute inset-0 z-10 bg-white/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
          <Card className="max-w-md mx-4 shadow-xl border-2 border-yellow-200">
            <CardHeader className="text-center pb-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Crown className="w-6 h-6 text-yellow-600" />
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                  Premium Feature
                </Badge>
              </div>
              <CardTitle className="text-xl">{featureName}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button
                onClick={handleUpgrade}
                className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Upgrade to Premium
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {showPreview ? (
        <div className="opacity-30 pointer-events-none">{children}</div>
      ) : (
        <Card className="border-2 border-dashed border-yellow-300 bg-yellow-50">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-yellow-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{featureName}</h3>
            <p className="text-gray-600 mb-4 max-w-sm">{description}</p>
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-300 mb-4">
              Premium Feature
            </Badge>
            <Button
              onClick={handleUpgrade}
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white"
            >
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to Premium
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

interface PremiumBadgeProps {
  className?: string
}

export const PremiumBadge: React.FC<PremiumBadgeProps> = ({ className = "" }) => {
  return (
    <Badge variant="secondary" className={`bg-yellow-100 text-yellow-800 border-yellow-300 ${className}`}>
      <Crown className="w-3 h-3 mr-1" />
      Premium
    </Badge>
  )
}

interface UpgradePromptProps {
  title: string
  features: string[]
  onUpgrade: () => void
  onDismiss: () => void
}

export const UpgradePrompt: React.FC<UpgradePromptProps> = ({ title, features, onUpgrade, onDismiss }) => {
  return (
    <Card className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-600" />
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          <PremiumBadge />
        </div>
        <CardDescription>Unlock powerful features to grow your business</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 mb-4">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-green-600" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Button
            onClick={onUpgrade}
            className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white"
          >
            <ArrowRight className="w-4 h-4 mr-2" />
            Upgrade Now
          </Button>
          <Button variant="outline" onClick={onDismiss}>
            Later
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Hook for premium feature access
export const usePremiumFeature = (featureId: string) => {
  const isAvailable = planService.isFeatureAvailable(featureId)
  const isPremium = planService.isPremiumUser()

  const showUpgradePrompt = (featureName: string) => {
    planService.showUpgradePrompt(featureName)
  }

  return {
    isAvailable,
    isPremium,
    showUpgradePrompt,
    planService,
  }
}
