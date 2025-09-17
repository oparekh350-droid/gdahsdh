import { useState } from 'react';
import BackButton from '@/components/BackButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useServices, useAddService, useUpdateService } from '@/hooks/useService';
import type { Service } from '@/lib/validators/service';

export default function Services() {
  const { data: services = [] } = useServices();
  const addService = useAddService();
  const updateService = useUpdateService();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [charge, setCharge] = useState<number>(0);
  const [editing, setEditing] = useState<Record<string, Service>>({});

  const resetForm = () => { setName(''); setCharge(0); };

  const handleAdd = async () => {
    await addService.mutateAsync({ name, serviceCharge: Number(charge) });
    setOpen(false);
    resetForm();
  };

  const startEdit = (svc: Service) => {
    setEditing(prev => ({ ...prev, [svc.id]: { ...svc } }));
  };

  const saveEdit = async (id: string) => {
    const svc = editing[id];
    await updateService.mutateAsync(svc);
    setEditing(prev => { const { [id]: _, ...rest } = prev; return rest; });
  };

  return (
    <div className="p-6 space-y-6">
      <BackButton />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Services</h1>
        <Button onClick={() => setOpen(true)}>Add Service</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Service Inventory</CardTitle>
          <CardDescription>Add, view, and edit your services</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {services.map(svc => (
              <div key={svc.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 border rounded-lg">
                <div className="flex-1">
                  {editing[svc.id] ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input value={editing[svc.id].name} onChange={e => setEditing(prev => ({ ...prev, [svc.id]: { ...prev[svc.id], name: e.target.value } }))} />
                      <Input type="number" step="0.01" value={editing[svc.id].serviceCharge} onChange={e => setEditing(prev => ({ ...prev, [svc.id]: { ...prev[svc.id], serviceCharge: Number(e.target.value) || 0 } }))} />
                    </div>
                  ) : (
                    <div>
                      <p className="font-medium">{svc.name}</p>
                      <p className="text-sm text-gray-600">Service Charge: ₹{svc.serviceCharge.toFixed(2)}</p>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  {editing[svc.id] ? (
                    <>
                      <Button size="sm" onClick={() => saveEdit(svc.id)} disabled={updateService.isPending}>Save</Button>
                      <Button size="sm" variant="outline" onClick={() => setEditing(prev => { const { [svc.id]: _, ...rest } = prev; return rest; })}>Cancel</Button>
                    </>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => startEdit(svc)}>Edit</Button>
                  )}
                </div>
              </div>
            ))}
            {services.length === 0 && (
              <p className="text-sm text-gray-500">No services added yet.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Service</DialogTitle>
            <DialogDescription>Enter service name and charge</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Service Name</label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Screen Replacement" />
            </div>
            <div>
              <label className="text-sm font-medium">Service Charge</label>
              <Input type="number" step="0.01" value={charge} onChange={e => setCharge(Number(e.target.value) || 0)} placeholder="e.g., 499.00" />
            </div>
            <Button className="w-full" onClick={handleAdd} disabled={addService.isPending || !name.trim()}>Add</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
