// src/app/api/checklist-items/[itemId]/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  context: RouteContext<"/api/checklist-items/[itemId]">
) {
  const params = await context.params;
  try {
    const body = await request.json();
    const { title, priority, isCompleted, dueDate } = body;

    const item = await prisma.checklistItem.update({
      where: { id: params.itemId },
      data: {
        title,
        priority,
        isCompleted,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update checklist item" },
      { status: 500 }
    );
  }
}

// src/app/api/checklist-items/[itemId]/route.ts
export async function DELETE(
  request: Request,
  context: RouteContext<"/api/checklist-items/[itemId]">
) {
  const params = await context.params;
  try {
    await prisma.checklistItem.delete({
      where: { id: params.itemId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete checklist item" },
      { status: 500 }
    );
  }
}
