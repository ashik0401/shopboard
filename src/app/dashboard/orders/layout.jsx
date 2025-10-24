"use client";
import { useSelector } from "react-redux";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function OrderLayout({ children }) {
  const user = useSelector((state) => state.auth.user);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!user) router.replace(`/auth/login?redirect=${pathname}`);
  }, [user, pathname, router]);

  if (!user) return null;

  return children;
}
