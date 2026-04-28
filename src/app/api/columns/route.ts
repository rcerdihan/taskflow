import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    const { title, boardId, order } = body;

    if (!title || !boardId) {
      return new NextResponse("Missing title or boardId", { status: 400 });
    }

    const column = await prisma.column.create({
      data: {
        title,
        boardId,
        order: order || 0,
      },
      include: {
        tasks: true,
      }
    });

    return NextResponse.json(column);
  } catch (error) {
    console.error("[COLUMNS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
