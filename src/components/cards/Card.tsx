// src/components/cards/Card.tsx (آپدیت شده)
import { Card as CardType } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Calendar } from "lucide-react";
import { format } from "date-fns";
import { PriorityBadge } from "./PriorityBadge";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { CardDetailDialog } from "./CardDetailDialog";

interface CardProps {
  card: CardType;
  onCardUpdated?: () => void;
  onCardDeleted?: () => void;
}

export function CardComponent({
  card,
  onCardUpdated,
  onCardDeleted,
}: CardProps) {
  const [showDetail, setShowDetail] = useState(false);
  const completedItems = card.cardItems.filter(
    (item) => item.isCompleted
  ).length;
  const totalItems = card.cardItems.length;
  const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  return (
    <>
      <Card
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => setShowDetail(true)}
      >
        <CardContent className="p-4 space-y-3">
          {/* Title and Priority */}
          <div className="flex justify-between items-start">
            <h4 className="font-medium text-gray-900">{card.title}</h4>
            <PriorityBadge priority={card.priority} />
          </div>

          {/* Description Preview */}
          {card.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {card.description}
            </p>
          )}

          {/* Progress Bar */}
          {totalItems > 0 && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Checklist</span>
                <span>
                  {completedItems}/{totalItems}
                </span>
              </div>
              <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full",
                    progress === 100 ? "bg-green-500" : "bg-blue-500"
                  )}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-between items-center text-sm text-gray-500">
            <div className="flex items-center gap-2">
              {card.dueDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{format(new Date(card.dueDate), "MMM d")}</span>
                </div>
              )}
              {card.isCompleted && (
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  <Check className="h-3 w-3 mr-1" />
                  Done
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card Detail Dialog */}
      {showDetail && (
        <CardDetailDialog
          open={showDetail}
          onOpenChange={setShowDetail}
          cardId={card.id}
          onCardUpdated={() => {
            if (onCardUpdated) onCardUpdated();
          }}
          onCardDeleted={() => {
            if (onCardDeleted) onCardDeleted();
          }}
        />
      )}
    </>
  );
}
