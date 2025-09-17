import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ServiceSchema, type ServiceInput, type Service } from '@/lib/validators/service';
import { serviceRepository } from '@/services/indexeddb/repositories/serviceRepository';

export function useServices() {
  return useQuery({ queryKey: ['services'], queryFn: () => serviceRepository.getAll() });
}

export function useAddService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: ServiceInput) => {
      const { ServiceProvider } = await import('@/lib/providers/ServiceProvider');
      return ServiceProvider.addService(input);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['services'] });
    }
  });
}

export function useUpdateService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (svc: Service) => {
      await serviceRepository.update(svc);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['services'] });
    }
  });
}
