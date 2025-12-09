import { NextResponse } from "next/server";
import { ApiResponse } from "@/types/api-types";

export function successResponse<T>(data: T, message?: string): NextResponse {
  return NextResponse.json({
    success: true,
    data,
    message,
  } as ApiResponse<T>);
}

export function errorResponse(
  message: string,
  status: number = 500
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status }
  );
}

export function validateRequiredFields(
  body: any,
  fields: string[]
): string | null {
  for (const field of fields) {
    if (!body[field] || body[field].trim() === "") {
      return `${field} is required`;
    }
  }
  return null;
}

export function handlePrismaError(error: any): NextResponse {
  console.error("Prisma Error:", error);

  if (error.code === "P2025") {
    return errorResponse("Record not found", 404);
  }

  if (error.code === "P2002") {
    return errorResponse("Duplicate entry", 409);
  }

  return errorResponse("Database error occurred", 500);
}
