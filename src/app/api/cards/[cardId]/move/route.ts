// src/app/api/cards/[cardId]/move/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  context: RouteContext<"/api/cards/[cardId]/move">
) {
  const params = await context.params;
  try {
    const body = await request.json();
    const { targetListId, newOrder } = body;

    // دریافت کارت فعلی
    const card = await prisma.card.findUnique({
      where: { id: params.cardId },
      select: { listId: true, order: true },
    });

    if (!card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    // اگر لیست تغییر کرده
    if (card.listId !== targetListId) {
      // کاهش order کارت‌های لیست مبدا
      await prisma.card.updateMany({
        where: {
          listId: card.listId,
          order: { gt: card.order },
        },
        data: {
          order: { decrement: 1 },
        },
      });

      // افزایش order کارت‌های لیست مقصد
      await prisma.card.updateMany({
        where: {
          listId: targetListId,
          order: { gte: newOrder },
        },
        data: {
          order: { increment: 1 },
        },
      });
    } else {
      // اگر در همان لیست جابجا شده
      if (card.order < newOrder) {
        await prisma.card.updateMany({
          where: {
            listId: targetListId,
            order: { gt: card.order, lte: newOrder },
          },
          data: {
            order: { decrement: 1 },
          },
        });
      } else {
        await prisma.card.updateMany({
          where: {
            listId: targetListId,
            order: { gte: newOrder, lt: card.order },
          },
          data: {
            order: { increment: 1 },
          },
        });
      }
    }

    // آپدیت کارت
    const updatedCard = await prisma.card.update({
      where: { id: params.cardId },
      data: {
        listId: targetListId,
        order: newOrder,
      },
      include: {
        list: true,
      },
    });

    return NextResponse.json(updatedCard);
  } catch (error) {
    return NextResponse.json({ error: "Failed to move card" }, { status: 500 });
  }
}
