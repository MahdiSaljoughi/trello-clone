// src/app/api/checklist-items/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cardId = searchParams.get("cardId");

    if (!cardId) {
      return NextResponse.json(
        { error: "cardId query parameter is required" },
        { status: 400 }
      );
    }

    const checklistItems = await prisma.checklistItem.findMany({
      where: { cardId },
      orderBy: {
        order: "asc",
      },
      include: {
        card: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return NextResponse.json(checklistItems);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch checklist items" },
      { status: 500 }
    );
  }
}

// همچنین می‌تونیم یک POST برای ایجاد آیتم بدون نیاز به cardId در URL داشته باشیم:
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, priority, cardId } = body;

    if (!cardId) {
      return NextResponse.json(
        { error: "cardId is required" },
        { status: 400 }
      );
    }

    // بررسی وجود کارت
    const card = await prisma.card.findUnique({
      where: { id: cardId },
    });

    if (!card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    // پیدا کردن آخرین order
    const lastItem = await prisma.checklistItem.findFirst({
      where: { cardId },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const newOrder = lastItem ? lastItem.order + 1 : 0;

    const item = await prisma.checklistItem.create({
      data: {
        title,
        priority: priority || "MEDIUM",
        order: newOrder,
        cardId,
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
