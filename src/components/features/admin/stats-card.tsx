"use client";

import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, type LucideIcon } from "lucide-react";

export interface StatsCardProps {
  title: string;
  value: string;
  change?: string;
  trend?: "up" | "down";
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
}

export function StatsCard({
  title,
  value,
  change,
  trend,
  icon: Icon,
  iconColor,
  iconBg,
}: StatsCardProps) {
  return (
    <div className="bg-card rounded-xl border shadow-sm p-5 flex items-start justify-between hover:shadow-md transition-shadow">
      <div className="flex flex-col gap-1">
        <p className="text-sm text-muted-foreground font-medium">{title}</p>
        <p className="text-2xl font-bold tracking-tight">{value}</p>
        {change && trend && (
          <div className="flex items-center gap-1.5 mt-1">
            {trend === "up" ? (
              <TrendingUp className="h-3.5 w-3.5 text-green-500" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5 text-red-500" />
            )}
            <span
              className={cn(
                "text-xs font-semibold",
                trend === "up" ? "text-green-500" : "text-red-500"
              )}
            >
              {change}
            </span>
            <span className="text-xs text-muted-foreground">vs last month</span>
          </div>
        )}
      </div>
      <div
        className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
          iconBg
        )}
      >
        <Icon className={cn("h-6 w-6", iconColor)} />
      </div>
    </div>
  );
}
