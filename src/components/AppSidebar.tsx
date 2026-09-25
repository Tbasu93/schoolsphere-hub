import {
  LayoutDashboard,
  GraduationCap,
  Users,
  UserCog,
  School,
  IndianRupee,
  CalendarDays,
  Megaphone,
  ArrowUpCircle,
  ClipboardCheck,
  Receipt,
  FileText,
  CalendarClock,
  SlidersHorizontal,
  Trophy,
  Package,
  Award,
  Home,
  BarChart3,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";

const mainNav = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Reports", url: "/reports", icon: BarChart3 },
  { title: "Students", url: "/students", icon: GraduationCap },
  { title: "Teachers", url: "/teachers", icon: Users },
  { title: "Staff", url: "/staff", icon: UserCog },
  { title: "Attendance", url: "/attendance", icon: ClipboardCheck },
];

const academicNav = [
  { title: "Routine", url: "/routine", icon: CalendarClock },
  { title: "Examinations", url: "/exams", icon: FileText },
  { title: "Promotion", url: "/promotion", icon: ArrowUpCircle },
];

const financeNav = [
  { title: "Fee Structure", url: "/fees", icon: IndianRupee },
  { title: "Fee Collection", url: "/fee-collection", icon: Receipt },
];

const studentServicesNav = [
  { title: "Items", url: "/items", icon: Package },
  { title: "Certificates", url: "/certificates", icon: Award },
  { title: "Houses", url: "/houses", icon: Home },
];

const configNav = [
  { title: "Classes & Sections", url: "/classes", icon: School },
  { title: "Promotion Policy", url: "/promotion-policy", icon: SlidersHorizontal },
  { title: "Events & Awards", url: "/events", icon: Trophy },
  { title: "Notices", url: "/notices", icon: Megaphone },
];

const navGroups = [
  { label: "Main", items: mainNav },
  { label: "Academics", items: academicNav },
  { label: "Finance", items: financeNav },
  { label: "Student Services", items: studentServicesNav },
  { label: "Configure", items: configNav },
];

export function AppSidebar() {
  return (
    <Sidebar className="border-r-0">
      <SidebarHeader className="p-4 pb-2">
        <div className="flex items-center gap-3 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-heading font-bold text-sm">
            EM
          </div>
          <div className="flex flex-col">
            <span className="font-heading font-bold text-sm text-sidebar-accent-foreground">
              English Medium
            </span>
            <span className="text-[11px] text-sidebar-foreground/60">
              School Management
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        {navGroups.map(group => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="text-sidebar-foreground/40 text-[10px] uppercase tracking-wider font-medium">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end={item.url === "/"}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
