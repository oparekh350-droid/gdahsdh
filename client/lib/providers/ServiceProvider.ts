import { ServiceSchema, type ServiceInput, type Service } from '@/lib/validators/service';
import { serviceRepository } from '@/services/indexeddb/repositories/serviceRepository';

export const ServiceProvider = {
  async addService(input: ServiceInput): Promise<Service> {
    const parsed = ServiceSchema.parse(input);
    const record: Omit<Service, 'id'> = {
      name: parsed.name,
      serviceCharge: parsed.serviceCharge,
      createdAt: new Date().toISOString()
    };
    return serviceRepository.add(record);
  },
  async updateService(id: string, data: Partial<ServiceInput>): Promise<void> {
    const existing = await serviceRepository.getById(id);
    if (!existing) throw new Error('Service not found');
    const updated = { ...existing, ...data } as Service;
    await serviceRepository.update(updated);
  }
};
