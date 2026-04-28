import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

    const { id } = await params;

    await prisma.task.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[TASK_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const { title, description } = body;

    const task = await prisma.task.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error("[TASK_PUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
