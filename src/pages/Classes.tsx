import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { store, ClassConfig, SubjectEntry } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, X, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

const categoryColors: Record<string, string> = {
  'Core': 'bg-primary/10 text-primary border-primary/20',
  '2nd Language': 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
  '3rd Language': 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
  'Additional': 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
};

const Classes = () => {
  const [classes, setClasses] = useState(store.getClasses());
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [sections, setSections] = useState<string[]>(['A']);
  const [newSection, setNewSection] = useState('');
  const [subjects, setSubjects] = useState<SubjectEntry[]>([]);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectCategory, setNewSubjectCategory] = useState<SubjectEntry['category']>('Core');

  const save = (list: ClassConfig[]) => { setClasses(list); store.setClasses(list); };

  const openNew = () => {
    setName(''); setSections(['A']); setEditId(null);
    setSubjects([]); setNewSubjectName(''); setNewSubjectCategory('Core');
    setSheetOpen(true);
  };

  const openEdit = (c: ClassConfig) => {
    setName(c.name); setSections(c.sections); setEditId(c.id);
    setSubjects(c.subjects || []); setNewSubjectName(''); setNewSubjectCategory('Core');
    setSheetOpen(true);
  };

  const addSection = () => {
    const s = newSection.trim().toUpperCase();
    if (s && !sections.includes(s)) { setSections([...sections, s]); setNewSection(''); }
  };

  const addSubject = () => {
    const n = newSubjectName.trim();
    if (!n) return;
    if (subjects.some(s => s.name.toLowerCase() === n.toLowerCase() && s.category === newSubjectCategory)) {
      toast.error('Subject already exists in this category');
      return;
    }
    setSubjects([...subjects, { name: n, category: newSubjectCategory }]);
    setNewSubjectName('');
  };

  const removeSubject = (idx: number) => {
    setSubjects(subjects.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    if (!name) { toast.error('Class name is required'); return; }
    if (editId) {
      save(classes.map(c => c.id === editId ? { ...c, name, sections, subjects } : c));
      toast.success('Class updated');
    } else {
      save([...classes, { id: store.generateId(), name, sections, subjects }]);
      toast.success('Class added');
    }
    setSheetOpen(false);
  };

  const handleDelete = (id: string) => { save(classes.filter(c => c.id !== id)); toast.success('Class removed'); };

  const groupedSubjects = (subs: SubjectEntry[]) => {
    const groups: Record<string, string[]> = {};
    subs.forEach(s => {
      if (!groups[s.category]) groups[s.category] = [];
      groups[s.category].push(s.name);
    });
    return groups;
  };

  return (
    <div>
      <PageHeader title="Classes & Sections" description="Configure class structure and subjects" actions={<Button onClick={openNew} size="sm"><Plus className="h-4 w-4 mr-1" /> Add Class</Button>} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.map(c => {
          const grouped = groupedSubjects(c.subjects || []);
          return (
            <Card key={c.id} className="group">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-base font-heading">{c.name}</CardTitle>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(c)}><Pencil className="h-3 w-3" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(c.id)}><Trash2 className="h-3 w-3" /></Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-1.5">
                  {c.sections.map(s => (
                    <Badge key={s} variant="secondary" className="text-xs">Section {s}</Badge>
                  ))}
                </div>
                {Object.keys(grouped).length > 0 && (
                  <div className="space-y-1.5">
                    {Object.entries(grouped).map(([cat, names]) => (
                      <div key={cat} className="flex flex-wrap items-center gap-1">
                        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider w-full">{cat}</span>
                        {names.map(n => (
                          <Badge key={n} variant="outline" className={`text-[11px] border ${categoryColors[cat] || ''}`}>{n}</Badge>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader><SheetTitle>{editId ? 'Edit Class' : 'Add Class'}</SheetTitle></SheetHeader>
          <ScrollArea className="h-[calc(100vh-10rem)] pr-3">
            <div className="space-y-5 mt-6">
              <div>
                <Label>Class Name *</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Class 1" />
              </div>

              <div>
                <Label>Sections</Label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {sections.map(s => (
                    <Badge key={s} variant="secondary" className="gap-1">
                      {s}
                      <button onClick={() => setSections(sections.filter(x => x !== s))} className="ml-1 hover:text-destructive"><X className="h-3 w-3" /></button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input value={newSection} onChange={e => setNewSection(e.target.value)} placeholder="Add section" className="flex-1" onKeyDown={e => e.key === 'Enter' && addSection()} />
                  <Button variant="outline" size="sm" onClick={addSection}>Add</Button>
                </div>
              </div>

              <div>
                <Label className="flex items-center gap-1.5 mb-2"><BookOpen className="h-3.5 w-3.5" /> Subjects</Label>
                {subjects.length > 0 && (
                  <div className="space-y-1.5 mb-3">
                    {subjects.map((s, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Badge variant="outline" className={`text-xs border flex-1 justify-between ${categoryColors[s.category] || ''}`}>
                          <span>{s.name}</span>
                          <span className="text-[10px] opacity-70 ml-2">{s.category}</span>
                        </Badge>
                        <button onClick={() => removeSubject(idx)} className="hover:text-destructive"><X className="h-3 w-3" /></button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={newSubjectName}
                      onChange={e => setNewSubjectName(e.target.value)}
                      placeholder="Subject name"
                      className="flex-1"
                      onKeyDown={e => e.key === 'Enter' && addSubject()}
                    />
                    <Button variant="outline" size="sm" onClick={addSubject}>Add</Button>
                  </div>
                  <Select value={newSubjectCategory} onValueChange={v => setNewSubjectCategory(v as SubjectEntry['category'])}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Core">Core Subject</SelectItem>
                      <SelectItem value="2nd Language">2nd Language</SelectItem>
                      <SelectItem value="3rd Language">3rd Language</SelectItem>
                      <SelectItem value="Additional">Additional (varies per student)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </ScrollArea>
          <SheetFooter className="mt-4"><Button onClick={handleSave} className="w-full">{editId ? 'Update' : 'Add'} Class</Button></SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Classes;
