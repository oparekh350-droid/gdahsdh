import { getDB } from '@/services/indexeddb/db';

export interface StoredBusiness {
  id: string;
  name: string;
  type: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  ownerPasswordHash?: string;
  staffPasswordHash?: string;
  businessCode: string; // 8-char uppercase alphanumeric
  plan: 'FREE' | 'PREMIUM';
  createdAt: string;
}

function generateId() {
  return `biz_${crypto.randomUUID()}`;
}

function randomBusinessCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let out = '';
  for (let i = 0; i < 8; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export const businessRepository = {
  async create(data: Omit<StoredBusiness, 'id' | 'createdAt' | 'businessCode' | 'plan'> & { plan?: 'FREE' | 'PREMIUM'; businessCode?: string }): Promise<StoredBusiness> {
    const db = await getDB();
    let businessCode = (data as any).businessCode as string | undefined;
    if (!businessCode) {
      // Ensure uniqueness
      for (;;) {
        const candidate = randomBusinessCode();
        const existing = await this.findByCode(candidate);
        if (!existing) {
          businessCode = candidate;
          break;
        }
      }
    }
    const record: StoredBusiness = {
      id: generateId(),
      name: data.name,
      type: data.type,
      ownerName: data.ownerName,
      ownerEmail: data.ownerEmail,
      ownerPhone: data.ownerPhone,
      ownerPasswordHash: data.ownerPasswordHash,
      staffPasswordHash: data.staffPasswordHash,
      businessCode: businessCode!,
      plan: data.plan ?? 'FREE',
      createdAt: new Date().toISOString(),
    };
    await db.put('businesses', record);
    return record;
  },

  async update(biz: StoredBusiness): Promise<void> {
    const db = await getDB();
    await db.put('businesses', biz);
  },

  async findById(id: string): Promise<StoredBusiness | undefined> {
    const db = await getDB();
    return (await db.get('businesses', id)) as StoredBusiness | undefined;
  },

  async findByName(name: string): Promise<StoredBusiness | undefined> {
    const db = await getDB();
    const all = (await db.getAll('businesses')) as StoredBusiness[];
    return all.find((b) => b.name.toLowerCase() === name.toLowerCase());
  },

  async findByCode(code: string): Promise<StoredBusiness | undefined> {
    const db = await getDB();
    const all = (await db.getAll('businesses')) as StoredBusiness[];
    return all.find((b) => b.businessCode.toUpperCase() === code.toUpperCase());
  },

  async setPlan(id: string, plan: 'FREE' | 'PREMIUM'): Promise<StoredBusiness | undefined> {
    const biz = await this.findById(id);
    if (!biz) return undefined;
    const updated: StoredBusiness = { ...biz, plan };
    await this.update(updated);
    return updated;
  },

  async list(): Promise<StoredBusiness[]> {
    const db = await getDB();
    return (await db.getAll('businesses')) as StoredBusiness[];
  }
};
