import { useEffect, useMemo, useState } from 'react';
import BackButton from '@/components/BackButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AddProductForm from '@/components/forms/AddProductForm';
import AddRawMaterialForm from '@/components/forms/AddRawMaterialForm';
import { rawMaterialRepository } from '@/services/indexeddb/repositories/rawMaterialRepository';
import type { RawMaterial } from '@/lib/validators/rawMaterial';
import { formatCurrency } from '@/lib/business-data';

export default function RawMaterialInventory() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'finished'|'raw'>('raw');
  const [list, setList] = useState<RawMaterial[]>([]);
  const [editing, setEditing] = useState<Record<string, RawMaterial>>({});
  const [search, setSearch] = useState('');

  const reload = async () => {
    try { setList(await rawMaterialRepository.getAll()); } catch { setList([]); }
  };

  useEffect(() => { reload(); }, []);

  const filtered = useMemo(() => list.filter(rm => (rm.name || '').toLowerCase().includes(search.toLowerCase())), [list, search]);

  const saveEdit = async (id: string) => {
    const rec = editing[id];
    await rawMaterialRepository.update(rec);
    setEditing(prev => { const { [id]:_, ...rest } = prev; return rest; });
    reload();
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <BackButton />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Raw Material Inventory</h1>
        <Button onClick={() => { setTab('raw'); setOpen(true); }}>Add Inventory Item</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Raw Materials</CardTitle>
          <CardDescription>Add, view, and edit raw materials</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-3">
            <Input placeholder="Search raw materials" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="space-y-3">
            {filtered.map(rm => (
              <div key={rm.id} className="p-3 border rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex-1">
                  {editing[rm.id] ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <Input value={editing[rm.id].name} onChange={e => setEditing(prev => ({ ...prev, [rm.id]: { ...prev[rm.id], name: e.target.value } }))} />
                      <Input value={editing[rm.id].category || ''} onChange={e => setEditing(prev => ({ ...prev, [rm.id]: { ...prev[rm.id], category: e.target.value } }))} placeholder="Category" />
                      <Input type="number" step="0.01" value={editing[rm.id].unitPrice || 0} onChange={e => setEditing(prev => ({ ...prev, [rm.id]: { ...prev[rm.id], unitPrice: Number(e.target.value) || 0 } }))} placeholder="Unit price" />
                    </div>
                  ) : (
                    <div>
                      <p className="font-medium">{rm.name}</p>
                      <p className="text-sm text-gray-600">Category: {rm.category || '-'} • Qty: {rm.quantity} {rm.unit} • Unit Cost: {formatCurrency(rm.unitPrice || 0)}</p>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  {editing[rm.id] ? (
                    <>
                      <Button size="sm" onClick={() => saveEdit(rm.id)}>Save</Button>
                      <Button size="sm" variant="outline" onClick={() => setEditing(prev => { const { [rm.id]:_, ...rest } = prev; return rest; })}>Cancel</Button>
                    </>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => setEditing(prev => ({ ...prev, [rm.id]: rm }))}>Edit</Button>
                  )}
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="text-sm text-gray-500">No raw materials added yet.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Add Inventory Item</DialogTitle>
            <DialogDescription>Choose what you want to add and fill in details. Unit costs auto-calculate.</DialogDescription>
          </DialogHeader>
          <Tabs value={tab} onValueChange={(v)=>{ sessionStorage.setItem('inventory_add_tab', v); setTab(v as any); }}>
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="finished">Finished Product</TabsTrigger>
              <TabsTrigger value="raw">Raw Material</TabsTrigger>
            </TabsList>
            <TabsContent value="finished">
              <AddProductForm onSuccess={()=>{ setOpen(false); }} />
            </TabsContent>
            <TabsContent value="raw">
              <AddRawMaterialForm onSuccess={()=>{ setOpen(false); reload(); }} />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
