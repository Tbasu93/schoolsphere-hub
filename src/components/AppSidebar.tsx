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
  { title: "Students", url: "/students", icon: GraduationCap },
  { title: "Teachers", url: "/teachers", icon: Users },
  { title: "Staff", url: "/staff", icon: UserCog },
];

const configNav = [
  { title: "Classes & Sections", url: "/classes", icon: School },
  { title: "Fee Management", url: "/fees", icon: IndianRupee },
  { title: "Events & Holidays", url: "/events", icon: CalendarDays },
  { title: "Notices", url: "/notices", icon: Megaphone },
  { title: "Promotion", url: "/promotion", icon: ArrowUpCircle },
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
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/40 text-[10px] uppercase tracking-wider font-medium">
            Main
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
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

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/40 text-[10px] uppercase tracking-wider font-medium">
            Configure
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {configNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
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
      </SidebarContent>
    </Sidebar>
  );
}
