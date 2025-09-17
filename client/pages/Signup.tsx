"use client"

import type React from "react"

import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  PieChart,
  Eye,
  EyeOff,
  CheckCircle,
  ArrowLeft,
  Loader2,
  Crown,
  Shield,
  ArrowRight,
  Copy,
  Check,
} from "lucide-react"
import type { BusinessType } from "@shared/types"
import { authService } from "@/lib/auth-service"

const businessTypeOptions: { value: BusinessType; label: string; description: string }[] = [
  {
    value: "manufacturer",
    label: "Manufacturer",
    description: "Production, inventory, and supply chain management",
  },
  {
    value: "retailer",
    label: "Shop Owner",
    description: "Point of sale, customer management, and inventory",
  },
]

interface Step1Data {
  businessName: string
  businessType: BusinessType
  ownerName: string
  email: string
  phone: string
}

interface Step2Data {
  ownerPassword: string
  staffPassword: string
}

export default function Signup() {
  const location = useLocation()
  const navigate = useNavigate()
  const preselectedBusinessType = location.state?.businessType

  const [currentStep, setCurrentStep] = useState<1 | 2>(1)
  const [businessProfile, setBusinessProfile] = useState<any>(null)
  const [businessCode, setBusinessCode] = useState<string>("")
  const [codeCopied, setCodeCopied] = useState(false)

  const [step1Data, setStep1Data] = useState<Step1Data>({
    businessName: "",
    businessType: preselectedBusinessType || ("retailer" as BusinessType),
    ownerName: "",
    email: "",
    phone: "",
  })

  const [step2Data, setStep2Data] = useState<Step2Data>({
    ownerPassword: "",
    staffPassword: "",
  })

  const [confirmOwnerPassword, setConfirmOwnerPassword] = useState("")
  const [confirmStaffPassword, setConfirmStaffPassword] = useState("")
  const [showOwnerPassword, setShowOwnerPassword] = useState(false)
  const [showStaffPassword, setShowStaffPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const passwordStrength = (pwd: string) => {
    let score = 0
    if (pwd.length >= 8) score++
    if (/[A-Z]/.test(pwd)) score++
    if (/[a-z]/.test(pwd)) score++
    if (/[0-9]/.test(pwd)) score++
    if (/[^A-Za-z0-9]/.test(pwd)) score++
    return Math.min(score, 4) // 0..4
  }

  const strengthLabel = (score: number) => ["Very weak", "Weak", "Good", "Strong", "Very strong"][score] || "Very weak"
  const strengthColor = (score: number) =>
    ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500", "bg-emerald-600"][score] || "bg-red-500"

  const validateStep1 = (): boolean => {
    const errors: Record<string, string> = {}

    if (!step1Data.businessName.trim()) {
      errors.businessName = "Business name is required"
    }
    if (!step1Data.ownerName.trim()) {
      errors.ownerName = "Owner name is required"
    }
    if (!step1Data.email.trim()) {
      errors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(step1Data.email)) {
      errors.email = "Invalid email format"
    }
    if (!step1Data.phone.trim()) {
      errors.phone = "Phone number is required"
    } else if (!/^[+]?[1-9][\d]{3,14}$/.test(step1Data.phone.replace(/\s/g, ""))) {
      errors.phone = "Invalid phone number format"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateStep2 = (): boolean => {
    const errors: Record<string, string> = {}

    if (!step2Data.ownerPassword) {
      errors.ownerPassword = "Owner password is required"
    } else if (step2Data.ownerPassword.length < 8) {
      errors.ownerPassword = "Password must be at least 8 characters with uppercase, lowercase, and number"
    }
    if (step2Data.ownerPassword !== confirmOwnerPassword) {
      errors.confirmOwnerPassword = "Passwords do not match"
    }
    if (!step2Data.staffPassword) {
      errors.staffPassword = "Staff password is required"
    } else if (step2Data.staffPassword.length < 8) {
      errors.staffPassword = "Password must be at least 8 characters with uppercase, lowercase, and number"
    }
    if (step2Data.staffPassword !== confirmStaffPassword) {
      errors.confirmStaffPassword = "Passwords do not match"
    }
    if (step2Data.ownerPassword === step2Data.staffPassword) {
      errors.staffPassword = "Staff password must be different from owner password"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!validateStep1()) {
      return
    }

    setIsLoading(true)

    try {
      const result = await authService.createBusinessProfile({
        businessName: step1Data.businessName,
        businessType: step1Data.businessType,
        ownerName: step1Data.ownerName,
        email: step1Data.email,
        phone: step1Data.phone,
      })

      if (result.success && result.business) {
        setBusinessProfile(result.business)
        setBusinessCode(result.business.businessCode)
        setCurrentStep(2)
      } else {
        setError(result.message || "Failed to create business profile")
      }
    } catch (err) {
      setError("Business profile creation failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!validateStep2()) {
      return
    }

    setIsLoading(true)

    try {
      const result = await authService.finalizeBusinessSecurity(
        businessProfile.id,
        step2Data.ownerPassword,
        step2Data.staffPassword,
      )

      if (result.success && result.user) {
        // Auto-login successful - redirect to business-type specific dashboard
        const dashboardRoute = authService.getBusinessDashboardRoute(result.user.businessType, result.user.role)
        navigate(dashboardRoute, { replace: true })
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError("Account creation failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleStep1InputChange = (field: keyof Step1Data, value: string) => {
    setStep1Data((prev) => ({ ...prev, [field]: value }))

    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handleStep2InputChange = (field: keyof Step2Data, value: string) => {
    setStep2Data((prev) => ({ ...prev, [field]: value }))

    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const copyBusinessCode = async () => {
    try {
      await navigator.clipboard.writeText(businessCode)
      setCodeCopied(true)
      setTimeout(() => setCodeCopied(false), 2000)
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea")
      textArea.value = businessCode
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)
      setCodeCopied(true)
      setTimeout(() => setCodeCopied(false), 2000)
    }
  }

  const selectedBusinessType = businessTypeOptions.find((option) => option.value === step1Data.businessType)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <PieChart className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Insygth
            </span>
          </div>

          <h2 className="text-3xl font-bold text-gray-900">Create Your Business</h2>
          <p className="mt-2 text-gray-600">
            {currentStep === 1
              ? "Start your digital business journey in minutes"
              : "Secure your business with strong passwords"}
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 1 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"}`}
          >
            1
          </div>
          <div className={`h-1 w-16 ${currentStep >= 2 ? "bg-blue-600" : "bg-gray-200"}`}></div>
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 2 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"}`}
          >
            2
          </div>
        </div>

        {/* Step 1: Business Information */}
        {currentStep === 1 && (
          <Card className="shadow-xl border-0">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-xl text-center flex items-center justify-center gap-2">
                <Crown className="w-5 h-5 text-yellow-600" />
                Business Information
              </CardTitle>
              <CardDescription className="text-center">Tell us about your business to get started</CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleStep1Submit} className="space-y-4">
                {error && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertDescription className="text-red-700">{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name *</Label>
                  <Input
                    id="businessName"
                    type="text"
                    value={step1Data.businessName}
                    onChange={(e) => handleStep1InputChange("businessName", e.target.value)}
                    placeholder="Enter your business name"
                    className={validationErrors.businessName ? "border-red-500" : ""}
                  />
                  {validationErrors.businessName && (
                    <p className="text-sm text-red-500">{validationErrors.businessName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessType">Business Type *</Label>
                  <Select
                    value={step1Data.businessType}
                    onValueChange={(value) => handleStep1InputChange("businessType", value as BusinessType)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {businessTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex flex-col">
                            <span className="font-medium">{option.label}</span>
                            <span className="text-xs text-gray-500">{option.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedBusinessType && (
                    <p className="text-xs text-gray-600 mt-1">{selectedBusinessType.description}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ownerName">Owner Name *</Label>
                  <Input
                    id="ownerName"
                    type="text"
                    value={step1Data.ownerName}
                    onChange={(e) => handleStep1InputChange("ownerName", e.target.value)}
                    placeholder="Enter owner's full name"
                    className={validationErrors.ownerName ? "border-red-500" : ""}
                  />
                  {validationErrors.ownerName && <p className="text-sm text-red-500">{validationErrors.ownerName}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={step1Data.email}
                    onChange={(e) => handleStep1InputChange("email", e.target.value)}
                    placeholder="owner@business.com"
                    className={validationErrors.email ? "border-red-500" : ""}
                  />
                  {validationErrors.email && <p className="text-sm text-red-500">{validationErrors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={step1Data.phone}
                    onChange={(e) => handleStep1InputChange("phone", e.target.value)}
                    placeholder="+91 98765 43210"
                    className={validationErrors.phone ? "border-red-500" : ""}
                  />
                  {validationErrors.phone && <p className="text-sm text-red-500">{validationErrors.phone}</p>}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white mt-6"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating Profile...
                    </>
                  ) : (
                    <>
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Continue to Security Setup
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Already have a business?{" "}
                  <Link to="/signin" className="text-blue-600 hover:text-blue-700 font-medium">
                    Staff sign in here
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Security Setup */}
        {currentStep === 2 && (
          <Card className="shadow-xl border-0">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-xl text-center flex items-center justify-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                Security Setup
              </CardTitle>
              <CardDescription className="text-center">
                Create secure passwords for owners and staff access
              </CardDescription>
            </CardHeader>

            <CardContent>
              {/* Business Code Display */}
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-green-800">Your Business Profile Code</h4>
                    <p className="text-sm text-green-600 mt-1">Share this code with staff to join your business</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <code className="px-3 py-2 bg-white border border-green-300 rounded text-lg font-mono font-bold text-green-800 tracking-wider">
                    {businessCode}
                  </code>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={copyBusinessCode}
                    className="border-green-300 text-green-700 hover:bg-green-100 bg-transparent"
                  >
                    {codeCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <form onSubmit={handleStep2Submit} className="space-y-4">
                {error && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertDescription className="text-red-700">{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="ownerPassword">Owner Password *</Label>
                  <div className="relative">
                    <Input
                      id="ownerPassword"
                      type={showOwnerPassword ? "text" : "password"}
                      value={step2Data.ownerPassword}
                      onChange={(e) => handleStep2InputChange("ownerPassword", e.target.value)}
                      placeholder="Create a secure owner password"
                      className={validationErrors.ownerPassword ? "border-red-500" : ""}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowOwnerPassword(!showOwnerPassword)}
                    >
                      {showOwnerPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="mt-2">
                    <div className="h-1.5 w-full bg-gray-200 rounded">
                      <div
                        className={`h-1.5 rounded transition-all ${strengthColor(passwordStrength(step2Data.ownerPassword))}`}
                        style={{ width: `${(passwordStrength(step2Data.ownerPassword) / 4) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs mt-1 text-gray-500">
                      <span>Password strength</span>
                      <span className="font-medium">{strengthLabel(passwordStrength(step2Data.ownerPassword))}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Must be 8+ characters with uppercase, lowercase, and number
                  </p>
                  {validationErrors.ownerPassword && (
                    <p className="text-sm text-red-500">{validationErrors.ownerPassword}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmOwnerPassword">Confirm Owner Password *</Label>
                  <Input
                    id="confirmOwnerPassword"
                    type={showOwnerPassword ? "text" : "password"}
                    value={confirmOwnerPassword}
                    onChange={(e) => setConfirmOwnerPassword(e.target.value)}
                    placeholder="Confirm your owner password"
                    className={validationErrors.confirmOwnerPassword ? "border-red-500" : ""}
                  />
                  {validationErrors.confirmOwnerPassword && (
                    <p className="text-sm text-red-500">{validationErrors.confirmOwnerPassword}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="staffPassword">Staff Password *</Label>
                  <div className="relative">
                    <Input
                      id="staffPassword"
                      type={showStaffPassword ? "text" : "password"}
                      value={step2Data.staffPassword}
                      onChange={(e) => handleStep2InputChange("staffPassword", e.target.value)}
                      placeholder="Create staff access password"
                      className={validationErrors.staffPassword ? "border-red-500" : ""}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowStaffPassword(!showStaffPassword)}
                    >
                      {showStaffPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="mt-2">
                    <div className="h-1.5 w-full bg-gray-200 rounded">
                      <div
                        className={`h-1.5 rounded transition-all ${strengthColor(passwordStrength(step2Data.staffPassword))}`}
                        style={{ width: `${(passwordStrength(step2Data.staffPassword) / 4) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs mt-1 text-gray-500">
                      <span>Password strength</span>
                      <span className="font-medium">{strengthLabel(passwordStrength(step2Data.staffPassword))}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Staff will use this password with the business code to join
                  </p>
                  {validationErrors.staffPassword && (
                    <p className="text-sm text-red-500">{validationErrors.staffPassword}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmStaffPassword">Confirm Staff Password *</Label>
                  <Input
                    id="confirmStaffPassword"
                    type={showStaffPassword ? "text" : "password"}
                    value={confirmStaffPassword}
                    onChange={(e) => setConfirmStaffPassword(e.target.value)}
                    placeholder="Confirm staff password"
                    className={validationErrors.confirmStaffPassword ? "border-red-500" : ""}
                  />
                  {validationErrors.confirmStaffPassword && (
                    <p className="text-sm text-red-500">{validationErrors.confirmStaffPassword}</p>
                  )}
                </div>

                <div className="flex gap-3 mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 bg-transparent"
                    onClick={() => setCurrentStep(1)}
                    disabled={isLoading}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating Business...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Complete Setup
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
