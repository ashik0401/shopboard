"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import GoogleButton from "@/app/components/GoogleButton";
import { loginUser, loginWithGoogle } from "../../../redux/authslice";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export default function LoginPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const [showPass, setShowPass] = useState(false);
  const { loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch({ type: "auth/clearError" });
  }, [dispatch]);

  const onSubmit = async (data) => {
    try {
      await dispatch(loginUser({ email: data.email, password: data.password })).unwrap();
      toast.success("Login successful!");
      router.push("/");
    } catch (err) {
      toast.error(err);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await dispatch(loginWithGoogle()).unwrap();
      toast.success("Google login successful!");
      router.push("/");
    } catch (err) {
      toast.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-black p-4">
      <Card className="w-full max-w-md shadow-lg border border-gray-200 dark:border-gray-700 rounded-xl">
        <CardHeader className="pb-0">
          <CardTitle className="text-center text-3xl font-bold text-gray-900 dark:text-gray-100">
            Welcome Back
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="flex flex-col gap-1">
              <label className="font-medium text-gray-700 dark:text-gray-300">Email</label>
              <Input
                type="email"
                placeholder="Enter your email"
                className="focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                {...register("email")}
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
            </div>

            <div className="relative flex flex-col gap-1">
              <label className="font-medium text-gray-700 dark:text-gray-300">Password</label>
              <Input
                type={showPass ? "text" : "password"}
                placeholder="Enter your password"
                className="focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                {...register("password")}
              />
              <div
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-10 cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
              </div>
              {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
            </div>

            <Button
              type="submit"
              className="w-full py-2.5 font-medium text-lg cursor-pointer"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>

            <div className="flex items-center gap-3 my-3">
              <span className="flex-1 h-px bg-gray-300 dark:bg-gray-600"></span>
              <span className="text-gray-500 dark:text-gray-400 font-medium">OR</span>
              <span className="flex-1 h-px bg-gray-300 dark:bg-gray-600"></span>
            </div>

            <GoogleButton text="Login with Google" onClick={handleGoogleLogin} />

            <p className="text-center text-gray-600 dark:text-gray-400 mt-4">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/register"
                className="font-bold dark:text-white text-black hover:underline"
              >
                Register
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
