// src/app/api/boards/[boardId]/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  context: RouteContext<"/api/boards/[boardId]">
) {
  const { boardId } = await context.params;
  try {
    const board = await prisma.board.findUnique({
      where: { id: boardId },
      include: {
        lists: {
          include: {
            cards: {
              include: {
                cardItems: true,
                cardLabels: {
                  include: {
                    label: true,
                  },
                },
              },
              orderBy: {
                order: "asc",
              },
            },
          },
        },
      },
    });

    if (!board) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }

    return NextResponse.json(board);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch board" },
      { status: 500 }
    );
  }
}

// src/app/api/boards/[boardId]/route.ts
export async function PUT(
  request: Request,
  context: RouteContext<"/api/boards/[boardId]">
) {
  const { boardId } = await context.params;
  try {
    const body = await request.json();
    const { title, description } = body;

    const board = await prisma.board.update({
      where: { id: boardId },
      data: { title, description },
      include: {
        lists: {
          include: {
            cards: {
              include: {
                cardItems: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(board);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update board" },
      { status: 500 }
    );
  }
}

// src/app/api/boards/[boardId]/route.ts
export async function DELETE(
  request: Request,
  context: RouteContext<"/api/boards/[boardId]">
) {
  const { boardId } = await context.params;
  try {
    await prisma.board.delete({
      where: { id: boardId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete board" },
      { status: 500 }
    );
  }
}
