"use client"

import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Crown, Lock, ArrowRight } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { planService } from "@/lib/plan-service"

interface PremiumModuleCardProps {
  module: {
    id: string
    title: string
    description: string
    icon: string
    path: string
    isPremiumOnly?: boolean
    isAvailable?: boolean
    upgradeRequired?: boolean
  }
  onClick?: () => void
}

export const PremiumModuleCard: React.FC<PremiumModuleCardProps> = ({ module, onClick }) => {
  const navigate = useNavigate()
  const isPremium = planService.isPremiumUser()

  const handleClick = () => {
    if (module.upgradeRequired) {
      navigate("/upgrade-to-premium")
      return
    }

    if (onClick) {
      onClick()
    } else {
      navigate(module.path)
    }
  }

  const getIconComponent = (iconName: string) => {
    // This would map icon names to actual icon components
    // For now, returning a placeholder
    return <div className="w-6 h-6 bg-blue-100 rounded" />
  }

  return (
    <Card
      className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
        module.upgradeRequired
          ? "border-2 border-dashed border-yellow-300 bg-yellow-50/50"
          : "hover:shadow-md border-gray-200"
      }`}
      onClick={handleClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${module.upgradeRequired ? "bg-yellow-100" : "bg-blue-100"}`}>
              {module.upgradeRequired ? <Lock className="w-6 h-6 text-yellow-600" /> : getIconComponent(module.icon)}
            </div>
            <div>
              <CardTitle className={`text-lg ${module.upgradeRequired ? "text-gray-600" : "text-gray-900"}`}>
                {module.title}
              </CardTitle>
              {module.isPremiumOnly && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-300 mt-1">
                  <Crown className="w-3 h-3 mr-1" />
                  Premium
                </Badge>
              )}
            </div>
          </div>
          {module.upgradeRequired && <ArrowRight className="w-5 h-5 text-yellow-600" />}
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className={module.upgradeRequired ? "text-gray-500" : "text-gray-600"}>
          {module.description}
        </CardDescription>
        {module.upgradeRequired && (
          <div className="mt-3">
            <Button
              size="sm"
              className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white"
            >
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to Access
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
