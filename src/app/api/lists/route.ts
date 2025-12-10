// src/app/api/lists/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const lists = await prisma.list.findMany({
      include: {
        board: {
          select: {
            id: true,
            title: true,
          },
        },
        cards: {
          include: {
            cardItems: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
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
