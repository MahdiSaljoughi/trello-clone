import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const {
      title,
      description,
      listId,
      priority = "medium",
      dueDate,
    } = await request.json();

    if (!title || !listId) {
      return NextResponse.json(
        {
          error: "Title and listId are required",
        },
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
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        order: lastCard ? lastCard.order + 1 : 0,
      },
    });

    return NextResponse.json(card);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to create card",
      },
      { status: 500 }
    );
  }
}
