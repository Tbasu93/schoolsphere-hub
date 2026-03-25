import { useState, useMemo } from "react";
import { PageHeader } from "@/components/PageHeader";
import { store, Certificate } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Trash2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const certTypes: Certificate['type'][] = ['Transfer Certificate', 'Character Certificate', 'Migration Certificate'];

const Certificates = () => {
  const allStudents = store.getStudents();
  const classes = store.getClasses();
  const [certs, setCerts] = useState(store.getCertificates());
  const [sheetOpen, setSheetOpen] = useState(false);
  const [form, setForm] = useState({ studentId: '', type: 'Transfer Certificate' as Certificate['type'], appliedDate: new Date().toISOString().split('T')[0] });

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  const saveCerts = (list: Certificate[]) => { setCerts(list); store.setCertificates(list); };

  const filtered = useMemo(() => {
    return certs.filter(c => {
      if (search && !c.studentName.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterType !== 'All' && c.type !== filterType) return false;
      if (filterStatus !== 'All' && c.status !== filterStatus) return false;
      return true;
    });
  }, [certs, search, filterType, filterStatus]);

  const handleApply = () => {
    if (!form.studentId || !form.type) { toast.error('Student and type required'); return; }
    const student = allStudents.find(s => s.id === form.studentId);
    if (!student) return;
    const cert: Certificate = {
      id: store.generateId(), studentId: student.id, studentName: student.name,
      className: student.className, section: student.section,
      type: form.type, appliedDate: form.appliedDate, issuedDate: '', status: 'Applied',
    };
    saveCerts([...certs, cert]);
    toast.success('Application recorded');
    setSheetOpen(false);
  };

  const markIssued = (id: string) => {
    saveCerts(certs.map(c => c.id === id ? { ...c, status: 'Issued' as const, issuedDate: new Date().toISOString().split('T')[0] } : c));
    toast.success('Certificate marked as issued');
  };

  const deleteCert = (id: string) => { saveCerts(certs.filter(c => c.id !== id)); toast.success('Removed'); };

  return (
    <div>
      <PageHeader title="Certificates" description="Track TC, CC, and Migration certificates"
        actions={<Button onClick={() => { setForm({ studentId: '', type: 'Transfer Certificate', appliedDate: new Date().toISOString().split('T')[0] }); setSheetOpen(true); }} size="sm"><Plus className="h-4 w-4 mr-1" /> New Application</Button>} />

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by student..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Types</SelectItem>
            {certTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Status</SelectItem>
            <SelectItem value="Applied">Applied</SelectItem>
            <SelectItem value="Issued">Issued</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Class/Sec</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Applied Date</TableHead>
              <TableHead>Issued Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(c => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.studentName}</TableCell>
                <TableCell>{c.className} - {c.section}</TableCell>
                <TableCell>{c.type}</TableCell>
                <TableCell>{new Date(c.appliedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</TableCell>
                <TableCell>{c.issuedDate ? new Date(c.issuedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</TableCell>
                <TableCell><Badge variant={c.status === 'Issued' ? 'default' : 'secondary'} className="text-[10px]">{c.status}</Badge></TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {c.status === 'Applied' && (
                      <Button variant="ghost" size="icon" className="h-7 w-7" title="Mark Issued" onClick={() => markIssued(c.id)}><CheckCircle className="h-3 w-3 text-green-600" /></Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteCert(c.id)}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No certificates found</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent>
          <SheetHeader><SheetTitle>New Certificate Application</SheetTitle></SheetHeader>
          <div className="space-y-4 mt-6">
            <div>
              <Label>Student *</Label>
              <Select value={form.studentId} onValueChange={v => setForm(prev => ({ ...prev, studentId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                <SelectContent>{allStudents.map(s => <SelectItem key={s.id} value={s.id}>{s.name} ({s.className}-{s.section})</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Certificate Type *</Label>
              <Select value={form.type} onValueChange={v => setForm(prev => ({ ...prev, type: v as any }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{certTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Applied Date</Label><Input type="date" value={form.appliedDate} onChange={e => setForm(prev => ({ ...prev, appliedDate: e.target.value }))} /></div>
          </div>
          <SheetFooter className="mt-6"><Button onClick={handleApply} className="w-full">Submit Application</Button></SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Certificates;
