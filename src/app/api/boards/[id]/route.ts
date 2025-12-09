import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/boards/[id]
export async function GET(
  request: Request,
  context: RouteContext<"/api/boards/[id]">
) {
  const { id } = await context.params;
  try {
    const board = await prisma.board.findUnique({
      where: { id },
      include: {
        lists: {
          include: {
            cards: true,
          },
          orderBy: { order: "asc" },
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

// PUT /api/boards/[id]
export async function PUT(
  request: Request,
  context: RouteContext<"/api/boards/[id]">
) {
  const { id } = await context.params;
  try {
    const { title, description } = await request.json();

    const board = await prisma.board.update({
      where: { id },
      data: { title, description },
    });

    return NextResponse.json(board);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update board" },
      { status: 500 }
    );
  }
}

// DELETE /api/boards/[id]
export async function DELETE(
  request: Request,
  context: RouteContext<"/api/boards/[id]">
) {
  const { id } = await context.params;
  try {
    await prisma.board.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Board deleted" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete board" },
      { status: 500 }
    );
  }
}
