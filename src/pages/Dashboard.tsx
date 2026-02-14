import { GraduationCap, Users, UserCog, School, IndianRupee, CalendarDays, Megaphone, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { PageHeader } from "@/components/PageHeader";
import { store } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Dashboard = () => {
  const students = store.getStudents();
  const teachers = store.getTeachers();
  const staff = store.getStaff();
  const classes = store.getClasses();
  const events = store.getEvents();
  const notices = store.getNotices();
  const fees = store.getFees();

  const activeStudents = students.filter(s => s.status === 'Active').length;
  const upcomingEvents = events.filter(e => new Date(e.date) >= new Date()).slice(0, 5);
  const recentNotices = notices.slice(0, 3);
  const totalFeeExpected = fees.reduce((sum, f) => sum + f.amount, 0);

  return (
    <div>
      <PageHeader title="Dashboard" description="Overview of your school at a glance" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Students" value={activeStudents} icon={GraduationCap} color="primary" trend={`${students.length} enrolled`} />
        <StatCard title="Teachers" value={teachers.length} icon={Users} color="success" trend={`${teachers.filter(t => t.status === 'Active').length} active`} />
        <StatCard title="Staff" value={staff.length} icon={UserCog} color="accent" />
        <StatCard title="Classes" value={classes.length} icon={School} color="primary" trend={`${classes.reduce((s, c) => s + c.sections.length, 0)} sections total`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-heading flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" />
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No upcoming events</p>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="text-sm font-medium">{event.title}</p>
                      <p className="text-xs text-muted-foreground">{new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                    <Badge variant={event.type === 'Holiday' ? 'destructive' : event.type === 'Exam' ? 'secondary' : 'default'} className="text-[10px]">
                      {event.type}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-heading flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-accent" />
              Recent Notices
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentNotices.length === 0 ? (
              <p className="text-sm text-muted-foreground">No notices</p>
            ) : (
              <div className="space-y-3">
                {recentNotices.map((notice) => (
                  <div key={notice.id} className="py-2 border-b last:border-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium">{notice.title}</p>
                      {notice.priority === 'Urgent' && <Badge variant="destructive" className="text-[10px]">Urgent</Badge>}
                      {notice.priority === 'Important' && <Badge className="text-[10px] bg-accent text-accent-foreground">Important</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{notice.content}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
