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

    const card = await prisma.card.update({
      where: { id: params.id },
      data: { title, description, listId, order },
    });

    return NextResponse.json(card);
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
