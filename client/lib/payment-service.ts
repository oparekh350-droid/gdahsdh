import { planService } from "@/lib/plan-service"
import { authService } from "@/lib/auth-service"

export interface PaymentConfig {
  razorpayKeyId: string
  premiumPlanPrice: number // in paise (INR)
  currency: string
}

export interface PaymentResult {
  success: boolean
  paymentId?: string
  orderId?: string
  signature?: string
  error?: string
}

class PaymentService {
  private readonly config: PaymentConfig = {
    razorpayKeyId: (import.meta as any).env?.VITE_RAZORPAY_KEY_ID || "rzp_test_mock_key",
    premiumPlanPrice: 99900, // ₹999 in paise
    currency: "INR",
  }

  async initiatePremiumUpgrade(): Promise<{ success: boolean; orderId?: string; error?: string }> {
    try {
      const user = authService.getCurrentUser()
      const businessData = authService.getBusinessData()

      if (!user || !businessData) {
        return { success: false, error: "User or business data not found" }
      }

      if (businessData.plan === "PREMIUM") {
        return { success: false, error: "Already on Premium plan" }
      }

      // Generate order ID (in real implementation, this would come from backend)
      const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      // Store pending upgrade in localStorage for verification
      localStorage.setItem(
        "pending_upgrade",
        JSON.stringify({
          orderId,
          businessId: businessData.id,
          userId: user.id,
          amount: this.config.premiumPlanPrice,
          timestamp: Date.now(),
        }),
      )

      return { success: true, orderId }
    } catch (error) {
      return { success: false, error: "Failed to initiate upgrade process" }
    }
  }

  async processPayment(orderId: string): Promise<PaymentResult> {
    try {
      // Mock Razorpay integration - in real implementation, this would use Razorpay SDK
      return new Promise((resolve) => {
        // Simulate payment processing delay
        setTimeout(() => {
          // Mock successful payment (90% success rate for demo)
          const isSuccess = Math.random() > 0.1

          if (isSuccess) {
            const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            const signature = `sig_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

            resolve({
              success: true,
              paymentId,
              orderId,
              signature,
            })
          } else {
            resolve({
              success: false,
              error: "Payment failed. Please try again.",
            })
          }
        }, 2000)
      })
    } catch (error) {
      return {
        success: false,
        error: "Payment processing failed",
      }
    }
  }

  async verifyPaymentAndUpgrade(paymentResult: PaymentResult): Promise<{ success: boolean; message: string }> {
    try {
      if (!paymentResult.success || !paymentResult.paymentId) {
        return { success: false, message: "Invalid payment result" }
      }

      // Verify pending upgrade
      const pendingUpgrade = localStorage.getItem("pending_upgrade")
      if (!pendingUpgrade) {
        return { success: false, message: "No pending upgrade found" }
      }

      const upgradeData = JSON.parse(pendingUpgrade)
      if (upgradeData.orderId !== paymentResult.orderId) {
        return { success: false, message: "Order ID mismatch" }
      }

      // Process the upgrade
      const upgradeResult = await planService.upgradeToPremium()

      if (upgradeResult.success) {
        // Clean up pending upgrade
        localStorage.removeItem("pending_upgrade")

        // Store payment record (in real implementation, this would go to backend)
        const paymentRecord = {
          paymentId: paymentResult.paymentId,
          orderId: paymentResult.orderId,
          amount: this.config.premiumPlanPrice,
          currency: this.config.currency,
          status: "completed",
          timestamp: Date.now(),
          businessId: upgradeData.businessId,
          userId: upgradeData.userId,
        }

        const existingPayments = JSON.parse(localStorage.getItem("payment_history") || "[]")
        existingPayments.push(paymentRecord)
        localStorage.setItem("payment_history", JSON.stringify(existingPayments))

        return { success: true, message: "Payment verified and plan upgraded successfully" }
      }

      return { success: false, message: "Payment verified but upgrade failed" }
    } catch (error) {
      return { success: false, message: "Payment verification failed" }
    }
  }

  async openRazorpayCheckout(orderId: string): Promise<PaymentResult> {
    const user = authService.getCurrentUser()
    const businessData = authService.getBusinessData()

    if (!user || !businessData) {
      return { success: false, error: "User data not available" }
    }

    // Mock Razorpay checkout (in real implementation, this would use Razorpay SDK)
    return new Promise((resolve) => {
      // Simulate Razorpay modal
      const confirmPayment = window.confirm(
        `Upgrade to Premium Plan\n\nAmount: ₹${this.config.premiumPlanPrice / 100}\nBusiness: ${businessData.name}\n\nProceed with payment?`,
      )

      if (confirmPayment) {
        // Process mock payment
        this.processPayment(orderId).then(resolve)
      } else {
        resolve({
          success: false,
          error: "Payment cancelled by user",
        })
      }
    })
  }

  getPremiumPlanPrice(): { amount: number; currency: string; displayAmount: string } {
    return {
      amount: this.config.premiumPlanPrice,
      currency: this.config.currency,
      displayAmount: `₹${this.config.premiumPlanPrice / 100}`,
    }
  }

  getPaymentHistory(): any[] {
    return JSON.parse(localStorage.getItem("payment_history") || "[]")
  }
}

export const paymentService = new PaymentService()
