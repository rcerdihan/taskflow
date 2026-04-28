import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import KanbanBoard from "@/components/KanbanBoard";
import Navbar from "@/components/Navbar";

export default async function Home() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    redirect("/login");
  }

  const board = await prisma.board.findFirst({
    where: { userId: user.id },
    include: {
      columns: {
        orderBy: { order: "asc" },
        include: {
          tasks: {
            orderBy: { order: "asc" },
          },
        },
      },
    },
  });

  if (!board) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-6 text-white">
           <div className="text-center">
             <h2 className="text-2xl font-bold mb-4">No Board Found</h2>
             <p className="text-gray-400">Please seed the database with the seed script.</p>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Navbar />
      <div className="flex-1 overflow-hidden">
        <KanbanBoard boardId={board.id} initialColumns={board.columns} />
      </div>
    </div>
  );
}
