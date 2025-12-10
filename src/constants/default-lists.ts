// src/constants/default-lists.ts
export const DEFAULT_LISTS = [
  { title: "To Do" },
  { title: "In Progress" },
  { title: "Review" },
  { title: "Done" },
] as const;

// یا اگر می‌خوایم description هم داشته باشیم:
export const DEFAULT_LISTS_WITH_DESCRIPTION = [
  {
    title: "To Do",
    description: "کارهایی که باید انجام بشن",
  },
  {
    title: "In Progress",
    description: "کارهایی که در حال انجام هستند",
  },
  {
    title: "Review",
    description: "کارهایی که نیاز به بررسی دارند",
  },
  {
    title: "Done",
    description: "کارهای تکمیل شده",
  },
] as const;
