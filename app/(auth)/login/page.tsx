"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Store } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSignIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.ok) {
      router.push("/");
    } else {
      setIsLoading(false);
      setError("Invalid email or password");
    }
  }

  async function onSignUp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const code = formData.get("code") as string;

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, code }),
      });

      const data = await response.json();

      if (response.ok) {
        // Auto sign in after successful registration
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (result?.ok) {
          router.push("/");
        } else {
          setError("Registration successful, but login failed. Please try signing in.");
          setIsLoading(false);
        }
      } else {
        setError(data.error || "Failed to create account");
        setIsLoading(false);
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 bg-zinc-900 rounded-xl flex items-center justify-center shadow-sm">
              <Store className="h-6 w-6 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 mb-2">
            Dashboard Store Management
          </h1>
          <p className="text-zinc-500">
            Manage your stores and track performance
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-8">
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Create Account</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={onSignIn}>
                <div className="grid gap-4">
                  {error && (
                    <div className="rounded-md bg-red-50 p-3 text-sm text-red-500 border border-red-100">
                      {error}
                    </div>
                  )}
                  <div className="grid gap-2">
                    <label htmlFor="signin-email" className="text-sm font-medium text-zinc-700">
                      Email
                    </label>
                    <input
                      id="signin-email"
                      name="email"
                      placeholder="name@example.com"
                      type="email"
                      autoCapitalize="none"
                      autoComplete="email"
                      autoCorrect="off"
                      disabled={isLoading}
                      required
                      className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="signin-password" className="text-sm font-medium text-zinc-700">
                      Password
                    </label>
                    <input
                      id="signin-password"
                      name="password"
                      placeholder="••••••••"
                      type="password"
                      autoCapitalize="none"
                      autoComplete="current-password"
                      disabled={isLoading}
                      required
                      className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                  <button
                    disabled={isLoading}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-zinc-900 text-white hover:bg-zinc-900/90 h-10 px-4 py-2"
                  >
                    {isLoading && (
                      <svg
                        className="mr-2 h-4 w-4 animate-spin"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    )}
                    Sign In
                  </button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={onSignUp}>
                <div className="grid gap-4">
                  {error && (
                    <div className="rounded-md bg-red-50 p-3 text-sm text-red-500 border border-red-100">
                      {error}
                    </div>
                  )}
                  <div className="grid gap-2">
                    <label htmlFor="signup-name" className="text-sm font-medium text-zinc-700">
                      Full Name
                    </label>
                    <input
                      id="signup-name"
                      name="name"
                      placeholder="John Doe"
                      type="text"
                      autoCapitalize="words"
                      autoComplete="name"
                      disabled={isLoading}
                      required
                      className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="signup-email" className="text-sm font-medium text-zinc-700">
                      Email
                    </label>
                    <input
                      id="signup-email"
                      name="email"
                      placeholder="name@example.com"
                      type="email"
                      autoCapitalize="none"
                      autoComplete="email"
                      autoCorrect="off"
                      disabled={isLoading}
                      required
                      className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="signup-password" className="text-sm font-medium text-zinc-700">
                      Password
                    </label>
                    <input
                      id="signup-password"
                      name="password"
                      placeholder="••••••••"
                      type="password"
                      autoComplete="new-password"
                      disabled={isLoading}
                      required
                      minLength={6}
                      className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    <p className="text-xs text-zinc-500">
                      Must be at least 6 characters
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="signup-code" className="text-sm font-medium text-zinc-700">
                      Registration Code
                    </label>
                    <input
                      id="signup-code"
                      name="code"
                      placeholder="Enter code"
                      type="text"
                      autoCapitalize="none"
                      autoComplete="off"
                      disabled={isLoading}
                      required
                      className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                  <button
                    disabled={isLoading}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-zinc-900 text-white hover:bg-zinc-900/90 h-10 px-4 py-2"
                  >
                    {isLoading && (
                      <svg
                        className="mr-2 h-4 w-4 animate-spin"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    )}
                    Create Account
                  </button>
                </div>
              </form>
            </TabsContent>
          </Tabs>

          <p className="mt-6 text-center text-xs text-zinc-500">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 p-4 bg-white border border-zinc-200 rounded-lg shadow-sm">
          <p className="text-xs text-zinc-900 font-semibold mb-2">Demo Credentials:</p>
          <p className="text-xs text-zinc-500">Admin: admin@example.com / password</p>
          <p className="text-xs text-zinc-500">Store Owner: owner@example.com / password</p>
          <p className="text-xs text-zinc-500 mt-1">Registration Code: superman</p>
        </div>
      </div>
    </div>
  );
}
