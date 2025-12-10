// src/components/labels/LabelBadge.tsx
import { Label } from "@/types";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface LabelBadgeProps {
  label: Label;
  onRemove?: () => void;
  compact?: boolean;
}

export function LabelBadge({
  label,
  onRemove,
  compact = false,
}: LabelBadgeProps) {
  const getContrastColor = (hexColor: string): string => {
    const hex = hexColor.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? "#000000" : "#ffffff";
  };

  if (compact) {
    return (
      <div
        className="w-4 h-4 rounded-full border border-white shadow-sm"
        style={{ backgroundColor: label.color }}
        title={label.name}
      />
    );
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
        "shadow-sm hover:shadow transition-shadow"
      )}
      style={{
        backgroundColor: label.color,
        color: getContrastColor(label.color),
      }}
    >
      <span>{label.name}</span>
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            if (onRemove) {
              onRemove();
            }
          }}
          className="opacity-70 hover:opacity-100 rounded-full p-0.5"
          style={{ color: getContrastColor(label.color) }}
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}
