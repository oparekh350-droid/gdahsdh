import { z } from 'zod';

export const ServiceSchema = z.object({
  name: z.string().min(1, 'Service name is required'),
  serviceCharge: z.number().nonnegative('Service charge must be 0 or more')
});

export type ServiceInput = z.infer<typeof ServiceSchema>;

export type Service = ServiceInput & {
  id: string;
  createdAt: string;
};
