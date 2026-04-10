import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center border-b border-border px-4 bg-background/80 backdrop-blur-md sticky top-0 z-10">
            <SidebarTrigger className="text-foreground" />
          </header>
          <main className="flex-1 p-6 overflow-auto scrollbar-thin bg-mesh">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
