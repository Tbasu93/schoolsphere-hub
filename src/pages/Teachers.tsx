import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { store, Teacher } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

const emptyTeacher: Omit<Teacher, 'id'> = {
  name: '', employeeId: '', subject: '', phone: '', email: '', qualification: '', joinDate: '', status: 'Active',
};

const Teachers = () => {
  const [teachers, setTeachers] = useState(store.getTeachers());
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyTeacher);

  const save = (list: Teacher[]) => { setTeachers(list); store.setTeachers(list); };
  const filtered = teachers.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || t.subject.toLowerCase().includes(search.toLowerCase()));

  const openNew = () => { setForm(emptyTeacher); setEditId(null); setDialogOpen(true); };
  const openEdit = (t: Teacher) => { setForm(t); setEditId(t.id); setDialogOpen(true); };

  const handleSave = () => {
    if (!form.name) { toast.error('Name is required'); return; }
    if (editId) {
      save(teachers.map(t => t.id === editId ? { ...form, id: editId } : t));
      toast.success('Teacher updated');
    } else {
      save([...teachers, { ...form, id: store.generateId() }]);
      toast.success('Teacher added');
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => { save(teachers.filter(t => t.id !== id)); toast.success('Teacher removed'); };
  const updateForm = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  return (
    <div>
      <PageHeader title="Teachers" description={`${teachers.length} teachers`} actions={<Button onClick={openNew} size="sm"><Plus className="h-4 w-4 mr-1" /> Add Teacher</Button>} />

      <div className="relative mb-4 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by name or subject..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Employee ID</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Qualification</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(t => (
              <TableRow key={t.id}>
                <TableCell className="font-medium">{t.name}</TableCell>
                <TableCell>{t.employeeId}</TableCell>
                <TableCell>{t.subject}</TableCell>
                <TableCell>{t.qualification}</TableCell>
                <TableCell>{t.phone}</TableCell>
                <TableCell><Badge variant={t.status === 'Active' ? 'default' : 'secondary'} className="text-[10px]">{t.status}</Badge></TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(t)}><Pencil className="h-3 w-3" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(t.id)}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No teachers found</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editId ? 'Edit Teacher' : 'Add Teacher'}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><Label>Full Name *</Label><Input value={form.name} onChange={e => updateForm('name', e.target.value)} /></div>
            <div><Label>Employee ID</Label><Input value={form.employeeId} onChange={e => updateForm('employeeId', e.target.value)} /></div>
            <div><Label>Subject</Label><Input value={form.subject} onChange={e => updateForm('subject', e.target.value)} /></div>
            <div><Label>Qualification</Label><Input value={form.qualification} onChange={e => updateForm('qualification', e.target.value)} /></div>
            <div><Label>Join Date</Label><Input type="date" value={form.joinDate} onChange={e => updateForm('joinDate', e.target.value)} /></div>
            <div><Label>Phone</Label><Input value={form.phone} onChange={e => updateForm('phone', e.target.value)} /></div>
            <div><Label>Email</Label><Input value={form.email} onChange={e => updateForm('email', e.target.value)} /></div>
          </div>
          <DialogFooter><Button onClick={handleSave}>{editId ? 'Update' : 'Add'} Teacher</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Teachers;
