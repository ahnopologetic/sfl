"use client";
import Link from "next/link";
import { Music, User } from "lucide-react";
import { Button } from "../ui/button";
import { MobileNav } from "./mobile-nav";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export function Header() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();
  }, []);

  return (
    <header className="sticky top-0 z-50 flex h-16 w-full items-center border-b bg-background px-4 md:px-6">
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-2">
          <MobileNav user={user} />
          <Link href="/new" className="flex items-center justify-center gap-2 mx-auto">
            <Music className="h-6 w-6 text-primary" />
            <span className="font-bold">Snipfluent</span>
          </Link>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/explore" className="text-sm font-medium hover:underline underline-offset-4">
            Explore
          </Link>
          {user && (
            <>
              <Link href="/my-snippets" className="text-sm font-medium hover:underline underline-offset-4">
                My Snippets
              </Link>
              <Link href="/create" className="text-sm font-medium hover:underline underline-offset-4">
                Create
              </Link>
            </>
          )}
        </nav>
        <div className="flex items-center gap-2">
          {!loading && (
            <>
              {!user ? (
                <>
                  <Link href="/auth/login">
                    <Button variant="ghost" size="sm">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button size="sm">Sign Up</Button>
                  </Link>
                </>
              ) : (
                <Link href="/profile">
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <User className="h-5 w-5" />
                    <span className="sr-only">Profile</span>
                  </Button>
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
} 