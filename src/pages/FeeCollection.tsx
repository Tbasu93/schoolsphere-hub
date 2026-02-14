import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { store, FeePayment } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";

const FeeCollection = () => {
  const students = store.getStudents();
  const fees = store.getFees();
  const classes = store.getClasses();
  const [payments, setPayments] = useState(store.getFeePayments());
  const [sheetOpen, setSheetOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const [form, setForm] = useState({
    studentId: '',
    feeType: '',
    paidAmount: 0,
    paidDate: new Date().toISOString().split('T')[0],
  });

  const save = (list: FeePayment[]) => { setPayments(list); store.setFeePayments(list); };

  const selectedStudent = students.find(s => s.id === form.studentId);
  const applicableFees = fees.filter(f => f.className === 'All Classes' || f.className === selectedStudent?.className);
  const selectedFee = applicableFees.find(f => f.feeType === form.feeType);

  const handleSave = () => {
    if (!form.studentId || !form.feeType || form.paidAmount <= 0) {
      toast.error('Fill all fields correctly');
      return;
    }

    const student = students.find(s => s.id === form.studentId)!;
    const feeAmount = selectedFee?.amount || 0;
    const status = form.paidAmount >= feeAmount ? 'Paid' : 'Partial';

    const payment: FeePayment = {
      id: store.generateId(),
      studentId: form.studentId,
      studentName: student.name,
      className: student.className,
      feeType: form.feeType,
      amount: feeAmount,
      paidAmount: form.paidAmount,
      paidDate: form.paidDate,
      status,
      receiptNo: `RCP-${Date.now().toString(36).toUpperCase()}`,
    };

    save([...payments, payment]);
    toast.success(`Payment recorded. Receipt: ${payment.receiptNo}`);
    setSheetOpen(false);
  };

  const filtered = payments.filter(p => {
    const matchSearch = p.studentName.toLowerCase().includes(search.toLowerCase()) || p.receiptNo.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'All' || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div>
      <PageHeader
        title="Fee Collection"
        description="Record and track fee payments"
        actions={<Button onClick={() => { setForm({ studentId: '', feeType: '', paidAmount: 0, paidDate: new Date().toISOString().split('T')[0] }); setSheetOpen(true); }} size="sm"><Plus className="h-4 w-4 mr-1" /> Collect Fee</Button>}
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by student or receipt..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Status</SelectItem>
            <SelectItem value="Paid">Paid</SelectItem>
            <SelectItem value="Partial">Partial</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Receipt No</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Fee Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Paid</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(p => (
              <TableRow key={p.id}>
                <TableCell className="font-mono text-xs">{p.receiptNo}</TableCell>
                <TableCell className="font-medium">{p.studentName}</TableCell>
                <TableCell>{p.className}</TableCell>
                <TableCell>{p.feeType}</TableCell>
                <TableCell>₹{p.amount.toLocaleString('en-IN')}</TableCell>
                <TableCell>₹{p.paidAmount.toLocaleString('en-IN')}</TableCell>
                <TableCell>{new Date(p.paidDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</TableCell>
                <TableCell>
                  <Badge variant={p.status === 'Paid' ? 'default' : 'secondary'} className="text-[10px]">{p.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No payments recorded</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader><SheetTitle>Collect Fee</SheetTitle></SheetHeader>
          <div className="space-y-4 mt-6">
            <div>
              <Label>Student *</Label>
              <Select value={form.studentId} onValueChange={v => setForm(prev => ({ ...prev, studentId: v, feeType: '' }))}>
                <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                <SelectContent>
                  {students.filter(s => s.status === 'Active').map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name} ({s.className} - {s.section})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {form.studentId && (
              <div>
                <Label>Fee Type *</Label>
                <Select value={form.feeType} onValueChange={v => setForm(prev => ({ ...prev, feeType: v, paidAmount: applicableFees.find(f => f.feeType === v)?.amount || 0 }))}>
                  <SelectTrigger><SelectValue placeholder="Select fee" /></SelectTrigger>
                  <SelectContent>
                    {applicableFees.map(f => (
                      <SelectItem key={f.id} value={f.feeType}>{f.feeType} - ₹{f.amount.toLocaleString('en-IN')}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {selectedFee && (
              <div className="p-3 rounded-lg bg-muted/50 text-sm">
                <p>Fee Amount: <strong>₹{selectedFee.amount.toLocaleString('en-IN')}</strong></p>
                <p>Frequency: {selectedFee.frequency}</p>
              </div>
            )}
            <div>
              <Label>Amount Paid (₹)</Label>
              <Input type="number" value={form.paidAmount} onChange={e => setForm(prev => ({ ...prev, paidAmount: Number(e.target.value) }))} />
            </div>
            <div>
              <Label>Payment Date</Label>
              <Input type="date" value={form.paidDate} onChange={e => setForm(prev => ({ ...prev, paidDate: e.target.value }))} />
            </div>
          </div>
          <SheetFooter className="mt-6"><Button onClick={handleSave} className="w-full">Record Payment</Button></SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default FeeCollection;
