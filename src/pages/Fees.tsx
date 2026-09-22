import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { store, FeeStructure } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import BulkUpload from "@/components/BulkUpload";

const emptyFee: Omit<FeeStructure, 'id'> = {
  className: '', feeType: '', amount: 0, dueDate: '', frequency: 'Monthly',
};

const Fees = () => {
  const [fees, setFees] = useState(store.getFees());
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyFee);
  const classes = store.getClasses();

  const save = (list: FeeStructure[]) => { setFees(list); store.setFees(list); };

  const openNew = () => { setForm(emptyFee); setEditId(null); setSheetOpen(true); };
  const openEdit = (f: FeeStructure) => { setForm(f); setEditId(f.id); setSheetOpen(true); };

  const handleSave = () => {
    if (!form.feeType || !form.className) { toast.error('Fee type and class are required'); return; }
    if (editId) {
      save(fees.map(f => f.id === editId ? { ...form, id: editId } : f));
      toast.success('Fee updated');
    } else {
      save([...fees, { ...form, id: store.generateId() }]);
      toast.success('Fee added');
    }
    setSheetOpen(false);
  };

  const handleDelete = (id: string) => { save(fees.filter(f => f.id !== id)); toast.success('Fee removed'); };
  const updateForm = (key: string, value: string | number) => setForm(prev => ({ ...prev, [key]: value }));

  const importFees = (rows: Record<string, string>[]) => {
    const errors: string[] = [];
    const imported = rows.flatMap((row, index) => {
      const amount = Number(row.amount);
      if (!Number.isFinite(amount)) { errors.push(`Row ${index + 2}: amount must be a number`); return []; }
      const frequency = ['Monthly', 'Quarterly', 'Annually', 'One-time'].includes(row.frequency) ? row.frequency as FeeStructure['frequency'] : 'Monthly';
      return [{ id: store.generateId(), className: row.className || 'All Classes', feeType: row.feeType, amount, dueDate: row.dueDate || '', frequency }];
    });
    save([...fees, ...imported]);
    return { imported: imported.length, skipped: rows.length - imported.length, errors };
  };

  return (
    <div>
      <PageHeader title="Fee Management" description="Configure fee structures" actions={<><BulkUpload title="fee structures" fields={[{ key: 'feeType', label: 'Fee Type', required: true }, { key: 'className', label: 'Class' }, { key: 'amount', label: 'Amount', required: true }, { key: 'frequency', label: 'Frequency' }, { key: 'dueDate', label: 'Due Date' }]} sampleRows={[{ feeType: 'Tuition Fee', className: 'All Classes', amount: '5000', frequency: 'Monthly', dueDate: '2026-04-10' }]} onImport={importFees} /><Button onClick={openNew} size="sm"><Plus className="h-4 w-4 mr-1" /> Add Fee</Button></>} />

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fee Type</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Amount (₹)</TableHead>
              <TableHead>Frequency</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fees.map(f => (
              <TableRow key={f.id}>
                <TableCell className="font-medium">{f.feeType}</TableCell>
                <TableCell>{f.className}</TableCell>
                <TableCell>₹{f.amount.toLocaleString('en-IN')}</TableCell>
                <TableCell>{f.frequency}</TableCell>
                <TableCell>{new Date(f.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(f)}><Pencil className="h-3 w-3" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(f.id)}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {fees.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No fee structures configured</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent>
          <SheetHeader><SheetTitle>{editId ? 'Edit Fee' : 'Add Fee'}</SheetTitle></SheetHeader>
          <div className="space-y-3 mt-6">
            <div><Label>Fee Type *</Label><Input value={form.feeType} onChange={e => updateForm('feeType', e.target.value)} placeholder="e.g. Tuition Fee" /></div>
            <div>
              <Label>Class *</Label>
              <Select value={form.className} onValueChange={v => updateForm('className', v)}>
                <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Classes">All Classes</SelectItem>
                  {classes.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Amount (₹)</Label><Input type="number" value={form.amount} onChange={e => updateForm('amount', Number(e.target.value))} /></div>
            <div>
              <Label>Frequency</Label>
              <Select value={form.frequency} onValueChange={v => updateForm('frequency', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Monthly">Monthly</SelectItem>
                  <SelectItem value="Quarterly">Quarterly</SelectItem>
                  <SelectItem value="Annually">Annually</SelectItem>
                  <SelectItem value="One-time">One-time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Due Date</Label><Input type="date" value={form.dueDate} onChange={e => updateForm('dueDate', e.target.value)} /></div>
          </div>
          <SheetFooter className="mt-6"><Button onClick={handleSave} className="w-full">{editId ? 'Update' : 'Add'} Fee</Button></SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Fees;
