import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { store, Staff as StaffType } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

const emptyStaff: Omit<StaffType, 'id'> = {
  name: '', employeeId: '', role: '', department: '', phone: '', email: '', joinDate: '', status: 'Active',
};

const StaffPage = () => {
  const [staffList, setStaffList] = useState(store.getStaff());
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyStaff);

  const save = (list: StaffType[]) => { setStaffList(list); store.setStaff(list); };
  const filtered = staffList.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.role.toLowerCase().includes(search.toLowerCase()));

  const openNew = () => { setForm(emptyStaff); setEditId(null); setDialogOpen(true); };
  const openEdit = (s: StaffType) => { setForm(s); setEditId(s.id); setDialogOpen(true); };

  const handleSave = () => {
    if (!form.name) { toast.error('Name is required'); return; }
    if (editId) {
      save(staffList.map(s => s.id === editId ? { ...form, id: editId } : s));
      toast.success('Staff updated');
    } else {
      save([...staffList, { ...form, id: store.generateId() }]);
      toast.success('Staff added');
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => { save(staffList.filter(s => s.id !== id)); toast.success('Staff removed'); };
  const updateForm = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  return (
    <div>
      <PageHeader title="Non-Teaching Staff" description={`${staffList.length} staff members`} actions={<Button onClick={openNew} size="sm"><Plus className="h-4 w-4 mr-1" /> Add Staff</Button>} />

      <div className="relative mb-4 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by name or role..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Employee ID</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(s => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.name}</TableCell>
                <TableCell>{s.employeeId}</TableCell>
                <TableCell>{s.role}</TableCell>
                <TableCell>{s.department}</TableCell>
                <TableCell>{s.phone}</TableCell>
                <TableCell><Badge variant={s.status === 'Active' ? 'default' : 'secondary'} className="text-[10px]">{s.status}</Badge></TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(s)}><Pencil className="h-3 w-3" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(s.id)}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No staff found</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editId ? 'Edit Staff' : 'Add Staff'}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><Label>Full Name *</Label><Input value={form.name} onChange={e => updateForm('name', e.target.value)} /></div>
            <div><Label>Employee ID</Label><Input value={form.employeeId} onChange={e => updateForm('employeeId', e.target.value)} /></div>
            <div><Label>Role</Label><Input value={form.role} onChange={e => updateForm('role', e.target.value)} /></div>
            <div><Label>Department</Label><Input value={form.department} onChange={e => updateForm('department', e.target.value)} /></div>
            <div><Label>Join Date</Label><Input type="date" value={form.joinDate} onChange={e => updateForm('joinDate', e.target.value)} /></div>
            <div><Label>Phone</Label><Input value={form.phone} onChange={e => updateForm('phone', e.target.value)} /></div>
            <div><Label>Email</Label><Input value={form.email} onChange={e => updateForm('email', e.target.value)} /></div>
          </div>
          <DialogFooter><Button onClick={handleSave}>{editId ? 'Update' : 'Add'} Staff</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StaffPage;
