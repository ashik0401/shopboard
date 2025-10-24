"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Eye, EyeOff, UploadCloud } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import GoogleButton from "@/app/components/GoogleButton";

import { registerUser, loginWithGoogle } from "@/redux/authSlice";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*])/,
      "Password must include uppercase, lowercase, number, and special character"
    ),
});

export default function RegisterPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const [showPass, setShowPass] = useState(false);
  const [imageUrl, setImageUrl] = useState("/user.jpg");
  const { loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch({ type: "auth/clearError" });
  }, [dispatch]);

  const uploadImage = async (file) => {
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch(
        `https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMGBB_KEY}`,
        { method: "POST", body: formData }
      );
      const data = await res.json();
      setImageUrl(data.data.display_url);
      toast.success("Image uploaded!");
    } catch {
      toast.error("Image upload failed!");
    }
  };

  const onSubmit = async (data) => {
    if (!imageUrl) {
      toast.error("Please upload a profile image first");
      return;
    }
    try {
      await dispatch(registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        photoURL: imageUrl,
      })).unwrap();
      toast.success("Registration successful!");
      router.push("/");
    } catch (err) {
      toast.error(err);
    }
  };

  const handleGoogleRegister = async () => {
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
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-semibold">Register</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 overflow-hidden relative flex-shrink-0">
                <Image
                  src={imageUrl}
                  alt="Profile"
                  width={80}
                  height={80}
                  className="object-cover rounded-full"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-gray-500">
                <UploadCloud size={28} /> Upload
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => uploadImage(e.target.files[0])}
                />
              </label>
            </div>

            <div>
              <label>Name</label>
              <Input placeholder="Enter your name" {...register("name")} />
              {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
            </div>

            <div>
              <label>Email</label>
              <Input type="email" placeholder="Enter your email" {...register("email")} />
              {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
            </div>

            <div className="relative">
              <label>Password</label>
              <Input
                type={showPass ? "text" : "password"}
                placeholder="Enter your password"
                {...register("password")}
              />
              <div onClick={() => setShowPass(!showPass)} className="absolute right-3 top-8 cursor-pointer">
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </div>
              {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
            </div>

            <Button type="submit" className="w-full mt-4 cursor-pointer" disabled={loading}>
              Register
            </Button>

            <div className="flex items-center gap-3 my-3">
              <span className="flex-1 h-px bg-gray-300 dark:bg-gray-600"></span>
              <span className="text-gray-500 dark:text-gray-400 font-medium">OR</span>
              <span className="flex-1 h-px bg-gray-300 dark:bg-gray-600"></span>
            </div>

            <GoogleButton text="Register with Google" onClick={handleGoogleRegister} />

            <div className="text-center text-gray-600 dark:text-gray-400 mt-4">
              <a href="/auth/login">
                Already have an account? <span className="font-bold hover:underline text-black dark:text-white">Login</span>
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
