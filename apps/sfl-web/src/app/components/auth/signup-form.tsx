"use client";
import { useState } from "react";
import Link from "next/link";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { createClient } from "@/utils/supabase/client";
import toast from "react-hot-toast";
import type { AuthError } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

export function SignupForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Create Supabase client
      const supabase = createClient();

      // First, sign up the user
      const { error, data } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.first_name,
            last_name: formData.last_name,
            username: formData.username,
          },
        }
      });

      if (error) throw error;

      await supabase.from('profiles').insert({
        id: data.user?.id,
        first_name: formData.first_name,
        last_name: formData.last_name,
        username: formData.username,
      });
    } catch (error: unknown) {
      const authError = error as AuthError;
      toast.error(authError.message || "Failed to create account");
      console.error("Signup error:", authError);
    } finally {
      setIsLoading(false);
      toast.success('Account created successfully. Checking your email for verification...');
      router.push('/login');
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });

      if (error) throw error;
    } catch (error: unknown) {
      const authError = error as AuthError;
      toast.error(authError.message || "Failed to sign in with Google");
      console.error("Google sign in error:", authError);
      setIsLoading(false);
    }
  };

  const handleGithubSignIn = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
      });

      if (error) throw error;
    } catch (error: unknown) {
      const authError = error as AuthError;
      toast.error(authError.message || "Failed to sign in with GitHub");
      console.error("GitHub sign in error:", authError);
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="first_name">First name</Label>
          <Input
            id="first_name"
            placeholder="John"
            autoCapitalize="words"
            autoCorrect="off"
            disabled={isLoading}
            required
            value={formData.first_name}
            onChange={handleChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="last_name">Last name</Label>
          <Input
            id="last_name"
            placeholder="Doe"
            autoCapitalize="words"
            autoCorrect="off"
            disabled={isLoading}
            required
            value={formData.last_name}
            onChange={handleChange}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          placeholder="johndoe"
          autoCapitalize="none"
          autoCorrect="off"
          disabled={isLoading}
          required
          value={formData.username}
          onChange={handleChange}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          placeholder="name@example.com"
          type="email"
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect="off"
          disabled={isLoading}
          required
          value={formData.email}
          onChange={handleChange}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          placeholder="••••••••"
          type="password"
          autoCapitalize="none"
          autoComplete="new-password"
          autoCorrect="off"
          disabled={isLoading}
          required
          value={formData.password}
          onChange={handleChange}
        />
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="terms" required />
        <Label htmlFor="terms" className="text-sm">
          I agree to the{" "}
          <Link
            href="/terms"
            className="font-medium text-primary hover:underline"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="font-medium text-primary hover:underline"
          >
            Privacy Policy
          </Link>
        </Label>
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Creating account..." : "Create account"}
      </Button>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
        <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-muted"></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Button
          variant="outline"
          type="button"
          disabled={isLoading}
          onClick={handleGoogleSignIn}
        >
          Google
        </Button>
        <Button
          variant="outline"
          type="button"
          disabled={isLoading}
          onClick={handleGithubSignIn}
        >
          GitHub
        </Button>
      </div>
    </form>
  );
} 