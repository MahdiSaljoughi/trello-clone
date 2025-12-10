// src/app/api/boards/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const boards = await prisma.board.findMany({
      include: {
        lists: {
          include: {
            cards: {
              include: {
                cardItems: true,
              },
              orderBy: {
                order: "asc",
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return NextResponse.json(boards);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch boards" },
      { status: 500 }
    );
  }
}

// src/app/api/boards/route.ts
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description } = body;

    // ایجاد برد با ۴ لیست پیش‌فرض - اینجا هندل می‌شه
    const board = await prisma.board.create({
      data: {
        title,
        description,
        lists: {
          create: [
            { title: "Backlog" },
            { title: "To Do" },
            { title: "In Progress" },
            { title: "Review" },
            { title: "Release" },
            { title: "Archived" },
          ],
        },
      },
      include: {
        lists: true,
      },
    });

    return NextResponse.json(board, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create board" },
      { status: 500 }
    );
  }
}
