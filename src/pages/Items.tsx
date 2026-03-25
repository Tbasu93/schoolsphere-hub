import { useState, useMemo } from "react";
import { PageHeader } from "@/components/PageHeader";
import { store, StudentItem } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  Collected: 'default',
  Pending: 'destructive',
  Booked: 'secondary',
};

const Items = () => {
  const classes = store.getClasses();
  const allStudents = store.getStudents();
  const [items, setItems] = useState(store.getStudentItems());
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ studentId: '', itemName: '', quantity: 1, status: 'Pending' as StudentItem['status'], date: new Date().toISOString().split('T')[0] });

  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('All');
  const [filterItem, setFilterItem] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  const saveItems = (list: StudentItem[]) => { setItems(list); store.setStudentItems(list); };

  const uniqueItemNames = [...new Set(items.map(i => i.itemName).filter(Boolean))];

  const filtered = useMemo(() => {
    return items.filter(i => {
      if (search && !i.studentName.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterClass !== 'All' && i.className !== filterClass) return false;
      if (filterItem !== 'All' && i.itemName !== filterItem) return false;
      if (filterStatus !== 'All' && i.status !== filterStatus) return false;
      return true;
    });
  }, [items, search, filterClass, filterItem, filterStatus]);

  const openNew = () => { setForm({ studentId: '', itemName: '', quantity: 1, status: 'Pending', date: new Date().toISOString().split('T')[0] }); setEditId(null); setSheetOpen(true); };

  const openEdit = (item: StudentItem) => {
    setForm({ studentId: item.studentId, itemName: item.itemName, quantity: item.quantity, status: item.status, date: item.date });
    setEditId(item.id);
    setSheetOpen(true);
  };

  const handleSave = () => {
    if (!form.studentId || !form.itemName) { toast.error('Student and item name required'); return; }
    const student = allStudents.find(s => s.id === form.studentId);
    if (!student) return;

    if (editId) {
      saveItems(items.map(i => i.id === editId ? {
        ...i, studentId: student.id, studentName: student.name, className: student.className, section: student.section,
        itemName: form.itemName, quantity: form.quantity, status: form.status, date: form.date,
      } : i));
      toast.success('Item updated');
    } else {
      const item: StudentItem = {
        id: store.generateId(), studentId: student.id, studentName: student.name,
        className: student.className, section: student.section,
        itemName: form.itemName, quantity: form.quantity, status: form.status, date: form.date,
      };
      saveItems([...items, item]);
      toast.success('Item added');
    }
    setSheetOpen(false);
  };

  const deleteItem = (id: string) => { saveItems(items.filter(i => i.id !== id)); toast.success('Removed'); };

  return (
    <div>
      <PageHeader title="Student Items" description="Track books, uniforms, copies and other items"
        actions={<Button onClick={openNew} size="sm"><Plus className="h-4 w-4 mr-1" /> Add Item</Button>} />

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by student..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterClass} onValueChange={setFilterClass}>
          <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Classes</SelectItem>
            {classes.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterItem} onValueChange={setFilterItem}>
          <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Items</SelectItem>
            {uniqueItemNames.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Status</SelectItem>
            <SelectItem value="Collected">Collected</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Booked">Booked</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Class/Sec</TableHead>
              <TableHead>Item</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(i => (
              <TableRow key={i.id}>
                <TableCell className="font-medium">{i.studentName}</TableCell>
                <TableCell>{i.className} - {i.section}</TableCell>
                <TableCell>{i.itemName}</TableCell>
                <TableCell>{i.quantity}</TableCell>
                <TableCell>{new Date(i.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</TableCell>
                <TableCell><Badge variant={statusColors[i.status] as any} className="text-[10px]">{i.status}</Badge></TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(i)}><Pencil className="h-3 w-3" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteItem(i.id)}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No items recorded</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent>
          <SheetHeader><SheetTitle>{editId ? 'Edit Item' : 'Add Item'}</SheetTitle></SheetHeader>
          <div className="space-y-4 mt-6">
            <div>
              <Label>Student *</Label>
              <Select value={form.studentId} onValueChange={v => setForm(prev => ({ ...prev, studentId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                <SelectContent>{allStudents.filter(s => s.status === 'Active').map(s => <SelectItem key={s.id} value={s.id}>{s.name} ({s.className}-{s.section})</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Item Name *</Label><Input value={form.itemName} onChange={e => setForm(prev => ({ ...prev, itemName: e.target.value }))} placeholder="e.g. Books, Uniform, House Dress" /></div>
            <div><Label>Quantity</Label><Input type="number" min={1} value={form.quantity} onChange={e => setForm(prev => ({ ...prev, quantity: Number(e.target.value) }))} /></div>
            <div><Label>Date</Label><Input type="date" value={form.date} onChange={e => setForm(prev => ({ ...prev, date: e.target.value }))} /></div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm(prev => ({ ...prev, status: v as any }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Pending">Pending</SelectItem><SelectItem value="Booked">Booked</SelectItem><SelectItem value="Collected">Collected</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          <SheetFooter className="mt-6"><Button onClick={handleSave} className="w-full">{editId ? 'Update' : 'Add'} Item</Button></SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Items;
