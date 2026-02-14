import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { store, FeeStructure } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

const emptyFee: Omit<FeeStructure, 'id'> = {
  className: '', feeType: '', amount: 0, dueDate: '', frequency: 'Monthly',
};

const Fees = () => {
  const [fees, setFees] = useState(store.getFees());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyFee);
  const classes = store.getClasses();

  const save = (list: FeeStructure[]) => { setFees(list); store.setFees(list); };

  const openNew = () => { setForm(emptyFee); setEditId(null); setDialogOpen(true); };
  const openEdit = (f: FeeStructure) => { setForm(f); setEditId(f.id); setDialogOpen(true); };

  const handleSave = () => {
    if (!form.feeType || !form.className) { toast.error('Fee type and class are required'); return; }
    if (editId) {
      save(fees.map(f => f.id === editId ? { ...form, id: editId } : f));
      toast.success('Fee updated');
    } else {
      save([...fees, { ...form, id: store.generateId() }]);
      toast.success('Fee added');
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => { save(fees.filter(f => f.id !== id)); toast.success('Fee removed'); };
  const updateForm = (key: string, value: string | number) => setForm(prev => ({ ...prev, [key]: value }));

  return (
    <div>
      <PageHeader title="Fee Management" description="Configure fee structures" actions={<Button onClick={openNew} size="sm"><Plus className="h-4 w-4 mr-1" /> Add Fee</Button>} />

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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{editId ? 'Edit Fee' : 'Add Fee'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
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
          <DialogFooter><Button onClick={handleSave}>{editId ? 'Update' : 'Add'} Fee</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Fees;
