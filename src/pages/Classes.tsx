import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { store, ClassConfig } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";

const Classes = () => {
  const [classes, setClasses] = useState(store.getClasses());
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [sections, setSections] = useState<string[]>(['A']);
  const [newSection, setNewSection] = useState('');

  const save = (list: ClassConfig[]) => { setClasses(list); store.setClasses(list); };

  const openNew = () => { setName(''); setSections(['A']); setEditId(null); setSheetOpen(true); };
  const openEdit = (c: ClassConfig) => { setName(c.name); setSections(c.sections); setEditId(c.id); setSheetOpen(true); };

  const addSection = () => {
    const s = newSection.trim().toUpperCase();
    if (s && !sections.includes(s)) { setSections([...sections, s]); setNewSection(''); }
  };

  const handleSave = () => {
    if (!name) { toast.error('Class name is required'); return; }
    if (editId) {
      save(classes.map(c => c.id === editId ? { ...c, name, sections } : c));
      toast.success('Class updated');
    } else {
      save([...classes, { id: store.generateId(), name, sections }]);
      toast.success('Class added');
    }
    setSheetOpen(false);
  };

  const handleDelete = (id: string) => { save(classes.filter(c => c.id !== id)); toast.success('Class removed'); };

  return (
    <div>
      <PageHeader title="Classes & Sections" description="Configure class structure" actions={<Button onClick={openNew} size="sm"><Plus className="h-4 w-4 mr-1" /> Add Class</Button>} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.map(c => (
          <Card key={c.id} className="group">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-heading">{c.name}</CardTitle>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(c)}><Pencil className="h-3 w-3" /></Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(c.id)}><Trash2 className="h-3 w-3" /></Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1.5">
                {c.sections.map(s => (
                  <Badge key={s} variant="secondary" className="text-xs">Section {s}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent>
          <SheetHeader><SheetTitle>{editId ? 'Edit Class' : 'Add Class'}</SheetTitle></SheetHeader>
          <div className="space-y-4 mt-6">
            <div><Label>Class Name *</Label><Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Class 1" /></div>
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
          </div>
          <SheetFooter className="mt-6"><Button onClick={handleSave} className="w-full">{editId ? 'Update' : 'Add'} Class</Button></SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Classes;
