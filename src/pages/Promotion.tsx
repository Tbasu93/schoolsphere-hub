import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { store } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowRight, CheckCircle2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const Promotion = () => {
  const classes = store.getClasses();
  const [students, setStudents] = useState(store.getStudents());
  const examResults = store.getExamResults();
  const [fromClass, setFromClass] = useState('');
  const [toClass, setToClass] = useState('');
  const [promoted, setPromoted] = useState(false);
  const [failedStudents, setFailedStudents] = useState<Set<string>>(new Set());

  const eligibleStudents = students.filter(s => s.className === fromClass && s.status === 'Active');

  const getNextClass = (current: string) => {
    const idx = classes.findIndex(c => c.name === current);
    if (idx >= 0 && idx < classes.length - 1) return classes[idx + 1].name;
    return '';
  };

  const handleFromChange = (val: string) => {
    setFromClass(val);
    setToClass(getNextClass(val));
    setPromoted(false);

    // Auto-detect failed students from exam results
    const classStudents = students.filter(s => s.className === val && s.status === 'Active');
    const failed = new Set<string>();
    classStudents.forEach(s => {
      const studentResults = examResults.filter(r => r.studentId === s.id);
      const hasFailed = studentResults.some(r => r.status === 'Fail');
      if (hasFailed) failed.add(s.id);
    });
    setFailedStudents(failed);
  };

  const toggleFailed = (studentId: string) => {
    setFailedStudents(prev => {
      const next = new Set(prev);
      if (next.has(studentId)) next.delete(studentId);
      else next.add(studentId);
      return next;
    });
  };

  const handlePromote = () => {
    if (!fromClass || !toClass) { toast.error('Select both classes'); return; }
    if (fromClass === toClass) { toast.error('Source and destination class must be different'); return; }

    const toPromote = eligibleStudents.filter(s => !failedStudents.has(s.id));
    if (toPromote.length === 0) { toast.error('No students selected for promotion'); return; }

    const updatedStudents = students.map(s => {
      if (s.className === fromClass && s.status === 'Active' && !failedStudents.has(s.id)) {
        const targetSections = classes.find(c => c.name === toClass)?.sections || ['A'];
        return { ...s, className: toClass, section: targetSections[0] };
      }
      return s;
    });

    setStudents(updatedStudents);
    store.setStudents(updatedStudents);
    setPromoted(true);
    const failedCount = failedStudents.size;
    toast.success(`${toPromote.length} students promoted. ${failedCount > 0 ? `${failedCount} retained in ${fromClass}.` : ''}`);
  };

  const promoteCount = eligibleStudents.filter(s => !failedStudents.has(s.id)).length;
  const retainCount = eligibleStudents.filter(s => failedStudents.has(s.id)).length;

  return (
    <div>
      <PageHeader title="Student Promotion" description="Promote students with pass/fail selection" />

      <Card className="max-w-3xl">
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

          {fromClass && eligibleStudents.length > 0 && (
            <>
              <div className="flex gap-3 flex-wrap">
                <Badge variant="default">{promoteCount} to promote</Badge>
                {retainCount > 0 && <Badge variant="destructive">{retainCount} retained (failed)</Badge>}
                <Badge variant="secondary">{eligibleStudents.length} total</Badge>
              </div>

              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Failed</TableHead>
                      <TableHead>Roll No</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Section</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {eligibleStudents.map(s => {
                      const isFailed = failedStudents.has(s.id);
                      return (
                        <TableRow key={s.id} className={isFailed ? 'bg-destructive/5' : ''}>
                          <TableCell>
                            <Checkbox
                              checked={isFailed}
                              onCheckedChange={() => toggleFailed(s.id)}
                            />
                          </TableCell>
                          <TableCell>{s.rollNo}</TableCell>
                          <TableCell className="font-medium">{s.name}</TableCell>
                          <TableCell>{s.section}</TableCell>
                          <TableCell>
                            <Badge variant={isFailed ? 'destructive' : 'default'} className="text-[10px]">
                              {isFailed ? 'Retained' : 'Promote'}
                            </Badge>
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
                    {retainCount > 0 && <> <strong>{retainCount}</strong> student(s) marked as failed will remain in <strong>{fromClass}</strong>.</>}
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
    </div>
  );
};

export default Promotion;
