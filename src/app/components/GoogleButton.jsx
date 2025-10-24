"use client";
import { Button } from "@/components/ui/button";
import { SiGoogle } from "react-icons/si";
import { useDispatch } from "react-redux";
import { loginWithGoogle } from "@/redux/authSlice";
import { toast } from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";

export default function GoogleButton({ text = "Continue with Google" }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";

  const handleGoogleLogin = async () => {
    try {
      await dispatch(loginWithGoogle()).unwrap();
      toast.success("Login successful!");
      router.push(redirectTo);
    } catch (err) {
      toast.error(err);
    }
  };

  return (
    <Button
      type="button"
      onClick={handleGoogleLogin}
      variant="outline"
      className="cursor-pointer relative w-full flex items-center justify-center gap-3 rounded-full border border-gray-300 bg-white text-gray-800 font-medium shadow-sm hover:shadow-md transition-all duration-200 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
    >
      <SiGoogle className="text-red-500" size={20} />
      <span>{text}</span>
    </Button>
  );
}
