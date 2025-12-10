// src/app/api/cards/[cardId]/checklist-items/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  context: RouteContext<"/api/cards/[cardId]/checklist-items">
) {
  const params = await context.params;
  try {
    const body = await request.json();
    const { title, priority } = body;

    // پیدا کردن آخرین order در این کارت
    const lastItem = await prisma.checklistItem.findFirst({
      where: { cardId: params.cardId },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const newOrder = lastItem ? lastItem.order + 1 : 0;

    const item = await prisma.checklistItem.create({
      data: {
        title,
        priority: priority || "MEDIUM",
        order: newOrder,
        cardId: params.cardId,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create checklist item" },
      { status: 500 }
    );
  }
}
