"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, Loader2, Crown, ArrowRight } from "lucide-react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { paymentService } from "@/lib/payment-service"

export default function PaymentStatus() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const verifyPayment = async () => {
      const paymentId = searchParams.get("payment_id")
      const orderId = searchParams.get("order_id")
      const signature = searchParams.get("signature")

      if (!paymentId || !orderId) {
        setStatus("failed")
        setMessage("Invalid payment parameters")
        return
      }

      try {
        const result = await paymentService.verifyPaymentAndUpgrade({
          success: true,
          paymentId,
          orderId,
          signature: signature || "",
        })

        if (result.success) {
          setStatus("success")
          setMessage(result.message)
        } else {
          setStatus("failed")
          setMessage(result.message)
        }
      } catch (error) {
        setStatus("failed")
        setMessage("Payment verification failed")
      }
    }

    verifyPayment()
  }, [searchParams])

  const handleContinue = () => {
    navigate("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center py-12 px-4">
      <Card className="max-w-md w-full shadow-xl">
        <CardHeader className="text-center">
          {status === "loading" && (
            <>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
              <CardTitle className="text-xl">Verifying Payment...</CardTitle>
              <CardDescription>Please wait while we confirm your upgrade</CardDescription>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-xl text-green-700">Payment Successful!</CardTitle>
              <CardDescription>Your business has been upgraded to Premium</CardDescription>
            </>
          )}

          {status === "failed" && (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-xl text-red-700">Payment Failed</CardTitle>
              <CardDescription>There was an issue processing your payment</CardDescription>
            </>
          )}
        </CardHeader>

        <CardContent>
          {status === "success" && (
            <div className="space-y-4">
              <Alert className="border-green-200 bg-green-50">
                <Crown className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">
                  Welcome to Premium! You now have access to all premium features including advanced analytics, extended
                  staff management, and more.
                </AlertDescription>
              </Alert>

              <Button onClick={handleContinue} className="w-full">
                <ArrowRight className="w-4 h-4 mr-2" />
                Continue to Dashboard
              </Button>
            </div>
          )}

          {status === "failed" && (
            <div className="space-y-4">
              <Alert className="border-red-200 bg-red-50">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">{message}</AlertDescription>
              </Alert>

              <div className="flex gap-2">
                <Button asChild variant="outline" className="flex-1 bg-transparent">
                  <Link to="/upgrade-to-premium">Try Again</Link>
                </Button>
                <Button asChild className="flex-1">
                  <Link to="/dashboard">Back to Dashboard</Link>
                </Button>
              </div>
            </div>
          )}

          {status === "loading" && (
            <div className="text-center">
              <p className="text-sm text-gray-600">This may take a few moments...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
