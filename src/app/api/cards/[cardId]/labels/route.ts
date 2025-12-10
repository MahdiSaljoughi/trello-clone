// src/app/api/cards/[cardId]/labels/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  contex: RouteContext<"/api/cards/[cardId]/labels">
) {
  const params = await contex.params;
  try {
    const cardLabels = await prisma.cardLabel.findMany({
      where: { cardId: params.cardId },
      include: {
        label: true,
      },
    });
    return NextResponse.json(cardLabels);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch card labels" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  contex: RouteContext<"/api/cards/[cardId]/labels">
) {
  const params = await contex.params;
  try {
    const body = await request.json();
    const { labelId } = body;

    if (!labelId) {
      return NextResponse.json(
        { error: "Label ID is required" },
        { status: 400 }
      );
    }

    const cardLabel = await prisma.cardLabel.create({
      data: {
        cardId: params.cardId,
        labelId,
      },
      include: {
        label: true,
      },
    });

    return NextResponse.json(cardLabel, { status: 201 });
  } catch (error) {
    console.error("Failed to add label to card:", error);
    return NextResponse.json(
      { error: "Failed to add label to card" },
      { status: 500 }
    );
  }
}
