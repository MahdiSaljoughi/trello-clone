import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT /api/lists/[id]
export async function PUT(
  request: Request,
  ctx: RouteContext<"/api/lists/[id]">
) {
  const params = await ctx.params;
  try {
    const { title, order } = await request.json();

    const list = await prisma.list.update({
      where: { id: params.id },
      data: { title, order },
    });

    return NextResponse.json(list);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update list" },
      { status: 500 }
    );
  }
}

// DELETE /api/lists/[id]
export async function DELETE(
  request: Request,
  ctx: RouteContext<"/api/lists/[id]">
) {
  const params = await ctx.params;
  try {
    await prisma.list.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "List deleted" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete list" },
      { status: 500 }
    );
  }
}
