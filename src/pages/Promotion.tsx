import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { store } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const Promotion = () => {
  const classes = store.getClasses();
  const [students, setStudents] = useState(store.getStudents());
  const [fromClass, setFromClass] = useState('');
  const [toClass, setToClass] = useState('');
  const [promoted, setPromoted] = useState(false);

  const eligibleStudents = students.filter(s => s.className === fromClass && s.status === 'Active');

  // Auto-suggest next class
  const getNextClass = (current: string) => {
    const idx = classes.findIndex(c => c.name === current);
    if (idx >= 0 && idx < classes.length - 1) return classes[idx + 1].name;
    return '';
  };

  const handleFromChange = (val: string) => {
    setFromClass(val);
    setToClass(getNextClass(val));
    setPromoted(false);
  };

  const handlePromote = () => {
    if (!fromClass || !toClass) { toast.error('Select both classes'); return; }
    if (fromClass === toClass) { toast.error('Source and destination class must be different'); return; }
    if (eligibleStudents.length === 0) { toast.error('No students to promote'); return; }

    const updatedStudents = students.map(s => {
      if (s.className === fromClass && s.status === 'Active') {
        const targetSections = classes.find(c => c.name === toClass)?.sections || ['A'];
        return { ...s, className: toClass, section: targetSections[0] };
      }
      return s;
    });

    setStudents(updatedStudents);
    store.setStudents(updatedStudents);
    setPromoted(true);
    toast.success(`${eligibleStudents.length} students promoted from ${fromClass} to ${toClass}`);
  };

  return (
    <div>
      <PageHeader title="One-Click Promotion" description="Promote all students from one class to the next" />

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle className="text-base font-heading">Student Promotion</CardTitle>
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

          {fromClass && (
            <div className="rounded-lg bg-muted/50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium">{eligibleStudents.length} active student{eligibleStudents.length !== 1 ? 's' : ''} in {fromClass}</span>
              </div>
              {eligibleStudents.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {eligibleStudents.slice(0, 10).map(s => (
                    <Badge key={s.id} variant="secondary" className="text-xs">{s.name}</Badge>
                  ))}
                  {eligibleStudents.length > 10 && <Badge variant="outline" className="text-xs">+{eligibleStudents.length - 10} more</Badge>}
                </div>
              )}
            </div>
          )}

          {promoted ? (
            <div className="flex items-center gap-2 text-success">
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-sm font-medium">Promotion completed successfully!</span>
            </div>
          ) : (
            <div className="space-y-3">
              {fromClass && toClass && eligibleStudents.length > 0 && (
                <div className="flex items-start gap-2 p-3 rounded-lg border border-accent/30 bg-accent/5">
                  <AlertTriangle className="h-4 w-4 text-accent mt-0.5" />
                  <p className="text-xs text-muted-foreground">
                    This will promote all {eligibleStudents.length} active students from <strong>{fromClass}</strong> to <strong>{toClass}</strong>. Students will be placed in the first available section.
                  </p>
                </div>
              )}
              <Button onClick={handlePromote} disabled={!fromClass || !toClass || eligibleStudents.length === 0} className="w-full">
                Promote {eligibleStudents.length} Student{eligibleStudents.length !== 1 ? 's' : ''}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Promotion;
