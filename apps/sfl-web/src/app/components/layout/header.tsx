"use client";
import Link from "next/link";
import { Music } from "lucide-react";
import { Button } from "../ui/button";
import { MobileNav } from "./mobile-nav";

export function Header() {
  return (
    <header className="sticky top-0 z-50 flex h-16 w-full items-center border-b bg-background px-4 md:px-6">
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-2">
          <MobileNav />
          <Link href="/" className="flex items-center gap-2">
            <Music className="h-6 w-6 text-primary" />
            <span className="font-bold">Snipfluent</span>
          </Link>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/explore" className="text-sm font-medium hover:underline underline-offset-4">
            Explore
          </Link>
          <Link href="/my-snippets" className="text-sm font-medium hover:underline underline-offset-4">
            My Snippets
          </Link>
          <Link href="/create" className="text-sm font-medium hover:underline underline-offset-4">
            Create
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          {/* For signed out users */}
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm">Sign Up</Button>
          </Link>

          {/* For signed in users (comment out one of these sections) */}
          {/* <Link href="/profile">
            <Button variant="ghost" size="icon" className="rounded-full">
              <img 
                src="https://github.com/shadcn.png" 
                alt="Avatar" 
                className="h-8 w-8 rounded-full" 
              />
              <span className="sr-only">Profile</span>
            </Button>
          </Link> */}
        </div>
      </div>
    </header>
  );
} 