import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT /api/cards/[id]
export async function PUT(
  request: Request,
  ctx: RouteContext<"/api/cards/[id]">
) {
  const params = await ctx.params;
  try {
    const { title, description, listId, order } = await request.json();

    // اگر لیست تغییر کرد، order را در لیست جدید تنظیم کنیم
    if (listId) {
      const card = await prisma.card.findUnique({
        where: { id: params.id },
      });

      // اگر لیست تغییر کرد، orderهای کارت‌های لیست قبلی را به‌روزرسانی کنیم
      if (card && card.listId !== listId) {
        // order کارت‌های لیست قبلی را کاهش دهیم
        await prisma.card.updateMany({
          where: {
            listId: card.listId,
            order: { gt: card.order },
          },
          data: { order: { decrement: 1 } },
        });

        // order کارت‌های لیست جدید را افزایش دهیم
        await prisma.card.updateMany({
          where: {
            listId: listId,
            order: { gte: order !== undefined ? order : 0 },
          },
          data: { order: { increment: 1 } },
        });
      } else if (order !== undefined) {
        // اگر فقط order تغییر کرده
        const card = await prisma.card.findUnique({
          where: { id: params.id },
        });

        if (card) {
          if (order > card.order) {
            // کارت به پایین رفته
            await prisma.card.updateMany({
              where: {
                listId: card.listId,
                order: { gt: card.order, lte: order },
              },
              data: { order: { decrement: 1 } },
            });
          } else if (order < card.order) {
            // کارت به بالا رفته
            await prisma.card.updateMany({
              where: {
                listId: card.listId,
                order: { gte: order, lt: card.order },
              },
              data: { order: { increment: 1 } },
            });
          }
        }
      }
    }

    const updatedCard = await prisma.card.update({
      where: { id: params.id },
      data: {
        title,
        description,
        listId,
        order: order !== undefined ? order : undefined,
      },
    });

    return NextResponse.json(updatedCard);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update card" },
      { status: 500 }
    );
  }
}

// DELETE /api/cards/[id]
export async function DELETE(
  request: Request,
  ctx: RouteContext<"/api/cards/[id]">
) {
  const params = await ctx.params;
  try {
    await prisma.card.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Card deleted" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete card" },
      { status: 500 }
    );
  }
}
