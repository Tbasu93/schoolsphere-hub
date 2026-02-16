import { useState, useMemo } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Clock } from "lucide-react";
import { store, RoutinePeriod, ClassConfig, Teacher } from "@/lib/store";
import { toast } from "@/hooks/use-toast";

const DAYS: RoutinePeriod["day"][] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function Routine() {
  const [routine, setRoutine] = useState<RoutinePeriod[]>(store.getRoutine());
  const [classes] = useState<ClassConfig[]>(store.getClasses());
  const [teachers] = useState<Teacher[]>(store.getTeachers());
  const [sheetOpen, setSheetOpen] = useState(false);

  // Filters
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");

  // Form state
  const [form, setForm] = useState<Partial<RoutinePeriod>>({ day: "Monday", periodNo: 1 });

  const sectionsForClass = useMemo(() => {
    const cls = classes.find((c) => c.name === (form.className || selectedClass));
    return cls?.sections || [];
  }, [classes, form.className, selectedClass]);

  const filteredSectionsForView = useMemo(() => {
    const cls = classes.find((c) => c.name === selectedClass);
    return cls?.sections || [];
  }, [classes, selectedClass]);

  // Teacher-wise: group routine by teacher
  const teacherRoutine = useMemo(() => {
    const teacher = teachers.find((t) => t.id === selectedTeacher);
    if (!teacher) return [];
    return routine.filter((r) => r.teacherId === selectedTeacher);
  }, [routine, selectedTeacher, teachers]);

  // Build teacher timetable grid
  const teacherGrid = useMemo(() => {
    const grid: Record<string, RoutinePeriod[]> = {};
    DAYS.forEach((d) => {
      grid[d] = teacherRoutine.filter((r) => r.day === d).sort((a, b) => a.periodNo - b.periodNo);
    });
    return grid;
  }, [teacherRoutine]);

  // Teacher summary: which subjects for which class
  const teacherSummary = useMemo(() => {
    const map: Record<string, Set<string>> = {};
    teacherRoutine.forEach((r) => {
      const key = `${r.className} - ${r.section}`;
      if (!map[key]) map[key] = new Set();
      map[key].add(r.subject);
    });
    return Object.entries(map).map(([classSection, subjects]) => ({
      classSection,
      subjects: Array.from(subjects).join(", "),
    }));
  }, [teacherRoutine]);

  // Class-wise: group routine by class+section
  const classRoutine = useMemo(() => {
    if (!selectedClass || !selectedSection) return [];
    return routine.filter((r) => r.className === selectedClass && r.section === selectedSection);
  }, [routine, selectedClass, selectedSection]);

  const classGrid = useMemo(() => {
    const grid: Record<string, RoutinePeriod[]> = {};
    DAYS.forEach((d) => {
      grid[d] = classRoutine.filter((r) => r.day === d).sort((a, b) => a.periodNo - b.periodNo);
    });
    return grid;
  }, [classRoutine]);

  // All periods across routine for determining max period count
  const maxPeriod = useMemo(() => {
    const relevant = selectedTeacher ? teacherRoutine : classRoutine;
    return relevant.length > 0 ? Math.max(...relevant.map((r) => r.periodNo)) : 8;
  }, [teacherRoutine, classRoutine, selectedTeacher]);

  function handleSave() {
    if (!form.day || !form.periodNo || !form.startTime || !form.endTime || !form.className || !form.section || !form.subject || !form.teacherId) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }
    const teacher = teachers.find((t) => t.id === form.teacherId);
    // Check for conflicts
    const conflict = routine.find(
      (r) =>
        r.day === form.day &&
        r.periodNo === form.periodNo &&
        ((r.className === form.className && r.section === form.section) || r.teacherId === form.teacherId)
    );
    if (conflict) {
      toast({
        title: "Schedule conflict",
        description: `Period ${form.periodNo} on ${form.day} already assigned for ${conflict.teacherName} / ${conflict.className}-${conflict.section}`,
        variant: "destructive",
      });
      return;
    }

    const newPeriod: RoutinePeriod = {
      id: store.generateId(),
      day: form.day as RoutinePeriod["day"],
      periodNo: form.periodNo,
      startTime: form.startTime,
      endTime: form.endTime,
      className: form.className,
      section: form.section,
      subject: form.subject,
      teacherId: form.teacherId,
      teacherName: teacher?.name || "",
    };
    const updated = [...routine, newPeriod];
    setRoutine(updated);
    store.setRoutine(updated);
    setSheetOpen(false);
    setForm({ day: "Monday", periodNo: 1 });
    toast({ title: "Period added successfully" });
  }

  function handleDelete(id: string) {
    const updated = routine.filter((r) => r.id !== id);
    setRoutine(updated);
    store.setRoutine(updated);
    toast({ title: "Period removed" });
  }

  const periodNumbers = Array.from({ length: 10 }, (_, i) => i + 1);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Routine / Timetable"
        description="View and manage teacher-wise and class-wise schedules"
        actions={
          <Button onClick={() => setSheetOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Add Period
          </Button>
        }
      />

      <Tabs defaultValue="teacher">
        <TabsList>
          <TabsTrigger value="teacher">Teacher-wise</TabsTrigger>
          <TabsTrigger value="class">Class / Section-wise</TabsTrigger>
        </TabsList>

        {/* ── TEACHER-WISE TAB ── */}
        <TabsContent value="teacher" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-72">
              <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Teacher" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.filter((t) => t.status === "Active").map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.name} — {t.subject}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedTeacher && (
            <>
              {/* At-a-glance summary */}
              {teacherSummary.length > 0 && (
                <Card>
                  <CardHeader className="py-3 px-4">
                    <CardTitle className="text-sm font-medium">Teaching Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-3">
                    <div className="flex flex-wrap gap-2">
                      {teacherSummary.map((s) => (
                        <Badge key={s.classSection} variant="secondary" className="text-xs py-1 px-2">
                          {s.classSection}: {s.subjects}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Timetable grid */}
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-28">Day</TableHead>
                        {Array.from({ length: maxPeriod }, (_, i) => (
                          <TableHead key={i} className="text-center">P{i + 1}</TableHead>
                        ))}
                        <TableHead className="w-10" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {DAYS.map((day) => (
                        <TableRow key={day}>
                          <TableCell className="font-medium">{day}</TableCell>
                          {Array.from({ length: maxPeriod }, (_, i) => {
                            const period = teacherGrid[day]?.find((p) => p.periodNo === i + 1);
                            return (
                              <TableCell key={i} className="text-center text-xs p-1">
                                {period ? (
                                  <div className="bg-accent/50 rounded p-1.5 space-y-0.5">
                                    <div className="font-medium">{period.subject}</div>
                                    <div className="text-muted-foreground">{period.className}-{period.section}</div>
                                    <div className="text-muted-foreground flex items-center justify-center gap-0.5">
                                      <Clock className="h-3 w-3" />{period.startTime}-{period.endTime}
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground/40">—</span>
                                )}
                              </TableCell>
                            );
                          })}
                          <TableCell>
                            {teacherGrid[day]?.map((p) => (
                              <Button key={p.id} variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleDelete(p.id)}>
                                <Trash2 className="h-3 w-3 text-destructive" />
                              </Button>
                            ))}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}

          {!selectedTeacher && (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Select a teacher above to view their routine
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ── CLASS-WISE TAB ── */}
        <TabsContent value="class" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-48">
              <Select value={selectedClass} onValueChange={(v) => { setSelectedClass(v); setSelectedSection(""); }}>
                <SelectTrigger><SelectValue placeholder="Select Class" /></SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedClass && (
              <div className="w-36">
                <Select value={selectedSection} onValueChange={setSelectedSection}>
                  <SelectTrigger><SelectValue placeholder="Section" /></SelectTrigger>
                  <SelectContent>
                    {filteredSectionsForView.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {selectedClass && selectedSection ? (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-28">Day</TableHead>
                      {Array.from({ length: maxPeriod }, (_, i) => (
                        <TableHead key={i} className="text-center">P{i + 1}</TableHead>
                      ))}
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {DAYS.map((day) => (
                      <TableRow key={day}>
                        <TableCell className="font-medium">{day}</TableCell>
                        {Array.from({ length: maxPeriod }, (_, i) => {
                          const period = classGrid[day]?.find((p) => p.periodNo === i + 1);
                          return (
                            <TableCell key={i} className="text-center text-xs p-1">
                              {period ? (
                                <div className="bg-accent/50 rounded p-1.5 space-y-0.5">
                                  <div className="font-medium">{period.subject}</div>
                                  <div className="text-muted-foreground">{period.teacherName}</div>
                                  <div className="text-muted-foreground flex items-center justify-center gap-0.5">
                                    <Clock className="h-3 w-3" />{period.startTime}-{period.endTime}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-muted-foreground/40">—</span>
                              )}
                            </TableCell>
                          );
                        })}
                        <TableCell>
                          {classGrid[day]?.map((p) => (
                            <Button key={p.id} variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleDelete(p.id)}>
                              <Trash2 className="h-3 w-3 text-destructive" />
                            </Button>
                          ))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Select a class and section above to view routine
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* ── ADD PERIOD SHEET ── */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Add Period</SheetTitle>
            <SheetDescription>Assign a subject to a teacher for a specific class, day and period.</SheetDescription>
          </SheetHeader>
          <div className="space-y-4 mt-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Day</Label>
                <Select value={form.day} onValueChange={(v) => setForm({ ...form, day: v as RoutinePeriod["day"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DAYS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Period No.</Label>
                <Select value={String(form.periodNo || 1)} onValueChange={(v) => setForm({ ...form, periodNo: Number(v) })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {periodNumbers.map((n) => <SelectItem key={n} value={String(n)}>Period {n}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input type="time" value={form.startTime || ""} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <Input type="time" value={form.endTime || ""} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Class</Label>
                <Select value={form.className || ""} onValueChange={(v) => setForm({ ...form, className: v, section: "" })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {classes.map((c) => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Section</Label>
                <Select value={form.section || ""} onValueChange={(v) => setForm({ ...form, section: v })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {(classes.find((c) => c.name === form.className)?.sections || []).map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input value={form.subject || ""} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="e.g. Mathematics" />
            </div>
            <div className="space-y-2">
              <Label>Teacher</Label>
              <Select value={form.teacherId || ""} onValueChange={(v) => setForm({ ...form, teacherId: v })}>
                <SelectTrigger><SelectValue placeholder="Select Teacher" /></SelectTrigger>
                <SelectContent>
                  {teachers.filter((t) => t.status === "Active").map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.name} — {t.subject}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSave} className="w-full">Add Period</Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
