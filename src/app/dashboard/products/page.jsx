"use client";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Sparklines, SparklinesLine } from "react-sparklines";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { ChevronDown, Edit, Trash } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import ProductUpdateModal from "./update/updateForm";
import { motion } from "framer-motion";

const MotionButton = (props) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className="inline-block"
  >
    <Button {...props} />
  </motion.div>
);

const formSchema = z.object({
  productName: z.string().min(1),
  sku: z.string().min(1),
  category: z.string().min(1),
  price: z.number().positive(),
  stock: z.number().min(0),
  description: z.string().optional(),
  image: z.any().optional(),
  active: z.boolean().default(true),
});

const uploadToImgbb = async (file) => {
  const formData = new FormData();
  formData.append("image", file);
  const apiKey = process.env.NEXT_PUBLIC_IMGBB_KEY;
  const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
    method: "POST",
    body: formData,
  });
  const data = await res.json();
  if (data.success) return data.data.url;
  throw new Error("Image upload failed");
};

const fetchProducts = async () => {
  const stored = JSON.parse(localStorage.getItem("products") || "[]");
  const updated = stored.map((p) => {
    if (!p.salesTrend)
      p.salesTrend = Array.from({ length: 7 }, () =>
        Math.floor(Math.random() * 100)
      );
    if (!p.satisfaction)
      p.satisfaction = ["😀", "😐", "😡"][Math.floor(Math.random() * 3)];
    if (!p.delivery) p.delivery = Math.floor(Math.random() * 100);
    if (!p.createdAt) p.createdAt = Date.now();
    return p;
  });
  updated.sort((a, b) => b.createdAt - a.createdAt);
  localStorage.setItem("products", JSON.stringify(updated));
  return updated;
};

