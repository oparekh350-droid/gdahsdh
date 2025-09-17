import { openDB, type IDBPDatabase } from "idb"

export type DBSchema = {
  raw_materials: { key: string; value: any }
  products: { key: string; value: any }
  boms: { key: string; value: any }
  recipes: { key: string; value: any }
  production_plans: { key: string; value: any }
  sale_invoices: { key: string; value: any }
  to_be_paid: { key: string; value: any }
  expenses: { key: string; value: any }
  staff_requests: { key: string; value: any }
  businesses: { key: string; value: any }
  notifications: { key: string; value: any }
  payments: { key: string; value: any }
  attendance_records: { key: string; value: any }
  leave_requests: { key: string; value: any }
  shifts: { key: string; value: any }
  services: { key: string; value: any }
}

let dbPromise: Promise<IDBPDatabase<DBSchema>> | null = null

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<DBSchema>("insygth_db", 7, {
      upgrade(db, oldVersion) {
        if (!db.objectStoreNames.contains("raw_materials")) db.createObjectStore("raw_materials", { keyPath: "id" })
        if (!db.objectStoreNames.contains("products")) db.createObjectStore("products", { keyPath: "id" })
        if (!db.objectStoreNames.contains("boms")) db.createObjectStore("boms", { keyPath: "id" })
        if (!db.objectStoreNames.contains("recipes")) db.createObjectStore("recipes", { keyPath: "id" })
        if (!db.objectStoreNames.contains("production_plans"))
          db.createObjectStore("production_plans", { keyPath: "id" })
        if (!db.objectStoreNames.contains("sale_invoices")) db.createObjectStore("sale_invoices", { keyPath: "id" })
        if (!db.objectStoreNames.contains("to_be_paid")) db.createObjectStore("to_be_paid", { keyPath: "id" })
        if (!db.objectStoreNames.contains("expenses")) db.createObjectStore("expenses", { keyPath: "id" })
        if (!db.objectStoreNames.contains("staff_requests")) db.createObjectStore("staff_requests", { keyPath: "id" })
        if (!db.objectStoreNames.contains("businesses")) db.createObjectStore("businesses", { keyPath: "id" })

        if (!db.objectStoreNames.contains("notifications")) {
          const notificationStore = db.createObjectStore("notifications", { keyPath: "id" })
          notificationStore.createIndex("businessId", "businessId", { unique: false })
          notificationStore.createIndex("recipientId", "recipientId", { unique: false })
          notificationStore.createIndex("read", "read", { unique: false })
        }

        if (!db.objectStoreNames.contains("payments")) {
          const paymentStore = db.createObjectStore("payments", { keyPath: "id" })
          paymentStore.createIndex("businessId", "businessId", { unique: false })
          paymentStore.createIndex("status", "status", { unique: false })
        }

        if (!db.objectStoreNames.contains("attendance_records")) {
          const attendanceStore = db.createObjectStore("attendance_records", { keyPath: "id" })
          attendanceStore.createIndex("businessId", "businessId", { unique: false })
          attendanceStore.createIndex("staffId", "staffId", { unique: false })
          attendanceStore.createIndex("date", "date", { unique: false })
          attendanceStore.createIndex("status", "status", { unique: false })
        }

        if (!db.objectStoreNames.contains("leave_requests")) {
          const leaveStore = db.createObjectStore("leave_requests", { keyPath: "id" })
          leaveStore.createIndex("businessId", "businessId", { unique: false })
          leaveStore.createIndex("staffId", "staffId", { unique: false })
          leaveStore.createIndex("status", "status", { unique: false })
        }

        if (!db.objectStoreNames.contains("shifts")) {
          const shiftStore = db.createObjectStore("shifts", { keyPath: "id" })
          shiftStore.createIndex("businessId", "businessId", { unique: false })
        }

        if (!db.objectStoreNames.contains("services")) {
          db.createObjectStore("services", { keyPath: "id" })
        }
      },
    })
  }
  return dbPromise
}
