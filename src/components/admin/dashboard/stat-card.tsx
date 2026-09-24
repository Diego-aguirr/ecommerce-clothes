import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  color: string;
}

export function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <div className="bg-card rounded-2xl shadow-sm border border-muted p-6 flex flex-col gap-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div
          className={`p-3 rounded-xl flex items-center justify-center ${color}`}
        >
          {icon}
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
        <h3 className="text-3xl font-bold tracking-tight text-foreground">
          {value}
        </h3>
      </div>
    </div>
  );
}
