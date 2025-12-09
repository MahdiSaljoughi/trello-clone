import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/cards
export async function POST(request: Request) {
  try {
    const { title, description, listId } = await request.json();

    if (!title || !listId) {
      return NextResponse.json(
        { error: "Title and listId are required" },
        { status: 400 }
      );
    }

    // Get last order
    const lastCard = await prisma.card.findFirst({
      where: { listId },
      orderBy: { order: "desc" },
    });

    const card = await prisma.card.create({
      data: {
        title,
        description,
        listId,
        order: lastCard ? lastCard.order + 1 : 0,
      },
    });

    return NextResponse.json(card);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create card" },
      { status: 500 }
    );
  }
}
