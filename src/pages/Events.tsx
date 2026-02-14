import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { store, Event } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, CalendarDays } from "lucide-react";
import { toast } from "sonner";

const emptyEvent: Omit<Event, 'id'> = { title: '', date: '', type: 'Event', description: '' };

const typeColors: Record<string, string> = {
  Event: 'default',
  Holiday: 'destructive',
  Exam: 'secondary',
};

const Events = () => {
  const [events, setEvents] = useState(store.getEvents());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyEvent);
  const [filterType, setFilterType] = useState('All');

  const save = (list: Event[]) => { setEvents(list); store.setEvents(list); };
  const filtered = events.filter(e => filterType === 'All' || e.type === filterType).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const openNew = () => { setForm(emptyEvent); setEditId(null); setDialogOpen(true); };
  const openEdit = (e: Event) => { setForm(e); setEditId(e.id); setDialogOpen(true); };

  const handleSave = () => {
    if (!form.title || !form.date) { toast.error('Title and date are required'); return; }
    if (editId) {
      save(events.map(e => e.id === editId ? { ...form, id: editId } : e));
      toast.success('Event updated');
    } else {
      save([...events, { ...form, id: store.generateId() }]);
      toast.success('Event added');
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => { save(events.filter(e => e.id !== id)); toast.success('Event removed'); };
  const updateForm = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  return (
    <div>
      <PageHeader title="Events & Holidays" description="Manage school calendar" actions={<Button onClick={openNew} size="sm"><Plus className="h-4 w-4 mr-1" /> Add Event</Button>} />

      <div className="flex gap-2 mb-4">
        {['All', 'Event', 'Holiday', 'Exam'].map(t => (
          <Button key={t} variant={filterType === t ? 'default' : 'outline'} size="sm" onClick={() => setFilterType(t)}>{t}</Button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(e => (
          <Card key={e.id} className="group">
            <CardContent className="pt-4">
              <div className="flex items-start justify-between mb-2">
                <Badge variant={typeColors[e.type] as any} className="text-[10px]">{e.type}</Badge>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openEdit(e)}><Pencil className="h-3 w-3" /></Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleDelete(e.id)}><Trash2 className="h-3 w-3" /></Button>
                </div>
              </div>
              <h3 className="font-heading font-semibold text-sm mb-1">{e.title}</h3>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                <CalendarDays className="h-3 w-3" />
                {new Date(e.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
              {e.description && <p className="text-xs text-muted-foreground">{e.description}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{editId ? 'Edit Event' : 'Add Event'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Title *</Label><Input value={form.title} onChange={e => updateForm('title', e.target.value)} /></div>
            <div><Label>Date *</Label><Input type="date" value={form.date} onChange={e => updateForm('date', e.target.value)} /></div>
            <div>
              <Label>Type</Label>
              <Select value={form.type} onValueChange={v => updateForm('type', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Event">Event</SelectItem><SelectItem value="Holiday">Holiday</SelectItem><SelectItem value="Exam">Exam</SelectItem></SelectContent>
              </Select>
            </div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={e => updateForm('description', e.target.value)} rows={3} /></div>
          </div>
          <DialogFooter><Button onClick={handleSave}>{editId ? 'Update' : 'Add'} Event</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Events;
