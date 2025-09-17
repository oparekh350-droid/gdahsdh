import { getDB } from '@/services/indexeddb/db';
import type { Service } from '@/lib/validators/service';

export const serviceRepository = {
  async add(service: Omit<Service, 'id'>): Promise<Service> {
    const db = await getDB();
    const id = `svc_${crypto.randomUUID()}`;
    const record: Service = { ...service, id };
    await db.put('services', record);
    return record;
  },
  async update(service: Service): Promise<void> {
    const db = await getDB();
    await db.put('services', service);
  },
  async getAll(): Promise<Service[]> {
    const db = await getDB();
    return await db.getAll('services');
  },
  async getById(id: string): Promise<Service | undefined> {
    const db = await getDB();
    return await db.get('services', id);
  },
  async remove(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('services', id);
  }
};
