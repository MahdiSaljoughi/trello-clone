import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/boards
export async function GET() {
  try {
    const boards = await prisma.board.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(boards);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch boards" },
      { status: 500 }
    );
  }
}

// POST /api/boards
export async function POST(request: Request) {
  try {
    const { title, description } = await request.json();

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const board = await prisma.board.create({
      data: {
        title,
        description,
      },
    });

    return NextResponse.json(board);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create board" },
      { status: 500 }
    );
  }
}
