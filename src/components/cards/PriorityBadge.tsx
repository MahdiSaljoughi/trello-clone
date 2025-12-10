// src/components/cards/PriorityBadge.tsx (آپدیت شده)
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Priority } from "@/types";

interface PriorityBadgeProps {
  priority: Priority;
  isCompleted?: boolean;
}

export function PriorityBadge({
  priority,
  isCompleted = false,
}: PriorityBadgeProps) {
  const getPriorityConfig = (priority: Priority) => {
    switch (priority) {
      case "URGENT":
        return {
          label: "Urgent",
          className: "bg-red-100 text-red-800 hover:bg-red-100",
          completedClassName: "bg-red-50 text-red-600 border-red-200",
        };
      case "HIGH":
        return {
          label: "High",
          className: "bg-orange-100 text-orange-800 hover:bg-orange-100",
          completedClassName: "bg-orange-50 text-orange-600 border-orange-200",
        };
      case "MEDIUM":
        return {
          label: "Medium",
          className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
          completedClassName: "bg-yellow-50 text-yellow-600 border-yellow-200",
        };
      case "LOW":
        return {
          label: "Low",
          className: "bg-green-100 text-green-800 hover:bg-green-100",
          completedClassName: "bg-green-50 text-green-600 border-green-200",
        };
      default:
        return {
          label: "Medium",
          className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
          completedClassName: "bg-yellow-50 text-yellow-600 border-yellow-200",
        };
    }
  };

  const config = getPriorityConfig(priority);

  return (
    <Badge
      variant="secondary"
      className={cn(
        "font-normal transition-colors",
        isCompleted ? config.completedClassName : config.className,
        isCompleted && "opacity-80"
      )}
    >
      {config.label}
    </Badge>
  );
}
