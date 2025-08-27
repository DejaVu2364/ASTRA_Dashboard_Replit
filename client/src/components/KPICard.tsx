import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideProps } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string;
  change?: string;
  icon: React.ComponentType<LucideProps>;
  description?: string;
}

/**
 * A reusable card component for displaying a Key Performance Indicator (KPI).
 * Shows a title, a large value, an optional change indicator, and an icon.
 */
export function KPICard({ title, value, change, icon: Icon, description }: KPICardProps) {
  const isPositive = change?.startsWith('+');
  const isNegative = change?.startsWith('-');

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p className={cn(
            "text-xs",
            isPositive && "text-green-500",
            isNegative && "text-red-500",
            !isPositive && !isNegative && "text-muted-foreground"
          )}>
            {change} from last month
          </p>
        )}
        {description && !change && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
