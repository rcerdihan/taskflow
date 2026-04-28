import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    const { items } = body;

    const transaction = items.map((item: any) => 
      prisma.task.update({
        where: { id: item.id },
        data: {
          order: item.order,
          columnId: item.columnId
        }
      })
    );

    await prisma.$transaction(transaction);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
