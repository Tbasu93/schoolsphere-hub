import { useState, useMemo } from "react";
import { PageHeader } from "@/components/PageHeader";
import { store, PromotionPolicy } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowRight, CheckCircle2, AlertTriangle, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

interface EligibilityInfo {
  eligible: boolean;
  reasons: string[];
  percentage: number | null;
  passedCount: number;
  totalSubjects: number;
}

const passCriteriaLabel = (p: PromotionPolicy) => {
  if (p.passCriteria === 'all') return 'All Subjects';
  return `Compulsory + ${p.passCriteria.split('+')[1]}`;
};

const Promotion = () => {
  const classes = store.getClasses();
  const [students, setStudents] = useState(store.getStudents());
  const examResults = store.getExamResults();
  const policy = store.getPromotionPolicy();
  const [fromClass, setFromClass] = useState('');
  const [toClass, setToClass] = useState('');
  const [promoted, setPromoted] = useState(false);
  const [forcePromoteStudent, setForcePromoteStudent] = useState<string | null>(null);
  const [forcePromoted, setForcePromoted] = useState<Set<string>>(new Set());

  const eligibleStudents = students.filter(s => s.className === fromClass && s.status === 'Active');

  const getNextClass = (current: string) => {
    const idx = classes.findIndex(c => c.name === current);
    if (idx >= 0 && idx < classes.length - 1) return classes[idx + 1].name;
    return '';
  };

  const eligibilityMap = useMemo(() => {
    const map = new Map<string, EligibilityInfo>();
    const classConfig = classes.find(c => c.name === fromClass);
    const classSubjects = classConfig?.subjects || [];

    eligibleStudents.forEach(s => {
      const reasons: string[] = [];
      let eligible = true;

      // Get relevant exam results based on examScope
      const studentResults = examResults.filter(r => r.studentId === s.id && r.className === fromClass);

      if (studentResults.length === 0) {
        map.set(s.id, { eligible: true, reasons: ['No exam data'], percentage: null, passedCount: 0, totalSubjects: 0 });
        return;
      }

      // Build subject-wise marks: combine all exams or use latest (annual)
      let subjectMarks: Map<string, { obtained: number; max: number }>;

      if (policy.examScope === 'all') {
        // Combine marks from ALL exams
        subjectMarks = new Map();
        studentResults.forEach(r => {
          r.marks.forEach(m => {
            const existing = subjectMarks.get(m.subject);
            if (existing) {
              subjectMarks.set(m.subject, { obtained: existing.obtained + m.obtained, max: existing.max + m.max });
            } else {
              subjectMarks.set(m.subject, { obtained: m.obtained, max: m.max });
            }
          });
        });
      } else {
        // Only latest (annual) exam
        const latest = studentResults[studentResults.length - 1];
        subjectMarks = new Map(latest.marks.map(m => [m.subject, { obtained: m.obtained, max: m.max }]));
      }

      // Calculate overall percentage
      let totalObtained = 0, totalMax = 0;
      subjectMarks.forEach(v => { totalObtained += v.obtained; totalMax += v.max; });
      const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;

      // Determine which subjects are compulsory for THIS student
      const compulsorySubjectNames: string[] = [];
      const nonCompulsorySubjectNames: string[] = [];

      // For each subject the student has marks in, classify it
      subjectMarks.forEach((_, subjectName) => {
        const subjectConfig = classSubjects.find(cs => cs.name === subjectName);
        const category = subjectConfig?.category || 'Core';
        if (policy.compulsoryCategories.includes(category)) {
          compulsorySubjectNames.push(subjectName);
        } else {
          nonCompulsorySubjectNames.push(subjectName);
        }
      });

      // Check pass status per subject
      const passThreshold = policy.passMarksPercent / 100;
      const passedCompulsory: string[] = [];
      const failedCompulsory: string[] = [];
      const passedNonCompulsory: string[] = [];

      compulsorySubjectNames.forEach(name => {
        const m = subjectMarks.get(name)!;
        if ((m.obtained / m.max) >= passThreshold) {
          passedCompulsory.push(name);
        } else {
          failedCompulsory.push(name);
        }
      });

      nonCompulsorySubjectNames.forEach(name => {
        const m = subjectMarks.get(name)!;
        if ((m.obtained / m.max) >= passThreshold) {
          passedNonCompulsory.push(name);
        }
      });

      // Check compulsory subjects pass
      if (failedCompulsory.length > 0) {
        eligible = false;
        reasons.push(`Failed compulsory: ${failedCompulsory.join(', ')}`);
      }

      // Check pass criteria
      if (policy.passCriteria === 'all') {
        // Must pass ALL subjects
        const totalPassed = passedCompulsory.length + passedNonCompulsory.length;
        const totalSubjects = subjectMarks.size;
        if (totalPassed < totalSubjects) {
          eligible = false;
          if (failedCompulsory.length === 0) {
            const failedNonComp = nonCompulsorySubjectNames.filter(n => !passedNonCompulsory.includes(n));
            reasons.push(`Failed: ${failedNonComp.join(', ')}`);
          }
        }
      } else {
        // Compulsory + N: must pass all compulsory + N additional
        const requiredAdditional = parseInt(policy.passCriteria.split('+')[1]);
        if (passedNonCompulsory.length < requiredAdditional) {
          eligible = false;
          reasons.push(`Passed ${passedNonCompulsory.length}/${requiredAdditional} required additional subjects`);
        }
      }

      const totalPassed = passedCompulsory.length + passedNonCompulsory.length;
      map.set(s.id, { eligible, reasons, percentage, passedCount: totalPassed, totalSubjects: subjectMarks.size });
    });
    return map;
  }, [eligibleStudents, examResults, policy, fromClass, classes]);

  const handleFromChange = (val: string) => {
    setFromClass(val);
    setToClass(getNextClass(val));
    setPromoted(false);
    setForcePromoted(new Set());
  };

  const handleForcePromoteConfirm = () => {
    if (forcePromoteStudent) {
      setForcePromoted(prev => new Set(prev).add(forcePromoteStudent));
      const student = eligibleStudents.find(s => s.id === forcePromoteStudent);
      toast.success(`${student?.name} will be promoted on consideration`);
    }
    setForcePromoteStudent(null);
  };

  const handleUndoForce = (studentId: string) => {
    setForcePromoted(prev => { const next = new Set(prev); next.delete(studentId); return next; });
  };

  const getEffectiveStatus = (studentId: string) => {
    const info = eligibilityMap.get(studentId);
    if (!info) return 'eligible';
    if (info.eligible) return 'eligible';
    if (forcePromoted.has(studentId)) return 'force-promoted';
    return 'not-eligible';
  };

  const studentsToPromote = eligibleStudents.filter(s => {
    const status = getEffectiveStatus(s.id);
    return status === 'eligible' || status === 'force-promoted';
  });

  const handlePromote = () => {
    if (!fromClass || !toClass) { toast.error('Select both classes'); return; }
    if (fromClass === toClass) { toast.error('Source and destination must differ'); return; }
    if (studentsToPromote.length === 0) { toast.error('No students to promote'); return; }

    const promoteIds = new Set(studentsToPromote.map(s => s.id));
    const updatedStudents = students.map(s => {
      if (promoteIds.has(s.id)) {
        const targetSections = classes.find(c => c.name === toClass)?.sections || ['A'];
        return { ...s, className: toClass, section: targetSections[0] };
      }
      return s;
    });

    setStudents(updatedStudents);
    store.setStudents(updatedStudents);
    setPromoted(true);
    const retainCount = eligibleStudents.length - studentsToPromote.length;
    const forceCount = forcePromoted.size;
    toast.success(
      `${studentsToPromote.length} students promoted${forceCount > 0 ? ` (${forceCount} on consideration)` : ''}. ${retainCount > 0 ? `${retainCount} retained.` : ''}`
    );
  };

  const promoteCount = studentsToPromote.length;
  const retainCount = eligibleStudents.length - promoteCount;
  const forcePromoteStudentData = eligibleStudents.find(s => s.id === forcePromoteStudent);
  const forcePromoteInfo = forcePromoteStudent ? eligibilityMap.get(forcePromoteStudent) : null;

  return (
    <div>
      <PageHeader title="Student Promotion" description="Auto-eligibility based on promotion policy. Force-promote with confirmation." />

      <Card className="max-w-5xl">
        <CardHeader>
          <CardTitle className="text-base font-heading">Class Promotion</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <Label>From Class</Label>
              <Select value={fromClass} onValueChange={handleFromChange}>
                <SelectTrigger><SelectValue placeholder="Select source class" /></SelectTrigger>
                <SelectContent>{classes.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground mb-2" />
            <div className="flex-1">
              <Label>To Class</Label>
              <Select value={toClass} onValueChange={v => { setToClass(v); setPromoted(false); }}>
                <SelectTrigger><SelectValue placeholder="Select target class" /></SelectTrigger>
                <SelectContent>{classes.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          {/* Policy summary */}
          <div className="flex gap-2 flex-wrap text-xs">
            <Badge variant="outline">Pass: {policy.passMarksPercent}%</Badge>
            <Badge variant="outline">Criteria: {passCriteriaLabel(policy)}</Badge>
            <Badge variant="outline">Compulsory: {policy.compulsoryCategories.join(', ')}</Badge>
            <Badge variant="outline">Exam: {policy.examScope === 'annual' ? 'Annual Only' : 'All Exams'}</Badge>
          </div>

          {fromClass && eligibleStudents.length > 0 && (
            <>
              <div className="flex gap-3 flex-wrap">
                <Badge variant="default">{promoteCount} to promote</Badge>
                {retainCount > 0 && <Badge variant="destructive">{retainCount} not eligible</Badge>}
                <Badge variant="secondary">{eligibleStudents.length} total</Badge>
              </div>

              <div className="rounded-lg border overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Roll No</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Section</TableHead>
                      <TableHead>%</TableHead>
                      <TableHead>Subjects Passed</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-24">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {eligibleStudents.map(s => {
                      const info = eligibilityMap.get(s.id);
                      const status = getEffectiveStatus(s.id);
                      return (
                        <TableRow key={s.id} className={status === 'not-eligible' ? 'bg-destructive/5' : status === 'force-promoted' ? 'bg-accent/10' : ''}>
                          <TableCell>{s.rollNo}</TableCell>
                          <TableCell className="font-medium">{s.name}</TableCell>
                          <TableCell>{s.section}</TableCell>
                          <TableCell>{info?.percentage != null ? `${info.percentage.toFixed(1)}%` : '—'}</TableCell>
                          <TableCell>{info?.totalSubjects ? `${info.passedCount}/${info.totalSubjects}` : '—'}</TableCell>
                          <TableCell>
                            <Badge
                              variant={status === 'eligible' ? 'default' : status === 'force-promoted' ? 'secondary' : 'destructive'}
                              className="text-[10px]"
                            >
                              {status === 'eligible' ? 'Eligible' : status === 'force-promoted' ? 'On Consideration' : 'Not Eligible'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {status === 'not-eligible' && (
                              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setForcePromoteStudent(s.id)}>
                                Promote
                              </Button>
                            )}
                            {status === 'force-promoted' && (
                              <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive" onClick={() => handleUndoForce(s.id)}>
                                Undo
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </>
          )}

          {fromClass && eligibleStudents.length === 0 && (
            <p className="text-center text-muted-foreground py-4">No active students in {fromClass}</p>
          )}

          {promoted ? (
            <div className="flex items-center gap-2 text-success">
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-sm font-medium">Promotion completed successfully!</span>
            </div>
          ) : (
            <div className="space-y-3">
              {fromClass && toClass && promoteCount > 0 && (
                <div className="flex items-start gap-2 p-3 rounded-lg border border-accent/30 bg-accent/5">
                  <AlertTriangle className="h-4 w-4 text-accent mt-0.5" />
                  <p className="text-xs text-muted-foreground">
                    This will promote <strong>{promoteCount}</strong> students from <strong>{fromClass}</strong> to <strong>{toClass}</strong>.
                    {retainCount > 0 && <> <strong>{retainCount}</strong> student(s) will remain in <strong>{fromClass}</strong>.</>}
                  </p>
                </div>
              )}
              <Button onClick={handlePromote} disabled={!fromClass || !toClass || promoteCount === 0} className="w-full">
                Promote {promoteCount} Student{promoteCount !== 1 ? 's' : ''}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Force Promote Confirmation Dialog */}
      <Dialog open={!!forcePromoteStudent} onOpenChange={open => { if (!open) setForcePromoteStudent(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-destructive" />
              Force Promote Student
            </DialogTitle>
            <DialogDescription>
              This student is <strong>not eligible</strong> for promotion based on the current policy.
            </DialogDescription>
          </DialogHeader>
          {forcePromoteStudentData && forcePromoteInfo && (
            <div className="space-y-3">
              <div className="rounded-lg border p-3 space-y-2">
                <p className="text-sm font-medium">{forcePromoteStudentData.name} ({forcePromoteStudentData.rollNo})</p>
                <div className="space-y-1">
                  {forcePromoteInfo.reasons.map((r, i) => (
                    <p key={i} className="text-xs text-destructive flex items-center gap-1.5">
                      <AlertTriangle className="h-3 w-3" /> {r}
                    </p>
                  ))}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Are you sure you want to promote this student <strong>on consideration</strong>? This action will override the promotion policy.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setForcePromoteStudent(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleForcePromoteConfirm}>Yes, Promote on Consideration</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Promotion;
