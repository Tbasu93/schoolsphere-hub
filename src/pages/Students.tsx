import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { store, Student } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

const emptyStudent: Omit<Student, 'id'> = {
  name: '', rollNo: '', className: '', section: '', gender: 'Male', dob: '',
  guardianName: '', phone: '', email: '', address: '', admissionDate: '', status: 'Active',
};

const Students = () => {
  const [students, setStudents] = useState(store.getStudents());
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('All');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyStudent);
  const classes = store.getClasses();

  const save = (list: Student[]) => { setStudents(list); store.setStudents(list); };

  const filtered = students.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.rollNo.includes(search);
    const matchClass = filterClass === 'All' || s.className === filterClass;
    return matchSearch && matchClass;
  });

  const openNew = () => { setForm(emptyStudent); setEditId(null); setSheetOpen(true); };
  const openEdit = (s: Student) => { setForm(s); setEditId(s.id); setSheetOpen(true); };

  const handleSave = () => {
    if (!form.name || !form.className) { toast.error('Name and Class are required'); return; }
    if (editId) {
      save(students.map(s => s.id === editId ? { ...form, id: editId } : s));
      toast.success('Student updated');
    } else {
      save([...students, { ...form, id: store.generateId() }]);
      toast.success('Student added');
    }
    setSheetOpen(false);
  };

  const handleDelete = (id: string) => {
    save(students.filter(s => s.id !== id));
    toast.success('Student removed');
  };

  const updateForm = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));
  const selectedClassSections = classes.find(c => c.name === form.className)?.sections || [];

  return (
    <div>
      <PageHeader
        title="Students"
        description={`${students.length} students enrolled`}
        actions={<Button onClick={openNew} size="sm"><Plus className="h-4 w-4 mr-1" /> Add Student</Button>}
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name or roll no..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterClass} onValueChange={setFilterClass}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Classes</SelectItem>
            {classes.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Roll No</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Section</TableHead>
              <TableHead>Guardian</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(s => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.name}</TableCell>
                <TableCell>{s.rollNo}</TableCell>
                <TableCell>{s.className}</TableCell>
                <TableCell>{s.section}</TableCell>
                <TableCell>{s.guardianName}</TableCell>
                <TableCell><Badge variant={s.status === 'Active' ? 'default' : 'secondary'} className="text-[10px]">{s.status}</Badge></TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(s)}><Pencil className="h-3 w-3" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(s.id)}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No students found</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader><SheetTitle>{editId ? 'Edit Student' : 'Add Student'}</SheetTitle></SheetHeader>
          <div className="grid grid-cols-2 gap-3 mt-6">
            <div className="col-span-2"><Label>Full Name *</Label><Input value={form.name} onChange={e => updateForm('name', e.target.value)} /></div>
            <div><Label>Roll No</Label><Input value={form.rollNo} onChange={e => updateForm('rollNo', e.target.value)} /></div>
            <div>
              <Label>Gender</Label>
              <Select value={form.gender} onValueChange={v => updateForm('gender', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent>
              </Select>
            </div>
            <div>
              <Label>Class *</Label>
              <Select value={form.className} onValueChange={v => { updateForm('className', v); updateForm('section', ''); }}>
                <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                <SelectContent>{classes.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Section</Label>
              <Select value={form.section} onValueChange={v => updateForm('section', v)}>
                <SelectTrigger><SelectValue placeholder="Select section" /></SelectTrigger>
                <SelectContent>{selectedClassSections.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Date of Birth</Label><Input type="date" value={form.dob} onChange={e => updateForm('dob', e.target.value)} /></div>
            <div><Label>Admission Date</Label><Input type="date" value={form.admissionDate} onChange={e => updateForm('admissionDate', e.target.value)} /></div>
            <div className="col-span-2"><Label>Guardian Name</Label><Input value={form.guardianName} onChange={e => updateForm('guardianName', e.target.value)} /></div>
            <div><Label>Phone</Label><Input value={form.phone} onChange={e => updateForm('phone', e.target.value)} /></div>
            <div><Label>Email</Label><Input value={form.email} onChange={e => updateForm('email', e.target.value)} /></div>
            <div className="col-span-2"><Label>Address</Label><Input value={form.address} onChange={e => updateForm('address', e.target.value)} /></div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => updateForm('status', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Inactive">Inactive</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          <SheetFooter className="mt-6"><Button onClick={handleSave} className="w-full">{editId ? 'Update' : 'Add'} Student</Button></SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Students;
