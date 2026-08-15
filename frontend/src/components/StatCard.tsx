import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  unit?: string;
  trend?: string;
  icon: LucideIcon;
  accent: "primary" | "temperature" | "rainfall" | "ndvi";
  loading?: boolean;
}

const accentMap = {
  primary: "bg-primary/10 text-primary",
  temperature: "bg-[hsl(var(--temperature)/0.12)] text-[hsl(var(--temperature))]",
  rainfall: "bg-[hsl(var(--rainfall)/0.12)] text-[hsl(var(--rainfall))]",
  ndvi: "bg-[hsl(var(--ndvi)/0.12)] text-[hsl(var(--ndvi))]",
};

const StatCard = ({ title, value, unit, trend, icon: Icon, accent, loading }: StatCardProps) => {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/60 gradient-card p-6 shadow-soft transition-smooth hover:shadow-elevated hover:-translate-y-1">
      <div className="flex items-start justify-between mb-4">
        <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl transition-smooth group-hover:scale-110", accentMap[accent])}>
          <Icon className="h-5 w-5" />
        </div>
        {trend && !loading && (
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-muted text-muted-foreground">
            {trend}
          </span>
        )}
      </div>
      <p className="text-sm text-muted-foreground mb-1">{title}</p>
      {loading ? (
        <div className="h-9 w-24 bg-muted animate-pulse rounded" />
      ) : (
        <p className="font-display text-3xl font-bold text-foreground">
          {value}
          {unit && <span className="text-base font-medium text-muted-foreground ml-1">{unit}</span>}
        </p>
      )}
    </div>
  );
};

export default StatCard;