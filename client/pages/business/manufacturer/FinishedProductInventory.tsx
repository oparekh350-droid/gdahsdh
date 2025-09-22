import { useEffect, useMemo, useState } from 'react';
import BackButton from '@/components/BackButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AddProductForm from '@/components/forms/AddProductForm';
import AddRawMaterialForm from '@/components/forms/AddRawMaterialForm';
import { productRepository } from '@/services/indexeddb/repositories/productRepository';
import type { Product } from '@/lib/validators/product';
import { formatCurrency } from '@/lib/business-data';

export default function FinishedProductInventory() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'finished'|'raw'>('finished');
  const [list, setList] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Record<string, Product>>({});
  const [search, setSearch] = useState('');

  const reload = async () => {
    try { setList(await productRepository.getAll()); } catch { setList([]); }
  };

  useEffect(() => { reload(); }, []);

  const filtered = useMemo(() => list.filter(p => (p.name || '').toLowerCase().includes(search.toLowerCase())), [list, search]);

  const saveEdit = async (id: string) => {
    const rec = editing[id];
    await productRepository.update(rec);
    setEditing(prev => { const { [id]:_, ...rest } = prev; return rest; });
    reload();
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <BackButton />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Finished Product Inventory</h1>
        <Button onClick={() => { setTab('finished'); setOpen(true); }}>Add Inventory Item</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
          <CardDescription>Add, view, and edit finished products</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-3">
            <Input placeholder="Search products" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="space-y-3">
            {filtered.map(p => (
              <div key={p.id} className="p-3 border rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex-1">
                  {editing[p.id] ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <Input value={editing[p.id].name} onChange={e => setEditing(prev => ({ ...prev, [p.id]: { ...prev[p.id], name: e.target.value } }))} />
                      <Input value={editing[p.id].sku || ''} onChange={e => setEditing(prev => ({ ...prev, [p.id]: { ...prev[p.id], sku: e.target.value } }))} placeholder="SKU" />
                      <Input type="number" step="0.0001" value={editing[p.id].costPerUnit || 0} onChange={e => setEditing(prev => ({ ...prev, [p.id]: { ...prev[p.id], costPerUnit: Number(e.target.value) || 0 } }))} placeholder="Cost per unit" />
                    </div>
                  ) : (
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-sm text-gray-600">SKU: {p.sku || '-'} • Cost/Unit: {formatCurrency(p.costPerUnit || 0)}</p>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  {editing[p.id] ? (
                    <>
                      <Button size="sm" onClick={() => saveEdit(p.id)}>Save</Button>
                      <Button size="sm" variant="outline" onClick={() => setEditing(prev => { const { [p.id]:_, ...rest } = prev; return rest; })}>Cancel</Button>
                    </>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => setEditing(prev => ({ ...prev, [p.id]: p }))}>Edit</Button>
                  )}
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="text-sm text-gray-500">No products added yet.</p>
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
              <AddProductForm onSuccess={()=>{ setOpen(false); reload(); }} />
            </TabsContent>
            <TabsContent value="raw">
              <AddRawMaterialForm onSuccess={()=>{ setOpen(false); }} />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
