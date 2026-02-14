import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { store } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle2, XCircle, Clock, Save } from "lucide-react";
import { toast } from "sonner";

const Attendance = () => {
  const classes = store.getClasses();
  const allStudents = store.getStudents();
  const [attendance, setAttendance] = useState(store.getAttendance());

  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [records, setRecords] = useState<Record<string, 'Present' | 'Absent' | 'Late'>>({});

  const sections = classes.find(c => c.name === selectedClass)?.sections || [];
  const students = allStudents.filter(s => s.className === selectedClass && s.section === selectedSection && s.status === 'Active');

  const handleClassChange = (val: string) => {
    setSelectedClass(val);
    setSelectedSection('');
    setRecords({});
  };

  const loadExisting = () => {
    const existing = attendance.find(a => a.date === selectedDate && a.className === selectedClass && a.section === selectedSection);
    if (existing) {
      const map: Record<string, 'Present' | 'Absent' | 'Late'> = {};
      existing.records.forEach(r => { map[r.studentId] = r.status; });
      setRecords(map);
    } else {
      const map: Record<string, 'Present' | 'Absent' | 'Late'> = {};
      students.forEach(s => { map[s.id] = 'Present'; });
      setRecords(map);
    }
  };

  const handleSectionChange = (val: string) => {
    setSelectedSection(val);
    setRecords({});
  };

  const toggleStatus = (studentId: string) => {
    setRecords(prev => {
      const current = prev[studentId] || 'Present';
      const next = current === 'Present' ? 'Absent' : current === 'Absent' ? 'Late' : 'Present';
      return { ...prev, [studentId]: next };
    });
  };

  const markAll = (status: 'Present' | 'Absent') => {
    const map: Record<string, 'Present' | 'Absent' | 'Late'> = {};
    students.forEach(s => { map[s.id] = status; });
    setRecords(map);
  };

  const handleSave = () => {
    if (!selectedClass || !selectedSection || students.length === 0) return;

    const record = {
      id: store.generateId(),
      date: selectedDate,
      className: selectedClass,
      section: selectedSection,
      records: students.map(s => ({
        studentId: s.id,
        studentName: s.name,
        status: records[s.id] || 'Present' as const,
      })),
    };

    const updated = attendance.filter(a => !(a.date === selectedDate && a.className === selectedClass && a.section === selectedSection));
    updated.push(record);
    setAttendance(updated);
    store.setAttendance(updated);
    toast.success(`Attendance saved for ${selectedClass} - ${selectedSection}`);
  };

  const presentCount = Object.values(records).filter(v => v === 'Present').length;
  const absentCount = Object.values(records).filter(v => v === 'Absent').length;
  const lateCount = Object.values(records).filter(v => v === 'Late').length;

  return (
    <div>
      <PageHeader title="Attendance Management" description="Mark daily class-wise attendance" />

      <Card className="mb-6">
        <CardContent className="pt-4">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <Label>Date</Label>
              <Input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
            </div>
            <div className="flex-1">
              <Label>Class</Label>
              <Select value={selectedClass} onValueChange={handleClassChange}>
                <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                <SelectContent>{classes.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label>Section</Label>
              <Select value={selectedSection} onValueChange={handleSectionChange}>
                <SelectTrigger><SelectValue placeholder="Select section" /></SelectTrigger>
                <SelectContent>{sections.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Button onClick={loadExisting} disabled={!selectedClass || !selectedSection}>Load</Button>
          </div>
        </CardContent>
      </Card>

      {selectedClass && selectedSection && Object.keys(records).length > 0 && (
        <>
          <div className="flex gap-3 mb-4 flex-wrap">
            <Badge variant="default" className="gap-1"><CheckCircle2 className="h-3 w-3" /> Present: {presentCount}</Badge>
            <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" /> Absent: {absentCount}</Badge>
            <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" /> Late: {lateCount}</Badge>
            <div className="flex-1" />
            <Button variant="outline" size="sm" onClick={() => markAll('Present')}>Mark All Present</Button>
            <Button variant="outline" size="sm" onClick={() => markAll('Absent')}>Mark All Absent</Button>
          </div>

          <div className="rounded-lg border bg-card mb-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Roll No</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map(s => (
                  <TableRow key={s.id}>
                    <TableCell>{s.rollNo}</TableCell>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleStatus(s.id)}
                        className={`min-w-[80px] ${
                          records[s.id] === 'Present' ? 'text-green-600 hover:text-green-700' :
                          records[s.id] === 'Absent' ? 'text-red-600 hover:text-red-700' :
                          'text-yellow-600 hover:text-yellow-700'
                        }`}
                      >
                        {records[s.id] === 'Present' && <CheckCircle2 className="h-4 w-4 mr-1" />}
                        {records[s.id] === 'Absent' && <XCircle className="h-4 w-4 mr-1" />}
                        {records[s.id] === 'Late' && <Clock className="h-4 w-4 mr-1" />}
                        {records[s.id] || 'Present'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Button onClick={handleSave} className="w-full sm:w-auto">
            <Save className="h-4 w-4 mr-1" /> Save Attendance
          </Button>
        </>
      )}

      {selectedClass && selectedSection && students.length === 0 && (
        <p className="text-center text-muted-foreground py-12">No active students found in {selectedClass} - Section {selectedSection}</p>
      )}
    </div>
  );
};

export default Attendance;
