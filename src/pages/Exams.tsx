import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { store, Exam, ExamResult, calculateGrade } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Pencil, Trash2, ClipboardList, FileText, X } from "lucide-react";
import { toast } from "sonner";

const Exams = () => {
  const classes = store.getClasses();
  const allStudents = store.getStudents();
  const [exams, setExams] = useState(store.getExams());
  const [results, setResults] = useState(store.getExamResults());

  // Exam form
  const [examSheetOpen, setExamSheetOpen] = useState(false);
  const [editExamId, setEditExamId] = useState<string | null>(null);
  const [examForm, setExamForm] = useState({ name: '', className: '', date: '', maxMarks: 100, passMarks: 35, subjects: [''] as string[] });

  // Marks entry
  const [marksSheetOpen, setMarksSheetOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [marksMap, setMarksMap] = useState<Record<string, Record<string, number>>>({});

  // Report card
  const [reportSheetOpen, setReportSheetOpen] = useState(false);
  const [reportStudent, setReportStudent] = useState<string>('');

  const saveExams = (list: Exam[]) => { setExams(list); store.setExams(list); };
  const saveResults = (list: ExamResult[]) => { setResults(list); store.setExamResults(list); };

  // Exam CRUD
  const openNewExam = () => {
    setExamForm({ name: '', className: '', date: '', maxMarks: 100, passMarks: 35, subjects: [''] });
    setEditExamId(null);
    setExamSheetOpen(true);
  };

  const openEditExam = (e: Exam) => {
    setExamForm({ name: e.name, className: e.className, date: e.date, maxMarks: e.maxMarks, passMarks: e.passMarks, subjects: e.subjects });
    setEditExamId(e.id);
    setExamSheetOpen(true);
  };

  const handleSaveExam = () => {
    const subjects = examForm.subjects.filter(s => s.trim());
    if (!examForm.name || !examForm.className || subjects.length === 0) {
      toast.error('Name, class, and at least one subject required');
      return;
    }
    const exam = { ...examForm, subjects, id: editExamId || store.generateId() };
    if (editExamId) {
      saveExams(exams.map(e => e.id === editExamId ? exam : e));
      toast.success('Exam updated');
    } else {
      saveExams([...exams, exam]);
      toast.success('Exam created');
    }
    setExamSheetOpen(false);
  };

  const deleteExam = (id: string) => {
    saveExams(exams.filter(e => e.id !== id));
    saveResults(results.filter(r => r.examId !== id));
    toast.success('Exam deleted');
  };

  // Marks entry
  const openMarksEntry = (exam: Exam) => {
    setSelectedExam(exam);
    const students = allStudents.filter(s => s.className === exam.className && s.status === 'Active');
    const existingResults = results.filter(r => r.examId === exam.id);

    const map: Record<string, Record<string, number>> = {};
    students.forEach(s => {
      const existing = existingResults.find(r => r.studentId === s.id);
      map[s.id] = {};
      exam.subjects.forEach(sub => {
        const mark = existing?.marks.find(m => m.subject === sub);
        map[s.id][sub] = mark?.obtained ?? 0;
      });
    });
    setMarksMap(map);
    setMarksSheetOpen(true);
  };

  const handleSaveMarks = () => {
    if (!selectedExam) return;
    const students = allStudents.filter(s => s.className === selectedExam.className && s.status === 'Active');

    const newResults: ExamResult[] = students.map(s => {
      const marks = selectedExam.subjects.map(sub => ({
        subject: sub,
        obtained: marksMap[s.id]?.[sub] || 0,
        max: selectedExam.maxMarks,
      }));
      const totalObtained = marks.reduce((sum, m) => sum + m.obtained, 0);
      const totalMax = marks.reduce((sum, m) => sum + m.max, 0);
      const percentage = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100 * 100) / 100 : 0;
      const grade = calculateGrade(percentage);
      const failedAny = marks.some(m => m.obtained < selectedExam.passMarks);

      return {
        id: store.generateId(),
        examId: selectedExam.id,
        studentId: s.id,
        studentName: s.name,
        className: selectedExam.className,
        marks,
        totalObtained,
        totalMax,
        percentage,
        grade,
        status: failedAny ? 'Fail' as const : 'Pass' as const,
      };
    });

    const otherResults = results.filter(r => r.examId !== selectedExam.id);
    saveResults([...otherResults, ...newResults]);
    toast.success('Marks saved successfully');
    setMarksSheetOpen(false);
  };

  // Report card
  const studentResults = results.filter(r => r.studentId === reportStudent);
  const reportStudentInfo = allStudents.find(s => s.id === reportStudent);

  const addSubject = () => setExamForm(prev => ({ ...prev, subjects: [...prev.subjects, ''] }));
  const updateSubject = (idx: number, val: string) => {
    const subs = [...examForm.subjects];
    subs[idx] = val;
    setExamForm(prev => ({ ...prev, subjects: subs }));
  };
  const removeSubject = (idx: number) => setExamForm(prev => ({ ...prev, subjects: prev.subjects.filter((_, i) => i !== idx) }));

  return (
    <div>
      <PageHeader title="Examinations & Results" description="Manage exams, enter marks, and generate report cards" />

      <Tabs defaultValue="exams">
        <TabsList className="mb-4">
          <TabsTrigger value="exams">Exams</TabsTrigger>
          <TabsTrigger value="report">Report Card</TabsTrigger>
        </TabsList>

        <TabsContent value="exams">
          <div className="flex justify-end mb-4">
            <Button onClick={openNewExam} size="sm"><Plus className="h-4 w-4 mr-1" /> Create Exam</Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {exams.map(e => (
              <Card key={e.id} className="group">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-base font-heading">{e.name}</CardTitle>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openMarksEntry(e)}><ClipboardList className="h-3 w-3" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditExam(e)}><Pencil className="h-3 w-3" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteExam(e.id)}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>Class: <span className="text-foreground font-medium">{e.className}</span></p>
                    <p>Date: {new Date(e.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    <p>Max Marks: {e.maxMarks} per subject | Pass: {e.passMarks}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {e.subjects.map(s => <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>)}
                    </div>
                    {results.filter(r => r.examId === e.id).length > 0 && (
                      <Badge variant="default" className="mt-2 text-[10px]">Results entered</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {exams.length === 0 && <p className="text-muted-foreground col-span-full text-center py-12">No exams created yet</p>}
          </div>
        </TabsContent>

        <TabsContent value="report">
          <Card className="max-w-3xl">
            <CardHeader>
              <CardTitle className="text-base font-heading flex items-center gap-2">
                <FileText className="h-4 w-4" /> Student Report Card
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Label>Select Student</Label>
                <Select value={reportStudent} onValueChange={setReportStudent}>
                  <SelectTrigger><SelectValue placeholder="Choose a student" /></SelectTrigger>
                  <SelectContent>
                    {allStudents.filter(s => s.status === 'Active').map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name} ({s.className} - {s.section})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {reportStudent && reportStudentInfo && (
                <div className="space-y-6">
                  <div className="p-4 rounded-lg bg-muted/50 space-y-1 text-sm">
                    <p className="font-heading font-bold text-lg">{reportStudentInfo.name}</p>
                    <p>Roll No: {reportStudentInfo.rollNo} | Class: {reportStudentInfo.className} - {reportStudentInfo.section}</p>
                    <p>Guardian: {reportStudentInfo.guardianName}</p>
                  </div>

                  {studentResults.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No exam results available</p>
                  ) : (
                    studentResults.map(result => {
                      const exam = exams.find(e => e.id === result.examId);
                      return (
                        <div key={result.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-heading font-semibold">{exam?.name || 'Exam'}</h4>
                            <Badge variant={result.status === 'Pass' ? 'default' : 'destructive'}>{result.status}</Badge>
                          </div>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Subject</TableHead>
                                <TableHead className="text-center">Max</TableHead>
                                <TableHead className="text-center">Obtained</TableHead>
                                <TableHead className="text-center">Grade</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {result.marks.map(m => (
                                <TableRow key={m.subject}>
                                  <TableCell>{m.subject}</TableCell>
                                  <TableCell className="text-center">{m.max}</TableCell>
                                  <TableCell className={`text-center font-medium ${m.obtained < (exam?.passMarks || 35) ? 'text-destructive' : ''}`}>{m.obtained}</TableCell>
                                  <TableCell className="text-center">{calculateGrade((m.obtained / m.max) * 100)}</TableCell>
                                </TableRow>
                              ))}
                              <TableRow className="font-bold">
                                <TableCell>Total</TableCell>
                                <TableCell className="text-center">{result.totalMax}</TableCell>
                                <TableCell className="text-center">{result.totalObtained}</TableCell>
                                <TableCell className="text-center">{result.grade}</TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                          <div className="mt-2 text-sm text-muted-foreground">
                            Percentage: <strong>{result.percentage}%</strong> | Overall Grade: <strong>{result.grade}</strong>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Exam Sheet */}
      <Sheet open={examSheetOpen} onOpenChange={setExamSheetOpen}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader><SheetTitle>{editExamId ? 'Edit Exam' : 'Create Exam'}</SheetTitle></SheetHeader>
          <div className="space-y-4 mt-6">
            <div><Label>Exam Name *</Label><Input value={examForm.name} onChange={e => setExamForm(prev => ({ ...prev, name: e.target.value }))} placeholder="e.g. Mid-Term 2025" /></div>
            <div>
              <Label>Class *</Label>
              <Select value={examForm.className} onValueChange={v => setExamForm(prev => ({ ...prev, className: v }))}>
                <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                <SelectContent>{classes.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Date</Label><Input type="date" value={examForm.date} onChange={e => setExamForm(prev => ({ ...prev, date: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Max Marks (per subject)</Label><Input type="number" value={examForm.maxMarks} onChange={e => setExamForm(prev => ({ ...prev, maxMarks: Number(e.target.value) }))} /></div>
              <div><Label>Pass Marks</Label><Input type="number" value={examForm.passMarks} onChange={e => setExamForm(prev => ({ ...prev, passMarks: Number(e.target.value) }))} /></div>
            </div>
            <div>
              <Label>Subjects</Label>
              {examForm.subjects.map((s, i) => (
                <div key={i} className="flex gap-2 mt-1">
                  <Input value={s} onChange={e => updateSubject(i, e.target.value)} placeholder={`Subject ${i + 1}`} />
                  {examForm.subjects.length > 1 && <Button variant="ghost" size="icon" onClick={() => removeSubject(i)}><X className="h-4 w-4" /></Button>}
                </div>
              ))}
              <Button variant="outline" size="sm" className="mt-2" onClick={addSubject}><Plus className="h-3 w-3 mr-1" /> Add Subject</Button>
            </div>
          </div>
          <SheetFooter className="mt-6"><Button onClick={handleSaveExam} className="w-full">{editExamId ? 'Update' : 'Create'} Exam</Button></SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Marks Entry Sheet */}
      <Sheet open={marksSheetOpen} onOpenChange={setMarksSheetOpen}>
        <SheetContent className="overflow-y-auto sm:max-w-xl">
          <SheetHeader><SheetTitle>Enter Marks - {selectedExam?.name}</SheetTitle></SheetHeader>
          {selectedExam && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-4">{selectedExam.className} | Max: {selectedExam.maxMarks} per subject</p>
              <div className="space-y-4">
                {allStudents.filter(s => s.className === selectedExam.className && s.status === 'Active').map(student => (
                  <div key={student.id} className="border rounded-lg p-3">
                    <p className="font-medium text-sm mb-2">{student.name} ({student.rollNo})</p>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedExam.subjects.map(sub => (
                        <div key={sub}>
                          <Label className="text-xs">{sub}</Label>
                          <Input
                            type="number"
                            min={0}
                            max={selectedExam.maxMarks}
                            value={marksMap[student.id]?.[sub] ?? 0}
                            onChange={e => {
                              const val = Math.min(Number(e.target.value), selectedExam.maxMarks);
                              setMarksMap(prev => ({
                                ...prev,
                                [student.id]: { ...prev[student.id], [sub]: val }
                              }));
                            }}
                            className="h-8"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <SheetFooter className="mt-6"><Button onClick={handleSaveMarks} className="w-full">Save All Marks</Button></SheetFooter>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Exams;
