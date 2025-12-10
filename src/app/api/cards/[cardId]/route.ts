// src/app/api/cards/[cardId]/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  context: RouteContext<"/api/cards/[cardId]">
) {
  const params = await context.params;
  try {
    const card = await prisma.card.findUnique({
      where: { id: params.cardId },
      include: {
        list: true,
        cardItems: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    if (!card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    return NextResponse.json(card);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch card" },
      { status: 500 }
    );
  }
}

// src/app/api/cards/[cardId]/route.ts
export async function PUT(
  request: Request,
  context: RouteContext<"/api/cards/[cardId]">
) {
  const params = await context.params;
  try {
    const body = await request.json();
    const { title, description, priority, dueDate, isCompleted } = body;

    const card = await prisma.card.update({
      where: { id: params.cardId },
      data: {
        title,
        description,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        isCompleted,
      },
      include: {
        cardItems: true,
      },
    });

    return NextResponse.json(card);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update card" },
      { status: 500 }
    );
  }
}

// src/app/api/cards/[cardId]/route.ts
export async function DELETE(
  request: Request,
  context: RouteContext<"/api/cards/[cardId]">
) {
  const params = await context.params;
  try {
    await prisma.card.delete({
      where: { id: params.cardId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete card" },
      { status: 500 }
    );
  }
}
