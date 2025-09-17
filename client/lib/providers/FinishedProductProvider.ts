import { ProductSchema, type ProductInput, type Product } from '@/lib/validators/product';
import { productRepository } from '@/services/indexeddb/repositories/productRepository';

export const FinishedProductProvider = {
  async addFinishedProduct(input: ProductInput): Promise<Product> {
    const parsed = ProductSchema.parse(input);
    const costPerUnit = parsed.orderQuantity > 0 ? parsed.totalCost / parsed.orderQuantity : 0;
    const record: Omit<Product, 'id'> = {
      name: parsed.name,
      sku: parsed.sku,
      category: parsed.category,
      variant: parsed.variant,
      orderQuantity: parsed.orderQuantity,
      totalCost: parsed.totalCost,
      costPerUnit,
      expiry: parsed.expiry,
      unit: parsed.unit ?? 'pcs'
    };
    return productRepository.add(record);
  }
};
