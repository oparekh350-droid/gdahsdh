import { getDB } from '@/services/indexeddb/db';
import type { StaffRequest } from '@/lib/validators/staffRequest';
import { businessRepository } from '@/services/indexeddb/repositories/businessRepository';

export const staffRequestRepository = {
  async add(req: Omit<StaffRequest, 'id' | 'createdAt'>): Promise<StaffRequest> {
    const db = await getDB();
    const id = `sr_${crypto.randomUUID()}`;
    const record: StaffRequest = { ...req, id, createdAt: new Date().toISOString() } as StaffRequest;
    await db.put('staff_requests', record);
    return record;
  },
  async getAll(): Promise<StaffRequest[]> {
    const db = await getDB();
    return await db.getAll('staff_requests');
  },
  async getByBusinessCode(code: string): Promise<StaffRequest[]> {
    const all = await this.getAll();
    return all.filter(r => r.businessCode?.toUpperCase() === code.toUpperCase());
  },
  async getActiveCountByBusinessCode(code: string): Promise<number> {
    const list = await this.getByBusinessCode(code);
    return list.filter(r => r.status === 'ACTIVE').length;
  },
  async update(req: StaffRequest): Promise<void> {
    const db = await getDB();
    await db.put('staff_requests', req);
  },
  async approve(id: string): Promise<StaffRequest | undefined> {
    const db = await getDB();
    const req = await db.get('staff_requests', id) as StaffRequest | undefined;
    if (!req) return undefined;

    // Enforce plan limits using business code if available
    if (req.businessCode) {
      const biz = await businessRepository.findByCode(req.businessCode);
      if (biz) {
        const activeCount = await this.getActiveCountByBusinessCode(req.businessCode);
        const limit = biz.plan === 'PREMIUM' ? 30 : 3;
        if (activeCount + 1 > limit) {
          throw new Error(`Staff limit reached for ${biz.plan} plan`);
        }
      }
    }

    const updated = { ...req, status: 'ACTIVE' as const };
    await db.put('staff_requests', updated);
    return updated;
  },
  async reject(id: string, reason?: string): Promise<StaffRequest | undefined> {
    const db = await getDB();
    const req = await db.get('staff_requests', id) as StaffRequest | undefined;
    if (!req) return undefined;
    const updated = { ...req, status: 'REJECTED' as const, reason };
    await db.put('staff_requests', updated);
    return updated;
  }
};
