"use client";

import { useSession, signOut } from "next-auth/react";
import { LayoutDashboard, LogOut, User as UserIcon } from "lucide-react";
import Link from "next/link";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="sticky top-0 z-50 w-full glass border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <LayoutDashboard size={18} className="text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
              TaskFlow
            </span>
          </div>

          <div className="flex items-center gap-4">
            {session ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <UserIcon size={16} />
                  <span>{session.user?.email}</span>
                </div>
                <button
                  onClick={() => signOut()}
                  className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                  title="Sign Out"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
