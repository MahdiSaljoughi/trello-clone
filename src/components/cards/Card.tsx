// src/components/cards/Card.tsx (نسخه نهایی با نمایش لیبل روی کارت)
"use client";

import { Card as CardType, Label } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Calendar, Tag, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { PriorityBadge } from "./PriorityBadge";
import { LabelBadge } from "@/components/labels/LabelBadge";
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

  // مدیریت لیبل‌ها با optional chaining
  const cardLabels = card?.cardLabels || [];
  const labels = cardLabels.map((cl: any) => cl?.label || cl);
  const hasLabels = labels.length > 0;

  // برای نمایش روی کارت، حداکثر 2 لیبل نمایش می‌دیم
  const MAX_LABELS_ON_CARD = 2;
  const visibleLabels = labels.slice(0, MAX_LABELS_ON_CARD);
  const remainingLabels = labels.length - MAX_LABELS_ON_CARD;
  console.log(cardLabels);
  return (
    <>
      <Card
        className={cn(
          "cursor-pointer hover:shadow-md transition-shadow relative",
          card.isCompleted && [
            "border-green-300 bg-green-50",
            "hover:border-green-400 hover:bg-green-100",
          ]
        )}
        onClick={() => setShowDetail(true)}
      >
        {/* Completed overlay */}
        {card.isCompleted && (
          <div className="absolute inset-0 bg-green-500/5 rounded-lg pointer-events-none" />
        )}

        <CardContent className="p-4 space-y-3 relative">
          {/* بخش اول: لیبل‌ها */}
          {hasLabels && (
            <div className="mb-2 space-y-1">
              <div className="flex flex-wrap gap-1">
                {visibleLabels.map((label: Label, index: number) => (
                  <LabelBadge key={label?.id || index} label={label} />
                ))}

                {/* نمایش تعداد لیبل‌های باقی‌مانده */}
                {remainingLabels > 0 && (
                  <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-600 text-xs">
                    +{remainingLabels}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* بخش دوم: عنوان و اولویت */}
          <div className="flex justify-between items-start gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2">
                {card.isCompleted && (
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                )}
                <h4
                  className={cn(
                    "font-medium text-gray-900 truncate",
                    card.isCompleted && [
                      "line-through text-gray-600",
                      "decoration-2 decoration-green-500",
                    ]
                  )}
                >
                  {card.title}
                </h4>
              </div>

              {/* توضیحات کوتاه */}
              {card.description && (
                <p
                  className={cn(
                    "text-sm text-gray-600 mt-1 line-clamp-1",
                    card.isCompleted && "text-gray-500 line-through"
                  )}
                >
                  {card.description}
                </p>
              )}
            </div>

            <div className="shrink-0">
              <PriorityBadge
                priority={card.priority}
                isCompleted={card.isCompleted}
              />
            </div>
          </div>

          {/* بخش سوم: چک‌لیست و اطلاعات پایین */}
          <div className="space-y-2">
            {/* Progress Bar */}
            {totalItems > 0 && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Checklist</span>
                  <span>
                    {completedItems}/{totalItems}
                  </span>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      progress === 100 ? "bg-green-500" : "bg-blue-500",
                      card.isCompleted && "bg-green-600"
                    )}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Footer با اطلاعات */}
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-3">
                {/* تاریخ */}
                {card.dueDate && (
                  <div
                    className={cn(
                      "flex items-center gap-1",
                      card.isCompleted ? "text-green-600" : "text-gray-500"
                    )}
                  >
                    <Calendar className="h-3 w-3" />
                    <span>{format(new Date(card.dueDate), "MMM d")}</span>
                  </div>
                )}

                {/* تعداد لیبل‌ها */}
                {hasLabels && (
                  <div className="flex items-center gap-1 text-gray-500">
                    <Tag className="h-3 w-3" />
                    <span>{labels.length}</span>
                  </div>
                )}
              </div>

              {/* وضعیت تکمیل */}
              {card.isCompleted ? (
                <Badge
                  variant="outline"
                  className="bg-green-100 text-green-800 border-green-300 text-xs py-0"
                >
                  <Check className="h-3 w-3 mr-1" />
                  Done
                </Badge>
              ) : (
                <div className="text-gray-400 text-xs">
                  {format(new Date(card.updatedAt), "MMM d")}
                </div>
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
