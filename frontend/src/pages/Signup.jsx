import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";

export default function Signup() {
  return (
    <div className="flex w-full h-screen justify-center items-center">
      <div className="flex flex-col gap-6">
        <Card className="overflow-hidden !py-0 !border-none">
          <CardContent className="grid !p-0 md:grid-cols-2">
            <form className="p-20 md:p-30 w-120 sm:w-140">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col items-center text-center">
                  <h1 className="text-2xl font-bold">AttendAI</h1>
                  <p className="text-[#71717A] text-[14px] text-balance">
                    Create your account to get started
                  </p>
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" required />
                </div>

                <Button type="submit" className="w-full !bg-[#9886fe]">
                  Create Account
                </Button>

                <div className="text-center text-sm">
                  Already have an account?{" "}
                  <Link to="/login" className="underline underline-offset-4">
                    Sign in
                  </Link>
                </div>
              </div>
            </form>
            <div className="bg-[#9886fe] relative hidden md:block">
              <img
                src="login.png"
                alt="Image"
                className="absolute inset-0 h-full w-full object-contain"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 