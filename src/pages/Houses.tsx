import { useState, useMemo } from "react";
import { PageHeader } from "@/components/PageHeader";
import { store } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Search, Home } from "lucide-react";
import { toast } from "sonner";
import BulkUpload from "@/components/BulkUpload";

const houseColors: Record<string, string> = {
  Red: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30',
  Blue: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30',
  Yellow: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/30',
  Green: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/30',
};

const Houses = () => {
  const classes = store.getClasses();
  const allStudents = store.getStudents();
  const [houseConfig, setHouseConfig] = useState(store.getHouseConfig());
  const [newHouse, setNewHouse] = useState('');

  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('All');
  const [filterHouse, setFilterHouse] = useState('All');

  const saveConfig = (config: typeof houseConfig) => { setHouseConfig(config); store.setHouseConfig(config); };

  const addHouse = () => {
    if (!newHouse.trim()) return;
    if (houseConfig.names.includes(newHouse.trim())) { toast.error('House already exists'); return; }
    saveConfig({ names: [...houseConfig.names, newHouse.trim()] });
    setNewHouse('');
    toast.success('House added');
  };

  const removeHouse = (name: string) => {
    saveConfig({ names: houseConfig.names.filter(h => h !== name) });
    toast.success('House removed');
  };

  const importHouses = (rows: Record<string, string>[]) => {
    const names = rows.map(row => row.name.trim()).filter(Boolean);
    const merged = [...houseConfig.names, ...names.filter(name => !houseConfig.names.includes(name))];
    saveConfig({ names: merged });
    return { imported: merged.length - houseConfig.names.length, skipped: rows.length - (merged.length - houseConfig.names.length) };
  };

  const filteredStudents = useMemo(() => {
    return allStudents.filter(s => {
      if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterClass !== 'All' && s.className !== filterClass) return false;
      if (filterHouse !== 'All' && s.house !== filterHouse) return false;
      if (s.status !== 'Active') return false;
      return true;
    });
  }, [allStudents, search, filterClass, filterHouse]);

  // House stats
  const houseStats = useMemo(() => {
    const stats: Record<string, number> = {};
    houseConfig.names.forEach(h => { stats[h] = 0; });
    allStudents.filter(s => s.status === 'Active' && s.house).forEach(s => {
      if (s.house && stats[s.house] !== undefined) stats[s.house]++;
    });
    return stats;
  }, [allStudents, houseConfig]);

  return (
    <div>
      <PageHeader title="House Management" description="Manage houses and view student assignments" actions={<BulkUpload title="houses" fields={[{ key: 'name', label: 'House Name', required: true }]} sampleRows={[{ name: 'Red' }, { name: 'Blue' }]} onImport={importHouses} />} />

      {/* House config */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base font-heading flex items-center gap-2"><Home className="h-4 w-4" /> Houses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 mb-4">
            {houseConfig.names.map(h => (
              <div key={h} className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${houseColors[h] || 'bg-muted'}`}>
                <span className="font-medium text-sm">{h}</span>
                <Badge variant="secondary" className="text-[10px]">{houseStats[h] || 0} students</Badge>
                <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => removeHouse(h)}><Trash2 className="h-3 w-3" /></Button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input value={newHouse} onChange={e => setNewHouse(e.target.value)} placeholder="New house name" className="max-w-xs" onKeyDown={e => e.key === 'Enter' && addHouse()} />
            <Button size="sm" onClick={addHouse}><Plus className="h-4 w-4 mr-1" /> Add</Button>
          </div>
        </CardContent>
      </Card>

      {/* Student list */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by student name..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterClass} onValueChange={setFilterClass}>
          <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Classes</SelectItem>
            {classes.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterHouse} onValueChange={setFilterHouse}>
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Houses</SelectItem>
            {houseConfig.names.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Roll No</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Section</TableHead>
              <TableHead>House</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.map(s => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.name}</TableCell>
                <TableCell>{s.rollNo}</TableCell>
                <TableCell>{s.className}</TableCell>
                <TableCell>{s.section}</TableCell>
                <TableCell>
                  {s.house ? (
                    <Badge variant="outline" className={`text-[10px] ${houseColors[s.house] || ''}`}>{s.house}</Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {filteredStudents.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No students found</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Houses;
