import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { store, Notice } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

const emptyNotice: Omit<Notice, 'id'> = { title: '', content: '', date: '', audience: 'All', priority: 'Normal' };

const priorityColors: Record<string, string> = { Normal: 'secondary', Important: 'default', Urgent: 'destructive' };

const Notices = () => {
  const [notices, setNotices] = useState(store.getNotices());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyNotice);

  const save = (list: Notice[]) => { setNotices(list); store.setNotices(list); };

  const openNew = () => { setForm({ ...emptyNotice, date: new Date().toISOString().split('T')[0] }); setEditId(null); setDialogOpen(true); };
  const openEdit = (n: Notice) => { setForm(n); setEditId(n.id); setDialogOpen(true); };

  const handleSave = () => {
    if (!form.title || !form.content) { toast.error('Title and content are required'); return; }
    if (editId) {
      save(notices.map(n => n.id === editId ? { ...form, id: editId } : n));
      toast.success('Notice updated');
    } else {
      save([...notices, { ...form, id: store.generateId() }]);
      toast.success('Notice published');
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => { save(notices.filter(n => n.id !== id)); toast.success('Notice removed'); };
  const updateForm = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  return (
    <div>
      <PageHeader title="Notices" description="Publish and manage school notices" actions={<Button onClick={openNew} size="sm"><Plus className="h-4 w-4 mr-1" /> New Notice</Button>} />

      <div className="space-y-3">
        {notices.map(n => (
          <Card key={n.id} className="group">
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-heading font-semibold text-sm">{n.title}</h3>
                    <Badge variant={priorityColors[n.priority] as any} className="text-[10px]">{n.priority}</Badge>
                    <Badge variant="outline" className="text-[10px]">{n.audience}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{n.content}</p>
                  <p className="text-xs text-muted-foreground">{new Date(n.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(n)}><Pencil className="h-3 w-3" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(n.id)}><Trash2 className="h-3 w-3" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {notices.length === 0 && <p className="text-center text-muted-foreground py-12">No notices yet</p>}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editId ? 'Edit Notice' : 'New Notice'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Title *</Label><Input value={form.title} onChange={e => updateForm('title', e.target.value)} /></div>
            <div><Label>Content *</Label><Textarea value={form.content} onChange={e => updateForm('content', e.target.value)} rows={4} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Audience</Label>
                <Select value={form.audience} onValueChange={v => updateForm('audience', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="All">All</SelectItem><SelectItem value="Students">Students</SelectItem><SelectItem value="Teachers">Teachers</SelectItem><SelectItem value="Parents">Parents</SelectItem></SelectContent>
                </Select>
              </div>
              <div>
                <Label>Priority</Label>
                <Select value={form.priority} onValueChange={v => updateForm('priority', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="Normal">Normal</SelectItem><SelectItem value="Important">Important</SelectItem><SelectItem value="Urgent">Urgent</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Date</Label><Input type="date" value={form.date} onChange={e => updateForm('date', e.target.value)} /></div>
          </div>
          <DialogFooter><Button onClick={handleSave}>{editId ? 'Update' : 'Publish'} Notice</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Notices;
