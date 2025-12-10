// src/app/api/checklist-items/[itemId]/reorder/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  context: RouteContext<"/api/checklist-items/[itemId]/reorder">
) {
  const params = await context.params;
  try {
    const body = await request.json();
    const { newOrder, cardId } = body;

    const item = await prisma.checklistItem.findUnique({
      where: { id: params.itemId },
      select: { order: true },
    });

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // منطق مرتب‌سازی مشابه کارت‌ها
    if (item.order < newOrder) {
      await prisma.checklistItem.updateMany({
        where: {
          cardId,
          order: { gt: item.order, lte: newOrder },
        },
        data: {
          order: { decrement: 1 },
        },
      });
    } else {
      await prisma.checklistItem.updateMany({
        where: {
          cardId,
          order: { gte: newOrder, lt: item.order },
        },
        data: {
          order: { increment: 1 },
        },
      });
    }

    const updatedItem = await prisma.checklistItem.update({
      where: { id: params.itemId },
      data: { order: newOrder },
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to reorder item" },
      { status: 500 }
    );
  }
}
