// src/app/api/lists/[listId]/cards/cards/route.ts
import { Priority } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  context: RouteContext<"/api/lists/[listId]/cards">
) {
  const params = await context.params;
  try {
    const body = await request.json();
    const { title, description, priority, dueDate } = body;

    // اعتبارسنجی
    if (!title?.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // بررسی وجود لیست
    const list = await prisma.list.findUnique({
      where: { id: params.listId },
    });

    if (!list) {
      return NextResponse.json({ error: "List not found" }, { status: 404 });
    }

    // پیدا کردن آخرین order
    const lastCard = await prisma.card.findFirst({
      where: { listId: params.listId },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const newOrder = lastCard ? lastCard.order + 1 : 0;

    // ایجاد کارت
    const card = await prisma.card.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        priority: (priority as Priority) || "MEDIUM",
        dueDate: dueDate ? new Date(dueDate) : null,
        order: newOrder,
        listId: params.listId,
      },
      include: {
        cardItems: true,
      },
    });

    return NextResponse.json(card, { status: 201 });
  } catch (error) {
    console.error("Failed to create card:", error);
    return NextResponse.json(
      { error: "Failed to create card" },
      { status: 500 }
    );
  }
}

// src/app/api/lists/[listId]/cards/cards/route.ts
export async function GET(
  request: Request,
  context: RouteContext<"/api/lists/[listId]/cards">
) {
  const params = await context.params;
  try {
    const cards = await prisma.card.findMany({
      where: { listId: params.listId },
      include: {
        cardItems: {
          orderBy: {
            order: "asc",
          },
        },
      },
      orderBy: {
        order: "asc",
      },
    });

    return NextResponse.json(cards);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch cards" },
      { status: 500 }
    );
  }
}
