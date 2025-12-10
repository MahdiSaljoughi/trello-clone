// src/components/labels/ColorPicker.tsx
"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

const DEFAULT_COLORS = [
  "#3b82f6", // Blue
  "#10b981", // Green
  "#8b5cf6", // Purple
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#ec4899", // Pink
  "#06b6d4", // Cyan
  "#84cc16", // Lime
  "#f97316", // Orange
  "#6366f1", // Indigo
];

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const [customColor, setCustomColor] = useState(value);

  const handleColorClick = (color: string) => {
    onChange(color);
    setCustomColor(color);
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setCustomColor(color);
    onChange(color);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Color</label>
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-full border"
            style={{ backgroundColor: value }}
          />
          <span className="text-sm font-mono">{value}</span>
        </div>
      </div>

      {/* Default Colors */}
      <div className="grid grid-cols-5 gap-2">
        {DEFAULT_COLORS.map((color) => (
          <button
            key={color}
            onClick={() => handleColorClick(color)}
            className={cn(
              "w-8 h-8 rounded-full border-2 hover:scale-110 transition-transform",
              value === color && "border-gray-900 scale-110"
            )}
            style={{ backgroundColor: color }}
            title={color}
          >
            {value === color && <Check className="h-4 w-4 m-auto text-white" />}
          </button>
        ))}
      </div>

      {/* Custom Color Picker */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Custom Color</label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={customColor}
            onChange={handleCustomColorChange}
            className="w-10 h-10 cursor-pointer"
          />
          <input
            type="text"
            value={customColor}
            onChange={(e) => {
              const color = e.target.value;
              if (/^#[0-9A-F]{6}$/i.test(color)) {
                setCustomColor(color);
                onChange(color);
              }
            }}
            placeholder="#000000"
            className="flex-1 px-3 py-2 border rounded text-sm font-mono"
          />
        </div>
      </div>

      {/* Color Preview */}
      <div
        className="mt-4 p-3 rounded border"
        style={{ backgroundColor: `${value}20` }}
      >
        <div
          className="px-3 py-2 rounded text-sm font-medium"
          style={{
            backgroundColor: value,
            color: getContrastColor(value),
          }}
        >
          Label Preview
        </div>
        <p className="text-xs text-gray-500 mt-2">
          This is how your label will look
        </p>
      </div>
    </div>
  );
}

// Helper function to determine text color based on background
function getContrastColor(hexColor: string): string {
  // Remove the # if present
  const hex = hexColor.replace("#", "");

  // Convert to RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return black or white based on luminance
  return luminance > 0.5 ? "#000000" : "#ffffff";
}