export default function ProductListPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [editingProduct, setEditingProduct] = useState(null);
  const [preview, setPreview] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [selectedRows, setSelectedRows] = useState([]);
  const [filters, setFilters] = useState({
    category: "all",
    status: "all",
    maxPrice: 10000,
  });
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
  const [showFilter, setShowFilter] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productName: "",
      sku: "",
      category: "",
      price: 0,
      stock: 0,
      description: "",
      image: null,
      active: true,
    },
  });

  const {
    data: products = [],
    isLoading,
    isError,
    error,
  } = useQuery({ queryKey: ["products"], queryFn: fetchProducts });
  if (isError) toast.error(error?.message || "Failed to load products");

  const updateMutation = useMutation({
    mutationFn: async (updated) => {
      let imageUrl = updated.image;
      if (updated.image instanceof File)
        imageUrl = await uploadToImgbb(updated.image);
      const stored = JSON.parse(localStorage.getItem("products") || "[]");
      const index = stored.findIndex((p) => p.id === updated.id);
      stored[index] = { ...updated, image: imageUrl };
      localStorage.setItem("products", JSON.stringify(stored));
      return stored[index];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product updated");
      setEditingProduct(null);
      setPreview(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => {
      const stored = JSON.parse(localStorage.getItem("products") || "[]");
      const updated = stored.filter((p) => p.id !== id);
      localStorage.setItem("products", JSON.stringify(updated));
      return id;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });

  const openEdit = (product) => setEditingProduct(product);
  const onSubmit = (data) =>
    updateMutation.mutate({ ...editingProduct, ...data });
  const handleRowSelect = (id) =>
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  const handleSelectAll = () =>
    setSelectedRows(
      selectedRows.length === paginatedProducts.length
        ? []
        : paginatedProducts.map((p) => p.id)
    );
  const handleSort = (key) =>
    setSortConfig((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" }
    );
  const maxProductPrice = useMemo(
    () =>
      products.length
        ? Math.max(...products.map((p) => Number(p.price)))
        : 10000,
    [products]
  );
  const filteredProducts = useMemo(
    () =>
      products
        .filter((p) =>
          filters.category !== "all" ? p.category === filters.category : true
        )
        .filter((p) =>
          filters.status !== "all"
            ? filters.status === "active"
              ? p.active
              : !p.active
            : true
        )
        .filter((p) => Number(p.price) <= filters.maxPrice),
    [products, filters]
  );
  const sortedProducts = useMemo(() => {
    const base = [...filteredProducts].sort(
      (a, b) => b.createdAt - a.createdAt
    );
    if (!sortConfig.key) return base;
    return [...base].sort((a, b) => {
      const valA = a[sortConfig.key],
        valB = b[sortConfig.key];
      if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
      if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredProducts, sortConfig]);
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const stockColor = (stock) =>
    stock > 50 ? "bg-green-400" : stock < 10 ? "bg-red-500" : "bg-yellow-400";
  const handleBulkDelete = () => {
    selectedRows.forEach((id) => deleteMutation.mutate(id));
    setSelectedRows([]);
  };

  return (
    <div className="p-4">
      <div className="flex sm:flex-row sm:justify-between sm:items-center mb-4 flex-wrap flex-col gap-2">
        <h1 className="text-2xl font-bold ">Products</h1>
        <div className="flex gap-2 flex-wrap">
          <MotionButton
            className="cursor-pointer"
            onClick={() => router.push("/dashboard/products/create")}
          >
            Add Product
          </MotionButton>
          {selectedRows.length > 0 && (
            <MotionButton
              className="cursor-pointer"
              variant="destructive"
              onClick={handleBulkDelete}
            >
              Delete Selected ({selectedRows.length})
            </MotionButton>
          )}
          <div className="relative">
            <MotionButton
              variant="outline"
              className="cursor-pointer"
              onClick={() => setShowFilter(!showFilter)}
            >
              Filter / Sort <ChevronDown className="w-4 h-4" />
            </MotionButton>
            {showFilter && (
              <div className="absolute right-0 mt-2 w-80 bg-white shadow-md rounded-md p-4 z-50 flex flex-col gap-4">
                <Select
                  value={filters.category}
                  onValueChange={(val) =>
                    setFilters((prev) => ({ ...prev, category: val }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {["all", "Electronics", "Furniture", "Clothing"].map(
                      (c) => (
                        <SelectItem key={c} value={c}>
                          {c === "all" ? "All" : c}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
                <Select
                  value={filters.status}
                  onValueChange={(val) =>
                    setFilters((prev) => ({ ...prev, status: val }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {["all", "active", "inactive"].map((s) => (
                      <SelectItem key={s} value={s}>
                        {s === "all"
                          ? "All"
                          : s === "active"
                          ? "Active"
                          : "Inactive"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                  <span className="dark:text-black">0 BDT</span>
                  <input
                    type="range"
                    min={0}
                    max={maxProductPrice}
                    value={filters.maxPrice}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        maxPrice: parseFloat(e.target.value),
                      }))
                    }
                    className="flex-1"
                  />
                  <span className="dark:text-black">{filters.maxPrice} BDT</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <MotionButton
                    size="sm"
                    variant="outline"
                    onClick={() => handleSort("productName")}
                  >
                    Sort Name
                  </MotionButton>
                  <MotionButton
                    size="sm"
                    variant="outline"
                    onClick={() => handleSort("price")}
                  >
                    Sort Price
                  </MotionButton>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="overflow-x-auto ">
        <Table className="min-w-[900px] sm:min-w-full bg-white dark:bg-black text-gray-900 dark:text-white">
          <TableHeader>
            <TableRow>
              <TableHead>
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={
                    selectedRows.length === paginatedProducts.length &&
                    paginatedProducts.length > 0
                  }
                />
              </TableHead>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Satisfaction</TableHead>
              <TableHead>Delivery</TableHead>
              <TableHead>Sales</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: itemsPerPage }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 12 }).map((_, j) => (
                      <td key={j} className="p-2">
                        <div className="h-6 bg-gray-300 animate-pulse rounded" />
                      </td>
                    ))}
                  </tr>
                ))
              : paginatedProducts.map((product) => (
                  <tr key={product.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(product.id)}
                        onChange={() => handleRowSelect(product.id)}
                      />
                    </TableCell>
                    <TableCell>
                      {product.image ? (
                        <div className="w-16 h-16">
                          <Image
                            src={product.image}
                            width={150}
                            height={150}
                            className="w-16 h-16 object-cover rounded-md"
                            alt={product.productName}
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 bg-gray-300 rounded-md animate-pulse" />
                      )}
                    </TableCell>
                    <TableCell>{product.productName.toUpperCase()}</TableCell>
                    <TableCell>{product.sku}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>{product.price}</TableCell>
                    <TableCell>
                      <div
                        className={`${stockColor(
                          product.stock
                        )} w-12 text-center rounded-md`}
                      >
                        {product.stock}
                      </div>
                    </TableCell>
                    <TableCell>{product.active ? "Active" : "Inactive"}</TableCell>
                    <TableCell>{product.satisfaction}</TableCell>
                    <TableCell>{product.delivery}%</TableCell>
                    <TableCell>
                      <Sparklines data={product.salesTrend}>
                        <SparklinesLine color="blue" />
                      </Sparklines>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2 dark:text-white">
                        <MotionButton
                          className="cursor-pointer"
                          size="icon"
                          variant="outline"
                          onClick={() => openEdit(product)}
                        >
                          <Edit className="w-4 h-4" />
                        </MotionButton>
                        <MotionButton
                          className="cursor-pointer"
                          size="icon"
                          variant="destructive"
                          onClick={() => deleteMutation.mutate(product.id)}
                        >
                          <Trash className="w-4 h-4" />
                        </MotionButton>
                      </div>
                    </TableCell>
                  </tr>
                ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-center items-center mt-4 gap-2 flex-wrap">
        <MotionButton
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => prev - 1)}
        >
          Prev
        </MotionButton>
        <span>
          {currentPage} / {totalPages}
        </span>
        <MotionButton
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((prev) => prev + 1)}
        >
          Next
        </MotionButton>
      </div>
      <ProductUpdateModal
        product={editingProduct}
        form={form}
        preview={preview}
        setPreview={setPreview}
        onClose={() => {
          setEditingProduct(null);
          setPreview(null);
        }}
        onSubmit={onSubmit}
      />
    </div>
  );
}
