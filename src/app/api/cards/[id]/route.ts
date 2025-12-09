import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  ctx: RouteContext<"/api/cards/[id]">
) {
  const params = await ctx.params;
  try {
    const {
      title,
      description,
      listId,
      order,
      priority,
      dueDate,
      isCompleted,
    } = await request.json();

    const updatedCard = await prisma.card.update({
      where: { id: params.id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(listId && { listId }),
        ...(order !== undefined && { order }),
        ...(priority && { priority }),
        ...(dueDate !== undefined && {
          dueDate: dueDate ? new Date(dueDate) : null,
        }),
        ...(isCompleted !== undefined && { isCompleted }),
      },
    });

    return NextResponse.json(updatedCard);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to update card",
      },
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
