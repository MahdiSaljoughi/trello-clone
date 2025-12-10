// src/app/api/boards/[boardId]/lists/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  context: RouteContext<"/api/boards/[boardId]/lists">
) {
  const params = await context.params;
  try {
    const lists = await prisma.list.findMany({
      where: { boardId: params.boardId },
      include: {
        cards: {
          include: {
            cardItems: {
              orderBy: {
                order: "asc",
              },
            },
          },
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    return NextResponse.json(lists);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch lists" },
      { status: 500 }
    );
  }
}

// همچنین POST برای ایجاد لیست جدید (اگر بخوایم امکان ایجاد لیست جدید رو بدیم)
export async function POST(
  request: Request,
  context: RouteContext<"/api/boards/[boardId]/lists">
) {
  const params = await context.params;
  try {
    const body = await request.json();
    const { title, description } = body;

    // بررسی اینکه برد وجود داره
    const board = await prisma.board.findUnique({
      where: { id: params.boardId },
    });

    if (!board) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }

    // بررسی تعداد لیست‌ها (حداکثر ۴ تا)
    const listCount = await prisma.list.count({
      where: { boardId: params.boardId },
    });

    if (listCount >= 4) {
      return NextResponse.json(
        { error: "Maximum 4 lists allowed per board" },
        { status: 400 }
      );
    }

    const list = await prisma.list.create({
      data: {
        title,
        description,
        boardId: params.boardId,
      },
    });

    return NextResponse.json(list, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create list" },
      { status: 500 }
    );
  }
}
