"use client";

import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";

import {
  fetchCard,
  updateCard,
  deleteCard,
  fetchBoardLabels,
  fetchCardLabels,
  removeLabelFromCard,
} from "@/lib/api";

import { LabelManager } from "../labels/LabelManager";
import { LabelBadge } from "../labels/LabelBadge";
import { Checklist } from "@/components/checklist/Checklist";

import { Card as CardType, Label } from "@/types";

import { CalendarIcon, Clock, ListTodo, Trash2, X } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

// --------------------------
//        ZOD SCHEMA
// --------------------------
const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  dueDate: z.date().optional(),
  isCompleted: z.boolean(),
});

export function CardDetailDialog({
  open,
  onOpenChange,
  cardId,
  onCardUpdated,
  onCardDeleted,
}: any) {
  const [card, setCard] = useState<CardType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [availableLabels, setAvailableLabels] = useState<Label[]>([]);
  const [cardLabels, setCardLabels] = useState<Label[]>([]);
  const [removingLabelId, setRemovingLabelId] = useState<string | null>(null);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "MEDIUM",
      isCompleted: false,
    },
  });

  // --------------------------
  //   Load full card + labels
  // --------------------------
  const loadCardAndLabels = useCallback(async () => {
    try {
      const data = await fetchCard(cardId);
      setCard(data);

      form.reset({
        title: data.title,
        description: data.description ?? "",
        priority: data.priority,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        isCompleted: data.isCompleted,
      });
      // @ts-ignore
      const boardLabels = await fetchBoardLabels(data.list.boardId);
      const cardLabelsData = await fetchCardLabels(cardId);

      setAvailableLabels(boardLabels);
      // @ts-ignore
      setCardLabels(cardLabelsData.map((cl) => cl.label));
    } catch {
      toast.error("Failed to load card");
    }
  }, [cardId, form]);

  useEffect(() => {
    if (open) loadCardAndLabels();
  }, [open, loadCardAndLabels]);

  // --------------------------
  //        UPDATE CARD
  // --------------------------
  // @ts-ignore
  async function onSubmit(values) {
    if (!card) return;

    try {
      setIsLoading(true);

      await updateCard(card.id, {
        ...values,
        dueDate: values.dueDate ?? null,
      });

      onCardUpdated?.();
      toast.success("Card updated");

      loadCardAndLabels();
    } catch {
      toast.error("Failed to update");
    } finally {
      setIsLoading(false);
    }
  }

  // --------------------------
  //        DELETE CARD
  // --------------------------
  async function handleDelete() {
    if (!card) return;

    setIsDeleting(true);
    try {
      await deleteCard(card.id);
      toast.success("Card deleted");
      onCardDeleted?.();
      onOpenChange(false);
    } catch {
      toast.error("Failed to delete");
    } finally {
      setIsDeleting(false);
    }
  }

  // --------------------------
  //      REMOVE LABEL
  // --------------------------
  async function removeLabel(labelId: string) {
    if (!card) return;

    setRemovingLabelId(labelId);
    try {
      await removeLabelFromCard(card.id, labelId);

      setCardLabels((prev) => prev.filter((l) => l.id !== labelId));
      onCardUpdated?.();
      toast.success("Label removed");
    } catch {
      toast.error("Failed to remove label");
    } finally {
      setRemovingLabelId(null);
    }
  }

  if (!card) return null;

  const completedItems = card.cardItems.filter((i) => i.isCompleted).length;
  const totalItems = card.cardItems.length;

  // =====================================================
  //                     UI
  // =====================================================
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        {/* HEADER */}
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Card Details</span>

            {/* DELETE ICON */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-red-50">
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </DialogTrigger>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Card?</DialogTitle>
                  <DialogDescription>
                    This cannot be undone. This card and all its data will be
                    permanently deleted.
                  </DialogDescription>
                </DialogHeader>

                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>

                  <DialogClose asChild>
                    <Button
                      className="bg-red-600 hover:bg-red-700"
                      disabled={isDeleting}
                      onClick={handleDelete}
                    >
                      {isDeleting ? "Deleting..." : "Delete"}
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </DialogTitle>

          <DialogDescription>
            {/* @ts-ignore */}
            In list: <strong>{card.list.title}</strong>
          </DialogDescription>
        </DialogHeader>

        {/* BODY */}
        <div className="space-y-6">
          {/* -------------------------------- */}
          {/*                FORM              */}
          {/* -------------------------------- */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* LABELS */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Labels</h4>

                  <LabelManager
                    // @ts-ignore
                    boardId={card.list.boardId}
                    cardId={cardId}
                    availableLabels={availableLabels}
                    cardLabels={cardLabels}
                    onLabelsChange={(labels) => {
                      setCardLabels(labels);
                      onCardUpdated?.();
                    }}
                  />
                </div>

                {cardLabels.length ? (
                  <div className="flex flex-wrap gap-2">
                    {cardLabels.map((label) => (
                      <LabelBadge
                        key={label.id}
                        label={label}
                        // @ts-ignore
                        showRemove
                        loading={removingLabelId === label.id}
                        onRemove={() => removeLabel(label.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    No labels yet.
                  </p>
                )}
              </div>

              {/* TITLE + DESCRIPTION + COMPLETED */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          className="text-lg font-semibold border-none px-0 focus-visible:ring-0"
                          placeholder="Card title..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="description"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          className="resize-none"
                          {...field}
                          placeholder="Add details..."
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isCompleted"
                  render={({ field }) => (
                    <FormItem className="flex items-start space-x-3">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div>
                        <FormLabel>Mark as completed</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          {field.value
                            ? "🎉 Completed!"
                            : "Mark when finished."}
                        </p>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              {/* PRIORITY + DUE DATE */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>

                        <SelectContent>
                          <SelectItem value="LOW">Low</SelectItem>
                          <SelectItem value="MEDIUM">Medium</SelectItem>
                          <SelectItem value="HIGH">High</SelectItem>
                          <SelectItem value="URGENT">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date</FormLabel>

                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-between"
                          >
                            {field.value
                              ? format(field.value, "PPP")
                              : "No due date"}
                            <CalendarIcon className="h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>

                        <PopoverContent className="p-0">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                          />

                          {field.value && (
                            <Button
                              variant="outline"
                              className="w-full rounded-none"
                              onClick={() => field.onChange(undefined)}
                            >
                              <X className="h-4 w-4 mr-2" /> Clear date
                            </Button>
                          )}
                        </PopoverContent>
                      </Popover>
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </Form>

          {/* CARD STATS */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <Clock className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-500">Created</p>
                <p className="font-medium">
                  {format(new Date(card.createdAt), "MMM d, yyyy")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <ListTodo className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-500">Checklist</p>
                <p className="font-medium">
                  {completedItems}/{totalItems}
                </p>
              </div>
            </div>
          </div>

          {/* CHECKLIST */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Checklist</h3>
              <span className="text-sm text-gray-500">
                {completedItems} of {totalItems} completed
              </span>
            </div>

            <Checklist
              cardId={card.id}
              items={card.cardItems}
              onUpdate={() => {
                fetchCard(cardId).then((updated) => setCard(updated));
                onCardUpdated?.();
              }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
