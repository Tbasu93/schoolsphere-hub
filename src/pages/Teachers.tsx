import { useState, useMemo } from "react";
import { PageHeader } from "@/components/PageHeader";
import { store, Teacher, RoutinePeriod } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

const emptyTeacher: Omit<Teacher, 'id'> = {
  name: '', employeeId: '', subject: '', phone: '', email: '', qualification: '', joinDate: '', status: 'Active',
};

const Teachers = () => {
  const [teachers, setTeachers] = useState(store.getTeachers());
  const [search, setSearch] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyTeacher);
  const routine = store.getRoutine();

  const save = (list: Teacher[]) => { setTeachers(list); store.setTeachers(list); };
  const filtered = teachers.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || t.subject.toLowerCase().includes(search.toLowerCase()));

  const openNew = () => { setForm(emptyTeacher); setEditId(null); setSheetOpen(true); };
  const openEdit = (t: Teacher) => { setForm(t); setEditId(t.id); setSheetOpen(true); };

  const handleSave = () => {
    if (!form.name) { toast.error('Name is required'); return; }
    if (editId) {
      save(teachers.map(t => t.id === editId ? { ...form, id: editId } : t));
      toast.success('Teacher updated');
    } else {
      save([...teachers, { ...form, id: store.generateId() }]);
      toast.success('Teacher added');
    }
    setSheetOpen(false);
  };

  const handleDelete = (id: string) => { save(teachers.filter(t => t.id !== id)); toast.success('Teacher removed'); };
  const updateForm = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  // Build teacher → subject → class mapping from routine
  const teacherSubjectMap = useMemo(() => {
    const map: Record<string, { subject: string; classSection: string }[]> = {};
    routine.forEach((r: RoutinePeriod) => {
      if (!map[r.teacherId]) map[r.teacherId] = [];
      const key = `${r.subject}|${r.className}-${r.section}`;
      if (!map[r.teacherId].some(e => `${e.subject}|${e.classSection}` === key)) {
        map[r.teacherId].push({ subject: r.subject, classSection: `${r.className}-${r.section}` });
      }
    });
    return map;
  }, [routine]);

  return (
    <div>
      <PageHeader title="Teachers" description={`${teachers.length} teachers`} actions={<Button onClick={openNew} size="sm"><Plus className="h-4 w-4 mr-1" /> Add Teacher</Button>} />

      <Tabs defaultValue="list">
        <TabsList className="mb-4">
          <TabsTrigger value="list">Teacher List</TabsTrigger>
          <TabsTrigger value="assignments">Subject-Class Assignments</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
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
        </TabsContent>

        <TabsContent value="assignments">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-heading">Teacher → Subject → Class/Section Mapping</CardTitle>
            </CardHeader>
            <CardContent>
              {teachers.filter(t => t.status === 'Active').length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No active teachers</p>
              ) : (
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Teacher</TableHead>
                        <TableHead>Primary Subject</TableHead>
                        <TableHead>Assigned Subjects & Classes (from Routine)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {teachers.filter(t => t.status === 'Active').map(t => {
                        const assignments = teacherSubjectMap[t.id] || [];
                        return (
                          <TableRow key={t.id}>
                            <TableCell className="font-medium">{t.name}</TableCell>
                            <TableCell>{t.subject}</TableCell>
                            <TableCell>
                              {assignments.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {assignments.map((a, i) => (
                                    <Badge key={i} variant="secondary" className="text-[10px]">
                                      {a.subject} → {a.classSection}
                                    </Badge>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground">No routine assigned</span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader><SheetTitle>{editId ? 'Edit Teacher' : 'Add Teacher'}</SheetTitle></SheetHeader>
          <div className="grid grid-cols-2 gap-3 mt-6">
            <div className="col-span-2"><Label>Full Name *</Label><Input value={form.name} onChange={e => updateForm('name', e.target.value)} /></div>
            <div><Label>Employee ID</Label><Input value={form.employeeId} onChange={e => updateForm('employeeId', e.target.value)} /></div>
            <div><Label>Subject</Label><Input value={form.subject} onChange={e => updateForm('subject', e.target.value)} /></div>
            <div><Label>Qualification</Label><Input value={form.qualification} onChange={e => updateForm('qualification', e.target.value)} /></div>
            <div><Label>Join Date</Label><Input type="date" value={form.joinDate} onChange={e => updateForm('joinDate', e.target.value)} /></div>
            <div><Label>Phone</Label><Input value={form.phone} onChange={e => updateForm('phone', e.target.value)} /></div>
            <div><Label>Email</Label><Input value={form.email} onChange={e => updateForm('email', e.target.value)} /></div>
          </div>
          <SheetFooter className="mt-6"><Button onClick={handleSave} className="w-full">{editId ? 'Update' : 'Add'} Teacher</Button></SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Teachers;
