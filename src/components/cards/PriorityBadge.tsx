// src/components/cards/PriorityBadge.tsx
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Priority } from "@/types";

interface PriorityBadgeProps {
  priority: Priority;
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const getPriorityConfig = (priority: Priority) => {
    switch (priority) {
      case "URGENT":
        return {
          label: "Urgent",
          className: "bg-red-100 text-red-800 hover:bg-red-100",
        };
      case "HIGH":
        return {
          label: "High",
          className: "bg-orange-100 text-orange-800 hover:bg-orange-100",
        };
      case "MEDIUM":
        return {
          label: "Medium",
          className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
        };
      case "LOW":
        return {
          label: "Low",
          className: "bg-green-100 text-green-800 hover:bg-green-100",
        };
      default:
        return {
          label: "Medium",
          className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
        };
    }
  };

  const config = getPriorityConfig(priority);

  return (
    <Badge variant="secondary" className={cn("font-normal", config.className)}>
      {config.label}
    </Badge>
  );
}
