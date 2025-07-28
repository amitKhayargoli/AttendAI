import { useForm } from "react-hook-form";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";

export default function Signup() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset,
    watch,
  } = useForm();


  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  console.log(API_BASE_URL);
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState("");

  // Watch the collegeDomain field
  const collegeDomain = watch("collegeDomain", "");
  const generatedEmail = collegeDomain ? `admin@${collegeDomain}.edu.np` : "";

  const onSubmit = async (data) => {
    setServerError("");
    setSuccess("");
    try {
        const res = await fetch(`${API_BASE_URL}/auth/register-admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.fullName,
          email: generatedEmail,
          password: data.password,
          collegeDomain: data.collegeDomain, // <-- Add this line!
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        setServerError(result.error || "Registration failed");
        if (result.details) setServerError(result.details);
        return;
      }
      setSuccess("Admin registered successfully! You can now sign in.");
      reset();
    } catch (err) {
      setServerError("Network error. Please try again.");
    }
  };

  return (
    <div className="flex w-full h-screen justify-center items-center">
      <div className="flex flex-col gap-6">
        <Card className="overflow-hidden !py-0 !border-none">
          <CardContent className="grid !p-0 md:grid-cols-2">
            <form
              className="p-20 md:p-30 w-120 sm:w-140"
              onSubmit={handleSubmit(onSubmit)}
              noValidate
            >
              <div className="flex flex-col gap-6">
                <div className="flex flex-col items-center text-center">
                  <h1 className="text-2xl font-bold">AttendAI</h1>
                  <p className="text-[#71717A] text-[14px] text-balance">
                    Register as an admin to get started
                  </p>
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    {...register("fullName", {
                      required: "Full name is required",
                      minLength: { value: 3, message: "Name too short" },
                    })}
                  />
                  {errors.fullName && (
                    <span className="text-red-500 text-xs">{errors.fullName.message}</span>
                  )}
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="collegeDomain">College Domain</Label>
                  <Input
                    id="collegeDomain"
                    type="text"
                    placeholder="attendai.edu"
                    {...register("collegeDomain", {
                      required: "College domain is required",
                    })}
                  />
                  {errors.collegeDomain && (
                    <span className="text-red-500 text-xs">{errors.collegeDomain.message}</span>
                  )}
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="email">Admin Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={generatedEmail}
                    readOnly
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    {...register("password", {
                      required: "Password is required",
                      minLength: { value: 8, message: "Password must contain at least 8 characters" },
                    })}
                  />
                  {errors.password && (
                    <span className="text-red-500 text-xs">{errors.password.message}</span>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full !bg-[#9886fe]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Registering..." : "Create Admin Account"}
                </Button>
                {serverError && (
                  <div className="text-red-500 text-center text-sm">{serverError}</div>
                )}
                {success && (
                  <div className="text-green-600 text-center text-sm">{success}</div>
                )}
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