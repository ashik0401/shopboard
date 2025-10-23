"use client";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const handleLinkClick = () => setSidebarOpen(false);

  return (
    <>
      <nav className="fixed top-0 left-0 w-full shadow-sm z-50 ">
        <div className="flex justify-between items-center px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-md transition cursor-pointer"
            >
              {sidebarOpen ?<X size={25} /> : <Menu size={25} />}
            </button>
            <Link
            href='/'
            className="text-lg font-semibold text-white">My Website</Link>
          </div>
          <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-300">
           
          </div>
        </div>
      </nav>

      <div
        className={`fixed top-0 left-0 h-full w-64 bg-gray-700 shadow-lg transform mt-16 transition-transform duration-300 z-40 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <ul className="flex flex-col mt-4">
          <li>
            <Link
              href="/dashboard/products"
              onClick={handleLinkClick}
              className={`block px-6 py-3 hover:bg-gray-800 transition ${
                pathname === "/dashboard/products" ? "font-semibold text-blue-600" : ""
              }`}
            >
              Products
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/orders"
              onClick={handleLinkClick}
              className={`block px-6 py-3 hover:bg-gray-800 transition ${
                pathname === "/dashboard/orders" ? "font-semibold text-blue-600" : ""
              }`}
            >
              Orders
            </Link>
          </li>
        </ul>
      </div>

      {sidebarOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0  "
        ></div>
      )}

      <div className="pt-16"></div>
    </>
  );
}
