import { RawMaterialSchema, type RawMaterialInput, type RawMaterial } from '@/lib/validators/rawMaterial';
import { rawMaterialRepository } from '@/services/indexeddb/repositories/rawMaterialRepository';

export const RawMaterialProvider = {
  async addRawMaterial(input: RawMaterialInput): Promise<RawMaterial> {
    const parsed = RawMaterialSchema.parse(input);
    const unitPrice = parsed.quantity > 0 ? parsed.totalPrice / parsed.quantity : 0;
    const record: Omit<RawMaterial, 'id'> = {
      name: parsed.name,
      category: parsed.category,
      unit: parsed.unit,
      quantity: parsed.quantity,
      warehouse: parsed.warehouse ?? '',
      expiry: parsed.expiry,
      totalPrice: parsed.totalPrice,
      unitPrice,
      createdAt: new Date().toISOString()
    };
    return rawMaterialRepository.add(record);
  }
};
