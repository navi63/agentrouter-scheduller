"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Lock, ArrowRight, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await authClient.signIn.email(
        {
          email,
          password,
          callbackURL: "/dashboard",
          rememberMe,
        },
        {
          onRequest: () => {
            // Loading state is already handled
          },
          onSuccess: (ctx) => {
            toast.success("Successfully signed in!");
            router.push("/dashboard");
          },
          onError: (ctx) => {
            toast.error(ctx.error.message || "Failed to sign in");
          },
        }
      );

      if (error) {
        toast.error(error.message || "Failed to sign in");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    try {
      await authClient.signIn.social({
        provider: "github",
        callbackURL: "/dashboard",
      });
    } catch (error) {
      toast.error("Failed to sign in with GitHub");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-slate-400">Sign in to access your dashboard</p>
        </div>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-2xl">Sign In</CardTitle>
            <CardDescription className="text-slate-400">
              Choose your preferred sign-in method
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* GitHub OAuth Button */}
            <Button
              variant="outline"
              className="w-full h-11 gap-2 border-slate-600 hover:bg-slate-700 hover:text-white text-slate-300"
              onClick={handleGithubLogin}
              disabled={isLoading}
            >
              <span className="font-bold text-lg">GH</span>
              Continue with GitHub
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-800/50 px-2 text-slate-500">Or continue with email</span>
              </div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
                  <input type="checkbox" className="rounded border-slate-700 bg-slate-900/50" />
                  Remember me
                </label>
                <Link href="/forgot-password" className="text-indigo-400 hover:text-indigo-300">
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-indigo-600 hover:bg-indigo-700"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-slate-700">
            <p className="text-sm text-slate-400">
              Don't have an account?{" "}
              <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-medium">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Card>

        <Link
          href="/"
          className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-slate-400 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
      </div>
    </div>
  );
}
