import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/lists
export async function POST(request: Request) {
  try {
    const { title, boardId } = await request.json();

    if (!title || !boardId) {
      return NextResponse.json(
        { error: "Title and boardId are required" },
        { status: 400 }
      );
    }

    // Get last order
    const lastList = await prisma.list.findFirst({
      where: { boardId },
      orderBy: { order: "desc" },
    });

    const list = await prisma.list.create({
      data: {
        title,
        boardId,
        order: lastList ? lastList.order + 1 : 0,
      },
    });

    return NextResponse.json(list);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create list" },
      { status: 500 }
    );
  }
}
