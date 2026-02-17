import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { store, PromotionPolicy, SubjectEntry } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Settings2, Info } from "lucide-react";

const allCategories: SubjectEntry['category'][] = ['Core', '2nd Language', '3rd Language', 'Additional'];

const passCriteriaLabels: Record<string, string> = {
  'compulsory+3': 'Compulsory Subjects + 3',
  'compulsory+4': 'Compulsory Subjects + 4',
  'compulsory+5': 'Compulsory Subjects + 5',
  'all': 'All Subjects',
};

const PromotionPolicyPage = () => {
  const [policy, setPolicy] = useState<PromotionPolicy>(store.getPromotionPolicy());

  const handleSave = () => {
    if (policy.passMarksPercent < 0 || policy.passMarksPercent > 100) {
      toast.error("Pass marks must be between 0 and 100");
      return;
    }
    if (policy.compulsoryCategories.length === 0) {
      toast.error("Select at least one compulsory subject category");
      return;
    }
    store.setPromotionPolicy(policy);
    toast.success("Promotion policy saved successfully");
  };

  const toggleCategory = (cat: string) => {
    setPolicy(p => ({
      ...p,
      compulsoryCategories: p.compulsoryCategories.includes(cat)
        ? p.compulsoryCategories.filter(c => c !== cat)
        : [...p.compulsoryCategories, cat],
    }));
  };

  return (
    <div>
      <PageHeader title="Promotion Policy" description="Define eligibility criteria for student promotion" />

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-base font-heading flex items-center gap-2">
            <Settings2 className="h-4 w-4" /> Eligibility Criteria
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-start gap-2 p-3 rounded-lg border border-primary/20 bg-primary/5">
            <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground">
              These criteria determine which students are automatically marked as eligible for promotion.
              If a compulsory category includes 2nd/3rd Language, the system checks each student's actual language subject from their exam results.
              Admin can still force-promote ineligible students with confirmation.
            </p>
          </div>

          {/* Compulsory Subject Categories */}
          <div className="space-y-3">
            <Label>Compulsory Subject Categories</Label>
            <p className="text-xs text-muted-foreground">
              Students must pass all subjects in these categories. For 2nd/3rd Language, it applies per-student based on their actual subjects.
            </p>
            <div className="space-y-2">
              {allCategories.map(cat => (
                <div key={cat} className="flex items-center gap-2">
                  <Checkbox
                    id={`cat-${cat}`}
                    checked={policy.compulsoryCategories.includes(cat)}
                    onCheckedChange={() => toggleCategory(cat)}
                  />
                  <Label htmlFor={`cat-${cat}`} className="text-sm font-normal cursor-pointer">{cat}</Label>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-1">
              {policy.compulsoryCategories.map(c => (
                <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>
              ))}
            </div>
          </div>

          {/* Pass Marks */}
          <div className="space-y-2">
            <Label>Pass Marks in Each Subject (Min %)</Label>
            <Input
              type="number"
              min={0}
              max={100}
              value={policy.passMarksPercent}
              onChange={e => setPolicy(p => ({ ...p, passMarksPercent: Number(e.target.value) }))}
            />
            <p className="text-xs text-muted-foreground">Minimum percentage required to pass each individual subject</p>
          </div>

          {/* Pass Criteria */}
          <div className="space-y-2">
            <Label>Pass Criteria</Label>
            <Select
              value={policy.passCriteria}
              onValueChange={(v: PromotionPolicy['passCriteria']) => setPolicy(p => ({ ...p, passCriteria: v }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="compulsory+3">Compulsory Subjects + 3</SelectItem>
                <SelectItem value="compulsory+4">Compulsory Subjects + 4</SelectItem>
                <SelectItem value="compulsory+5">Compulsory Subjects + 5</SelectItem>
                <SelectItem value="all">All Subjects</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {policy.passCriteria === 'all'
                ? 'Student must pass every subject to be eligible'
                : `Student must pass all compulsory subjects + ${policy.passCriteria.split('+')[1]} additional subjects`}
            </p>
          </div>

          {/* Exam Scope */}
          <div className="space-y-2">
            <Label>Which Exam to Account</Label>
            <Select
              value={policy.examScope}
              onValueChange={(v: 'annual' | 'all') => setPolicy(p => ({ ...p, examScope: v }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="annual">Only Annual Exam</SelectItem>
                <SelectItem value="all">All Exams (Combined)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {policy.examScope === 'annual'
                ? 'Only the annual/final exam marks are considered'
                : 'Marks from all exams in the academic year are combined (total obtained / total max)'}
            </p>
          </div>

          <Button onClick={handleSave} className="w-full">Save Policy</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PromotionPolicyPage;
