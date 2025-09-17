"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Crown,
  Check,
  X,
  ArrowLeft,
  Sparkles,
  Users,
  TrendingUp,
  MessageSquare,
  Clock,
  Download,
  Loader2,
} from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { planService } from "@/lib/plan-service"
import { paymentService } from "@/lib/payment-service"

export default function UpgradeToPremium() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const currentPlan = planService.getCurrentPlan()
  const premiumFeatures = planService.getPremiumFeatures()
  const pricing = paymentService.getPremiumPlanPrice()

  const handleUpgrade = async () => {
    setIsLoading(true)
    setError("")

    try {
      // Initiate payment process
      const orderResult = await paymentService.initiatePremiumUpgrade()

      if (!orderResult.success) {
        setError(orderResult.error || "Failed to initiate upgrade")
        return
      }

      // Open Razorpay checkout (mock implementation)
      const paymentResult = await paymentService.openRazorpayCheckout(orderResult.orderId!)

      if (paymentResult.success) {
        // Verify payment and upgrade
        const verificationResult = await paymentService.verifyPaymentAndUpgrade(paymentResult)

        if (verificationResult.success) {
          navigate("/dashboard", {
            state: {
              message: "Successfully upgraded to Premium! All premium features are now available.",
              type: "success",
            },
          })
        } else {
          setError(verificationResult.message)
        }
      } else {
        setError(paymentResult.error || "Payment failed")
      }
    } catch (err) {
      setError("Upgrade process failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const featureCategories = {
    analytics: {
      title: "Advanced Analytics",
      icon: TrendingUp,
      features: premiumFeatures.filter((f) => f.category === "analytics"),
    },
    staff: {
      title: "Staff Management",
      icon: Users,
      features: premiumFeatures.filter((f) => f.category === "staff"),
    },
    communication: {
      title: "Communication",
      icon: MessageSquare,
      features: premiumFeatures.filter((f) => f.category === "communication"),
    },
    productivity: {
      title: "Productivity",
      icon: Clock,
      features: premiumFeatures.filter((f) => f.category === "productivity"),
    },
    reports: {
      title: "Reports & Export",
      icon: Download,
      features: premiumFeatures.filter((f) => f.category === "reports"),
    },
  }

  if (currentPlan === "PREMIUM") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50 flex items-center justify-center py-12 px-4">
        <Card className="max-w-md w-full shadow-xl border-2 border-yellow-200">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Crown className="w-8 h-8 text-yellow-600" />
            </div>
            <CardTitle className="text-2xl">You're Already Premium!</CardTitle>
            <CardDescription>You have access to all premium features</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild className="w-full">
              <Link to="/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
              <Crown className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
              Upgrade to Premium
            </span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">Unlock Your Business Potential</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Get access to advanced analytics, extended staff management, and powerful productivity tools to scale your
            business.
          </p>
        </div>

        {/* Pricing Card */}
        <Card className="max-w-md mx-auto mb-8 shadow-xl border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Crown className="w-6 h-6 text-yellow-600" />
              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Premium Plan</Badge>
            </div>
            <CardTitle className="text-3xl font-bold">{pricing.displayAmount}</CardTitle>
            <CardDescription>per month, billed monthly</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-4 border-red-200 bg-red-50">
                <X className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleUpgrade}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white text-lg py-6"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Upgrade Now
                </>
              )}
            </Button>

            <p className="text-xs text-gray-500 text-center mt-3">
              Secure payment powered by Razorpay. Cancel anytime.
            </p>
          </CardContent>
        </Card>

        {/* Feature Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(featureCategories).map(([key, category]) => {
            const IconComponent = category.icon

            return (
              <Card key={key} className="shadow-lg border-gray-200">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <IconComponent className="w-6 h-6 text-blue-600" />
                    </div>
                    <CardTitle className="text-lg">{category.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {category.features.map((feature) => (
                      <div key={feature.id} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-sm">{feature.name}</p>
                          <p className="text-xs text-gray-600">{feature.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Comparison Table */}
        <Card className="mt-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-center">Plan Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Feature</th>
                    <th className="text-center py-3 px-4">
                      <Badge variant="outline">Free</Badge>
                    </th>
                    <th className="text-center py-3 px-4">
                      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                        <Crown className="w-3 h-3 mr-1" />
                        Premium
                      </Badge>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-3 px-4">Staff Members</td>
                    <td className="text-center py-3 px-4">Up to 3</td>
                    <td className="text-center py-3 px-4">Up to 30</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Basic Analytics</td>
                    <td className="text-center py-3 px-4">
                      <Check className="w-4 h-4 text-green-600 mx-auto" />
                    </td>
                    <td className="text-center py-3 px-4">
                      <Check className="w-4 h-4 text-green-600 mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Advanced Analytics (EBITDA, PAT)</td>
                    <td className="text-center py-3 px-4">
                      <X className="w-4 h-4 text-red-500 mx-auto" />
                    </td>
                    <td className="text-center py-3 px-4">
                      <Check className="w-4 h-4 text-green-600 mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Support Tickets</td>
                    <td className="text-center py-3 px-4">
                      <X className="w-4 h-4 text-red-500 mx-auto" />
                    </td>
                    <td className="text-center py-3 px-4">
                      <Check className="w-4 h-4 text-green-600 mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Task Management</td>
                    <td className="text-center py-3 px-4">
                      <X className="w-4 h-4 text-red-500 mx-auto" />
                    </td>
                    <td className="text-center py-3 px-4">
                      <Check className="w-4 h-4 text-green-600 mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Export to Excel/PDF</td>
                    <td className="text-center py-3 px-4">
                      <X className="w-4 h-4 text-red-500 mx-auto" />
                    </td>
                    <td className="text-center py-3 px-4">
                      <Check className="w-4 h-4 text-green-600 mx-auto" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card className="mt-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-1">Can I cancel anytime?</h4>
                <p className="text-sm text-gray-600">
                  Yes, you can cancel your Premium subscription at any time. You'll continue to have access to Premium
                  features until the end of your billing period.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-1">What happens to my data if I downgrade?</h4>
                <p className="text-sm text-gray-600">
                  Your data remains safe. Premium features will be disabled, but all your business data is preserved.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Is payment secure?</h4>
                <p className="text-sm text-gray-600">
                  Yes, all payments are processed securely through Razorpay with industry-standard encryption.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
