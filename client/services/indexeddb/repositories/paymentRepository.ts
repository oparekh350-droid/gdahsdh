import { getDB } from "@/services/indexeddb/db"

export interface PaymentRecord {
  id: string
  businessId: string
  orderId: string
  razorpayPaymentId?: string
  razorpayOrderId?: string
  razorpaySignature?: string
  amount: number
  currency: string
  status: "pending" | "success" | "failed" | "cancelled"
  plan: "FREE" | "PREMIUM"
  paymentMethod?: string
  failureReason?: string
  createdAt: string
  updatedAt: string
  metadata?: Record<string, any>
}

export const paymentRepository = {
  async create(data: Omit<PaymentRecord, "id" | "createdAt" | "updatedAt">): Promise<PaymentRecord> {
    const db = await getDB()
    const payment: PaymentRecord = {
      ...data,
      id: `pay_${crypto.randomUUID()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    await db.put("payments", payment)
    return payment
  },

  async update(payment: PaymentRecord): Promise<void> {
    const db = await getDB()
    payment.updatedAt = new Date().toISOString()
    await db.put("payments", payment)
  },

  async findById(id: string): Promise<PaymentRecord | undefined> {
    const db = await getDB()
    return (await db.get("payments", id)) as PaymentRecord | undefined
  },

  async findByBusinessId(businessId: string): Promise<PaymentRecord[]> {
    const db = await getDB()
    const allPayments = await db.getAll("payments")
    return allPayments
      .filter((p: PaymentRecord) => p.businessId === businessId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  },

  async findByOrderId(orderId: string): Promise<PaymentRecord | undefined> {
    const db = await getDB()
    const allPayments = await db.getAll("payments")
    return allPayments.find((p: PaymentRecord) => p.orderId === orderId)
  },

  async getSuccessfulPayments(businessId: string): Promise<PaymentRecord[]> {
    const payments = await this.findByBusinessId(businessId)
    return payments.filter((p) => p.status === "success")
  },
}
