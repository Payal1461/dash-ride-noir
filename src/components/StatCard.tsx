import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  className?: string;
  trend?: ReactNode;
  secondaryIcon?: LucideIcon;
  iconColorClass?: string;
  glowClass?: string;
}

export function StatCard({ title, value, icon: Icon, className, trend, secondaryIcon: SecondaryIcon, iconColorClass = "text-primary", glowClass = "icon-glow" }: StatCardProps) {
  return (
    <div className={cn(
      "rounded-xl glass-card-hover p-6 animate-fade-in relative overflow-hidden",
      className
    )}>
      {SecondaryIcon && (
        <SecondaryIcon className="absolute bottom-2 right-2 h-8 w-8 text-muted-foreground/[0.12]" />
      )}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold mt-1.5 text-card-foreground font-heading">{value}</p>
          {trend && <div className="mt-1.5">{trend}</div>}
        </div>
        <div className={cn("h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center icon-hover", glowClass)}>
          <Icon className={cn("h-5 w-5", iconColorClass)} />
        </div>
      </div>
    </div>
  );
}
