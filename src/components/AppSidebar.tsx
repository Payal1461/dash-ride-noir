import {
  LayoutDashboard, Users, Car, UserCheck, MapPin, CreditCard, Star, XCircle,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Users", url: "/users", icon: Users },
  { title: "Drivers", url: "/drivers", icon: Car },
  { title: "Riders", url: "/riders", icon: UserCheck },
  { title: "Trips", url: "/trips", icon: MapPin },
  { title: "Payments", url: "/payments", icon: CreditCard },
  { title: "Reviews", url: "/reviews", icon: Star },
  { title: "Cancellations", url: "/cancellations", icon: XCircle },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-4 py-5 border-b border-sidebar-border">
        {!collapsed && (
          <h1 className="text-lg font-extrabold text-gradient-primary tracking-tight font-heading">RideShare</h1>
        )}
        {collapsed && (
          <span className="text-lg font-extrabold text-gradient-primary font-heading">R</span>
        )}
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.15em] text-sidebar-foreground/40 font-semibold">
            {!collapsed && "Navigation"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-primary transition-all duration-200"
                      activeClassName="bg-sidebar-accent text-primary font-semibold border-l-2 border-primary sidebar-active-glow"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span className="text-sm">{item.title}</span>}
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
