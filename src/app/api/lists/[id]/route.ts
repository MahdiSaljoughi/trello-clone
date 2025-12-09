import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT /api/lists/[id]
export async function PUT(
  request: Request,
  ctx: RouteContext<"/api/lists/[id]">
) {
  const params = await ctx.params;
  try {
    const { title, order } = await request.json();

    if (order !== undefined) {
      // Update orders of other lists
      const list = await prisma.list.findUnique({
        where: { id: params.id },
      });

      if (list) {
        if (order > list.order) {
          // لیست به پایین رفته
          await prisma.list.updateMany({
            where: {
              boardId: list.boardId,
              order: { gt: list.order, lte: order },
            },
            data: { order: { decrement: 1 } },
          });
        } else if (order < list.order) {
          // لیست به بالا رفته
          await prisma.list.updateMany({
            where: {
              boardId: list.boardId,
              order: { gte: order, lt: list.order },
            },
            data: { order: { increment: 1 } },
          });
        }
      }
    }

    const updatedList = await prisma.list.update({
      where: { id: params.id },
      data: { title, order },
    });

    return NextResponse.json(updatedList);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update list" },
      { status: 500 }
    );
  }
}

// DELETE /api/lists/[id]
export async function DELETE(
  request: Request,
  ctx: RouteContext<"/api/lists/[id]">
) {
  const params = await ctx.params;
  try {
    await prisma.list.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "List deleted" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete list" },
      { status: 500 }
    );
  }
}
