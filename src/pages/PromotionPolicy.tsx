import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { store, PromotionPolicy } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Settings2, Info } from "lucide-react";

const PromotionPolicyPage = () => {
  const [policy, setPolicy] = useState<PromotionPolicy>(store.getPromotionPolicy());

  const handleSave = () => {
    if (policy.minPercentage < 0 || policy.minPercentage > 100) {
      toast.error("Minimum percentage must be between 0 and 100");
      return;
    }
    if (policy.minAttendancePercent < 0 || policy.minAttendancePercent > 100) {
      toast.error("Minimum attendance must be between 0 and 100");
      return;
    }
    store.setPromotionPolicy(policy);
    toast.success("Promotion policy saved successfully");
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
              Admin can still force-promote ineligible students with confirmation.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Minimum Overall Percentage (%)</Label>
            <Input
              type="number"
              min={0}
              max={100}
              value={policy.minPercentage}
              onChange={e => setPolicy(p => ({ ...p, minPercentage: Number(e.target.value) }))}
            />
            <p className="text-xs text-muted-foreground">Students scoring below this in exams will be marked as not eligible</p>
          </div>

          <div className="space-y-2">
            <Label>Minimum Attendance (%)</Label>
            <Input
              type="number"
              min={0}
              max={100}
              value={policy.minAttendancePercent}
              onChange={e => setPolicy(p => ({ ...p, minAttendancePercent: Number(e.target.value) }))}
            />
            <p className="text-xs text-muted-foreground">Students with attendance below this will be marked as not eligible</p>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label>Require All Subjects Pass</Label>
              <p className="text-xs text-muted-foreground">Student must pass every subject to be eligible</p>
            </div>
            <Switch
              checked={policy.requireAllSubjectsPass}
              onCheckedChange={v => setPolicy(p => ({ ...p, requireAllSubjectsPass: v }))}
            />
          </div>

          {!policy.requireAllSubjectsPass && (
            <div className="space-y-2">
              <Label>Minimum Subjects to Pass</Label>
              <Input
                type="number"
                min={0}
                value={policy.minSubjectsPass}
                onChange={e => setPolicy(p => ({ ...p, minSubjectsPass: Number(e.target.value) }))}
              />
              <p className="text-xs text-muted-foreground">Set to 0 to disable subject-wise check (only percentage matters)</p>
            </div>
          )}

          <Button onClick={handleSave} className="w-full">Save Policy</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PromotionPolicyPage;
