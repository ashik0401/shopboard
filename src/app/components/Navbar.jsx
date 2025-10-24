"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, LogOut } from "lucide-react";
import DarkModeToggle from "./DarkModeToggle";
import { Button } from "@/components/ui/button";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "@/redux/authSlice";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "../../../firebase.init";

export default function Navbar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const auth = getAuth(app);

  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, () => {
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, [auth]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const handleLinkClick = () => setSidebarOpen(false);
  const toggleProfile = () => setProfileOpen(!profileOpen);

  const handleLogout = () => {
    dispatch(logoutUser())
      .unwrap()
      .then(() => {
        toast.success("Logged out successfully!");
        router.push("/");
      })
      .catch((err) => toast.error(err));
  };

  return (
    <>
      <nav className="fixed top-0 left-0 w-full shadow-sm dark:bg-black/30 bg-gray-100/30 z-50">
        <div className="flex justify-between items-center px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-md transition cursor-pointer"
            >
              {sidebarOpen ? <X size={25} /> : <Menu size={25} />}
            </button>
            <Link href='/' className="text-lg font-semibold ">
              <span className="font-bold">Shop</span>
              <span className="text-red-500 font-bold">Board</span>
            </Link>
          </div>

          <div className="flex gap-2 items-center relative">
            <DarkModeToggle />

            {authLoading ? (
              <div className="w-24 h-10 bg-gray-300 dark:bg-gray-700 rounded-full animate-pulse"></div>
            ) : !user ? (
              <Link href='/auth/login'>
                <Button className="cursor-pointer">Login</Button>
              </Link>
            ) : (
              <div className="relative">
                <button
                  onClick={toggleProfile}
                  className="w-10 h-10 rounded-full overflow-hidden border border-gray-300 dark:border-gray-700 cursor-pointer"
                >
                  <Image
                    width={150}
                    height={150}
                    src={user.photoURL || "/default-avatar.png"}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-black shadow-lg rounded-md p-4 z-50">
                    <div className=" items-center gap-2">
                     <div className="flex items-center justify-center mb-5" >
                       <Image
                         width={150}
                         height={150}
                         src={user.photoURL || "/user.jpg"}
                         alt="Profile"
                         className=" w-16 h-16 rounded-full object-cover"
                       />
                     </div>
                      <p className="font-semibold ">{user.displayName || "User"}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      <Button
                        onClick={handleLogout}
                        variant="destructive"
                        className="mt-2 flex items-center gap-2 justify-center w-full cursor-pointer"
                      >
                        <LogOut size={16} /> Logout
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      <div
        className={`fixed top-0 left-0 h-full w-64 dark:bg-black/80 bg-white/80 shadow-lg transform mt-16 transition-transform duration-300 z-40 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <ul className="flex flex-col mt-4">
          <li>
            <Link
              href="/dashboard/products"
              onClick={handleLinkClick}
              className={`block px-6 py-3 hover:bg-gray-300 transition ${
                pathname === "/dashboard/products" ? "font-semibold " : ""
              }`}
            >
              Products
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/orders"
              onClick={handleLinkClick}
              className={`block px-6 py-3 hover:bg-gray-300 transition ${
                pathname === "/dashboard/orders" ? "font-semibold " : ""
              }`}
            >
              Orders
            </Link>
          </li>
        </ul>
      </div>

      {sidebarOpen && <div onClick={toggleSidebar} className="fixed inset-0"></div>}
      <div className="pt-16"></div>
    </>
  );
}
