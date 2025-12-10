// src/components/cards/CardDetailDialog.tsx
"use client";

import { useEffect, useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { fetchCard, updateCard, deleteCard } from "@/lib/api";
import { Card as CardType } from "@/types";
import { CalendarIcon, Check, Clock, ListTodo, Trash2, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Checklist } from "@/components/checklist/Checklist";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  dueDate: z.date().optional(),
  isCompleted: z.boolean().default(false),
});

interface CardDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cardId: string;
  onCardUpdated: () => void;
  onCardDeleted: () => void;
}

export function CardDetailDialog({
  open,
  onOpenChange,
  cardId,
  onCardUpdated,
  onCardDeleted,
}: CardDetailDialogProps) {
  const [card, setCard] = useState<CardType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "MEDIUM",
      isCompleted: false,
    },
  });

  useEffect(() => {
    if (open && cardId) {
      loadCard();
    }
  }, [open, cardId]);

  const loadCard = async () => {
    try {
      const data = await fetchCard(cardId);
      setCard(data);

      form.reset({
        title: data.title,
        description: data.description || "",
        priority: data.priority,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        isCompleted: data.isCompleted,
      });
    } catch (error) {
      console.error("Failed to load card:", error);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!card) return;

    try {
      setIsLoading(true);
      await updateCard(card.id, {
        ...values,
        dueDate: values.dueDate,
      });

      await loadCard();
      onCardUpdated();
    } catch (error) {
      console.error("Failed to update card:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete() {
    if (!card) return;

    try {
      setIsDeleting(true);
      await deleteCard(card.id);
      onOpenChange(false);
      onCardDeleted();
    } catch (error) {
      console.error("Failed to delete card:", error);
    } finally {
      setIsDeleting(false);
    }
  }

  if (!card) {
    return null;
  }

  const completedItems = card.cardItems.filter(
    (item) => item.isCompleted
  ).length;
  const totalItems = card.cardItems.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Card Details</span>
            <div className="flex items-center gap-2">
              {card.isCompleted && (
                <Badge className="bg-green-100 text-green-800">
                  <Check className="h-3 w-3 mr-1" />
                  Completed
                </Badge>
              )}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Are you sure?</DialogTitle>
                    <DialogDescription>
                      This action cannot be undone. This will permanently delete
                      the card {card.title} and all of its checklist items.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose>Cancel</DialogClose>
                    <Button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {isDeleting ? "Deleting..." : "Delete Card"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </DialogTitle>
          <DialogDescription>
            In list: <span className="font-medium">{card.title}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Card Details Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="flex items-start gap-4">
                <FormField
                  control={form.control}
                  name="isCompleted"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex-1 space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            className="text-lg font-semibold border-none px-0 focus-visible:ring-0"
                            placeholder="Card title"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Add a more detailed description..."
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="LOW">Low</SelectItem>
                          <SelectItem value="MEDIUM">Medium</SelectItem>
                          <SelectItem value="HIGH">High</SelectItem>
                          <SelectItem value="URGENT">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Due Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>No due date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                          {field.value && (
                            <div className="p-3 border-t">
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={() => field.onChange(undefined)}
                              >
                                <X className="h-4 w-4 mr-2" />
                                Clear date
                              </Button>
                            </div>
                          )}
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </Form>

          {/* Card Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <Clock className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Created</p>
                <p className="font-medium">
                  {format(new Date(card.createdAt), "MMM d, yyyy")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <ListTodo className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Checklist</p>
                <p className="font-medium">
                  {completedItems}/{totalItems}
                </p>
              </div>
            </div>
          </div>

          {/* Checklist Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Checklist</h3>
              <span className="text-sm text-gray-500">
                {completedItems} of {totalItems} completed
              </span>
            </div>
            <Checklist
              cardId={card.id}
              items={card.cardItems}
              onUpdate={loadCard}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
