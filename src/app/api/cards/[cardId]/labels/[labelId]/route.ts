// src/app/api/cards/[cardId]/labels/[labelId]/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(
  request: Request,
  context: RouteContext<"/api/cards/[cardId]/labels/[labelId]">
) {
  const params = await context.params;
  try {
    // بررسی وجود relation
    const cardLabel = await prisma.cardLabel.findFirst({
      where: {
        cardId: params.cardId,
        labelId: params.labelId,
      },
    });

    if (!cardLabel) {
      return NextResponse.json(
        { error: "Label not found on this card" },
        { status: 404 }
      );
    }

    await prisma.cardLabel.delete({
      where: { id: cardLabel.id },
    });

    return NextResponse.json({
      success: true,
      message: "Label removed from card",
    });
  } catch (error) {
    console.error("Failed to remove label from card:", error);
    return NextResponse.json(
      { error: "Failed to remove label from card" },
      { status: 500 }
    );
  }
}
