// src/app/api/boards/[boardId]/labels/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  contex: RouteContext<"/api/boards/[boardId]/labels">
) {
  const params = await contex.params;
  try {
    const labels = await prisma.label.findMany({
      where: { boardId: params.boardId },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(labels);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch labels" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  contex: RouteContext<"/api/boards/[boardId]/labels">
) {
  const params = await contex.params;
  try {
    const body = await request.json();
    const { name, color } = body;

    if (!name?.trim() || !color) {
      return NextResponse.json(
        { error: "Name and color are required" },
        { status: 400 }
      );
    }

    const label = await prisma.label.create({
      data: {
        name: name.trim(),
        color,
        boardId: params.boardId,
      },
    });

    return NextResponse.json(label, { status: 201 });
  } catch (error) {
    console.error("Failed to create label:", error);
    return NextResponse.json(
      { error: "Failed to create label" },
      { status: 500 }
    );
  }
}
