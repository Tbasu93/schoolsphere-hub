import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { store, Student, SubjectEntry } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Search, Pencil, Trash2, BookOpen } from "lucide-react";
import { toast } from "sonner";

const categoryColors: Record<string, string> = {
  'Core': 'bg-primary/10 text-primary border-primary/20',
  '2nd Language': 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
  '3rd Language': 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
  'Additional': 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
};

const emptyStudent: Omit<Student, 'id'> = {
  name: '', rollNo: '', className: '', section: '', gender: 'Male', dob: '',
  guardianName: '', phone: '', email: '', address: '', admissionDate: '', status: 'Active', house: '',
};

const Students = () => {
  const [students, setStudents] = useState(store.getStudents());
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('All');
  const [filterSection, setFilterSection] = useState('All');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyStudent);
  const [subjectsDialogStudent, setSubjectsDialogStudent] = useState<Student | null>(null);
  const classes = store.getClasses();
  const houseConfig = store.getHouseConfig();

  const save = (list: Student[]) => { setStudents(list); store.setStudents(list); };

  const filtered = students.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.rollNo.includes(search);
    const matchClass = filterClass === 'All' || s.className === filterClass;
    const matchSection = filterSection === 'All' || s.section === filterSection;
    return matchSearch && matchClass && matchSection;
  });

  const filterSections = filterClass === 'All'
    ? [...new Set(students.map(s => s.section).filter(Boolean))]
    : classes.find(c => c.name === filterClass)?.sections || [];

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

  const handleDelete = (id: string) => { save(students.filter(s => s.id !== id)); toast.success('Student removed'); };
  const updateForm = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));
  const selectedClassSections = classes.find(c => c.name === form.className)?.sections || [];

  const getStudentSubjects = (s: Student): SubjectEntry[] => {
    const classConfig = classes.find(c => c.name === s.className);
    if (!classConfig) return [];
    return classConfig.sectionSubjects?.[s.section] || [];
  };

  return (
    <div>
      <PageHeader title="Students" description={`${students.length} students enrolled`}
        actions={<Button onClick={openNew} size="sm"><Plus className="h-4 w-4 mr-1" /> Add Student</Button>} />

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name or roll no..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterClass} onValueChange={v => { setFilterClass(v); setFilterSection('All'); }}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Classes</SelectItem>
            {classes.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterSection} onValueChange={setFilterSection}>
          <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Sections</SelectItem>
            {filterSections.map(s => <SelectItem key={s} value={s}>Section {s}</SelectItem>)}
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
              <TableHead>House</TableHead>
              <TableHead>Guardian</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-28">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(s => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.name}</TableCell>
                <TableCell>{s.rollNo}</TableCell>
                <TableCell>{s.className}</TableCell>
                <TableCell>{s.section}</TableCell>
                <TableCell>{s.house || '—'}</TableCell>
                <TableCell>{s.guardianName}</TableCell>
                <TableCell><Badge variant={s.status === 'Active' ? 'default' : 'secondary'} className="text-[10px]">{s.status}</Badge></TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" title="Show Subjects" onClick={() => setSubjectsDialogStudent(s)}><BookOpen className="h-3 w-3" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(s)}><Pencil className="h-3 w-3" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(s.id)}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No students found</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Show Subjects Dialog */}
      <Dialog open={!!subjectsDialogStudent} onOpenChange={open => !open && setSubjectsDialogStudent(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Subjects — {subjectsDialogStudent?.name}</DialogTitle></DialogHeader>
          {subjectsDialogStudent && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">{subjectsDialogStudent.className} • Section {subjectsDialogStudent.section}</p>
              {(() => {
                const subs = getStudentSubjects(subjectsDialogStudent);
                if (subs.length === 0) return <p className="text-sm text-muted-foreground">No subjects configured.</p>;
                const grouped: Record<string, string[]> = {};
                subs.forEach(s => { if (!grouped[s.category]) grouped[s.category] = []; grouped[s.category].push(s.name); });
                return Object.entries(grouped).map(([cat, names]) => (
                  <div key={cat}>
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{cat}</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {names.map(n => <Badge key={n} variant="outline" className={`text-xs border ${categoryColors[cat] || ''}`}>{n}</Badge>)}
                    </div>
                  </div>
                ));
              })()}
            </div>
          )}
        </DialogContent>
      </Dialog>

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
            <div>
              <Label>House</Label>
              <Select value={form.house || ''} onValueChange={v => updateForm('house', v)}>
                <SelectTrigger><SelectValue placeholder="Select house" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {houseConfig.names.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                </SelectContent>
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
