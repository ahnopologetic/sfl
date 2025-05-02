"use client";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "../ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import type { User } from "@supabase/supabase-js";

interface MobileNavProps {
  user: User | null;
}

export function MobileNav({ user }: MobileNavProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Snipfluent</SheetTitle>
        </SheetHeader>
        <nav className="mt-8 flex flex-col gap-4">
          <Link
            href="/explore"
            className="text-sm font-medium hover:text-primary"
          >
            Explore
          </Link>
          {user ? (
            <>
              <Link
                href="/my-snippets"
                className="text-sm font-medium hover:text-primary"
              >
                My Snippets
              </Link>
              <Link
                href="/create"
                className="text-sm font-medium hover:text-primary"
              >
                Create
              </Link>
              <Link
                href="/profile"
                className="text-sm font-medium hover:text-primary"
              >
                Profile
              </Link>
            </>
          ) : (
            <div className="mt-4 flex flex-col gap-2">
              <Link href="/auth/login">
                <Button variant="outline" className="w-full">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="w-full">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
} 