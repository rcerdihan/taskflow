import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    const { title, columnId, order } = body;

    if (!title || !columnId) {
      return new NextResponse("Missing title or columnId", { status: 400 });
    }

    const task = await prisma.task.create({
      data: {
        title,
        columnId,
        order: order || 0,
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error("[TASKS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
