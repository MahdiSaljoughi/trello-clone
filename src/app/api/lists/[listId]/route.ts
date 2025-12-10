// src/app/api/lists/[listId]/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  context: RouteContext<"/api/lists/[listId]">
) {
  const params = await context.params;
  try {
    const list = await prisma.list.findUnique({
      where: { id: params.listId },
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
    });

    if (!list) {
      return NextResponse.json({ error: "List not found" }, { status: 404 });
    }

    return NextResponse.json(list);
  } catch (error) {
    console.error("Failed to fetch list:", error);
    return NextResponse.json(
      { error: "Failed to fetch list" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  context: RouteContext<"/api/lists/[listId]">
) {
  const params = await context.params;
  try {
    const body = await request.json();
    const { title, description } = body;

    // اعتبارسنجی
    if (!title?.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // بررسی وجود لیست
    const existingList = await prisma.list.findUnique({
      where: { id: params.listId },
    });

    if (!existingList) {
      return NextResponse.json({ error: "List not found" }, { status: 404 });
    }

    // آپدیت لیست
    const list = await prisma.list.update({
      where: { id: params.listId },
      data: {
        title: title.trim(),
        description: description?.trim() || null,
      },
      include: {
        cards: {
          include: {
            cardItems: true,
          },
        },
      },
    });

    return NextResponse.json(list);
  } catch (error) {
    console.error("Failed to update list:", error);
    return NextResponse.json(
      { error: "Failed to update list" },
      { status: 500 }
    );
  }
}
