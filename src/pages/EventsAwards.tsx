import { useState, useMemo } from "react";
import { PageHeader } from "@/components/PageHeader";
import { store, Event, EventParticipation } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, CalendarDays, Trophy, Search } from "lucide-react";
import { toast } from "sonner";

const emptyEvent: Omit<Event, 'id'> = { title: '', date: '', type: 'Event', description: '' };
const typeColors: Record<string, string> = { Event: 'default', Holiday: 'destructive', Exam: 'secondary' };

const EventsAwards = () => {
  const classes = store.getClasses();
  const allStudents = store.getStudents();
  const [events, setEvents] = useState(store.getEvents());
  const [participations, setParticipations] = useState(store.getEventParticipations());
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyEvent);
  const [filterType, setFilterType] = useState('All');

  // Award form
  const [awardSheetOpen, setAwardSheetOpen] = useState(false);
  const [awardForm, setAwardForm] = useState({ eventId: '', studentId: '', category: '', achievement: '', status: 'Participated' as 'Participated' | 'Awarded' });

  // Awards search
  const [awardSearch, setAwardSearch] = useState('');
  const [awardFilterClass, setAwardFilterClass] = useState('All');
  const [awardFilterAchievement, setAwardFilterAchievement] = useState('All');

  const saveEvents = (list: Event[]) => { setEvents(list); store.setEvents(list); };
  const saveParticipations = (list: EventParticipation[]) => { setParticipations(list); store.setEventParticipations(list); };

  const filtered = events.filter(e => filterType === 'All' || e.type === filterType).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const openNew = () => { setForm(emptyEvent); setEditId(null); setSheetOpen(true); };
  const openEdit = (e: Event) => { setForm(e); setEditId(e.id); setSheetOpen(true); };

  const handleSave = () => {
    if (!form.title || !form.date) { toast.error('Title and date required'); return; }
    if (editId) {
      saveEvents(events.map(e => e.id === editId ? { ...form, id: editId } : e));
      toast.success('Event updated');
    } else {
      saveEvents([...events, { ...form, id: store.generateId() }]);
      toast.success('Event added');
    }
    setSheetOpen(false);
  };

  const handleDelete = (id: string) => { saveEvents(events.filter(e => e.id !== id)); toast.success('Event removed'); };
  const updateForm = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  const handleAddAward = () => {
    if (!awardForm.eventId || !awardForm.studentId) { toast.error('Event and student required'); return; }
    const student = allStudents.find(s => s.id === awardForm.studentId);
    if (!student) return;
    const participation: EventParticipation = {
      id: store.generateId(), eventId: awardForm.eventId, studentId: student.id,
      studentName: student.name, className: student.className, section: student.section,
      category: awardForm.category, achievement: awardForm.achievement, status: awardForm.status,
    };
    saveParticipations([...participations, participation]);
    toast.success('Participation recorded');
    setAwardSheetOpen(false);
    setAwardForm({ eventId: '', studentId: '', category: '', achievement: '', status: 'Participated' });
  };

  const deleteParticipation = (id: string) => { saveParticipations(participations.filter(p => p.id !== id)); toast.success('Removed'); };

  // Unique achievements and categories for filtering
  const uniqueAchievements = [...new Set(participations.map(p => p.achievement).filter(Boolean))];

  const filteredParticipations = useMemo(() => {
    return participations.filter(p => {
      if (awardSearch && !p.studentName.toLowerCase().includes(awardSearch.toLowerCase())) return false;
      if (awardFilterClass !== 'All' && p.className !== awardFilterClass) return false;
      if (awardFilterAchievement !== 'All' && p.achievement !== awardFilterAchievement) return false;
      return true;
    });
  }, [participations, awardSearch, awardFilterClass, awardFilterAchievement]);

  return (
    <div>
      <PageHeader title="Events & Awards" description="Manage events, track participation and achievements" />

      <Tabs defaultValue="events">
        <TabsList className="mb-4">
          <TabsTrigger value="events">Events & Holidays</TabsTrigger>
          <TabsTrigger value="awards"><Trophy className="h-3 w-3 mr-1" /> Awards & Participation</TabsTrigger>
        </TabsList>

        <TabsContent value="events">
          <div className="flex gap-2 mb-4 flex-wrap">
            {['All', 'Event', 'Holiday', 'Exam'].map(t => (
              <Button key={t} variant={filterType === t ? 'default' : 'outline'} size="sm" onClick={() => setFilterType(t)}>{t}</Button>
            ))}
            <div className="flex-1" />
            <Button onClick={openNew} size="sm"><Plus className="h-4 w-4 mr-1" /> Add Event</Button>
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
        </TabsContent>

        <TabsContent value="awards">
          <div className="flex flex-wrap gap-3 mb-4 items-end">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by student name..." value={awardSearch} onChange={e => setAwardSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={awardFilterClass} onValueChange={setAwardFilterClass}>
              <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Classes</SelectItem>
                {classes.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={awardFilterAchievement} onValueChange={setAwardFilterAchievement}>
              <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Achievements</SelectItem>
                {uniqueAchievements.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button size="sm" onClick={() => setAwardSheetOpen(true)}><Plus className="h-4 w-4 mr-1" /> Add Participation</Button>
          </div>

          <div className="rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Class/Sec</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Achievement</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-16">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredParticipations.map(p => {
                  const event = events.find(e => e.id === p.eventId);
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.studentName}</TableCell>
                      <TableCell>{p.className} - {p.section}</TableCell>
                      <TableCell>{event?.title || '—'}</TableCell>
                      <TableCell>{p.category || '—'}</TableCell>
                      <TableCell>{p.achievement || '—'}</TableCell>
                      <TableCell>
                        <Badge variant={p.status === 'Awarded' ? 'default' : 'secondary'} className="text-[10px]">{p.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteParticipation(p.id)}><Trash2 className="h-3 w-3" /></Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredParticipations.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No participation records</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Event Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent>
          <SheetHeader><SheetTitle>{editId ? 'Edit Event' : 'Add Event'}</SheetTitle></SheetHeader>
          <div className="space-y-3 mt-6">
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
          <SheetFooter className="mt-6"><Button onClick={handleSave} className="w-full">{editId ? 'Update' : 'Add'} Event</Button></SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Award Sheet */}
      <Sheet open={awardSheetOpen} onOpenChange={setAwardSheetOpen}>
        <SheetContent>
          <SheetHeader><SheetTitle>Add Participation / Award</SheetTitle></SheetHeader>
          <div className="space-y-4 mt-6">
            <div>
              <Label>Event *</Label>
              <Select value={awardForm.eventId} onValueChange={v => setAwardForm(prev => ({ ...prev, eventId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select event" /></SelectTrigger>
                <SelectContent>{events.filter(e => e.type === 'Event').map(e => <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Student *</Label>
              <Select value={awardForm.studentId} onValueChange={v => setAwardForm(prev => ({ ...prev, studentId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                <SelectContent>{allStudents.filter(s => s.status === 'Active').map(s => <SelectItem key={s.id} value={s.id}>{s.name} ({s.className}-{s.section})</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Category</Label><Input value={awardForm.category} onChange={e => setAwardForm(prev => ({ ...prev, category: e.target.value }))} placeholder="e.g. 100m Race, Quiz" /></div>
            <div><Label>Achievement</Label><Input value={awardForm.achievement} onChange={e => setAwardForm(prev => ({ ...prev, achievement: e.target.value }))} placeholder="e.g. 1st Place, Winner" /></div>
            <div>
              <Label>Status</Label>
              <Select value={awardForm.status} onValueChange={v => setAwardForm(prev => ({ ...prev, status: v as any }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Participated">Participated</SelectItem><SelectItem value="Awarded">Awarded</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          <SheetFooter className="mt-6"><Button onClick={handleAddAward} className="w-full">Add Participation</Button></SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default EventsAwards;
