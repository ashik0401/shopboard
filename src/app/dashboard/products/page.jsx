"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, CheckCircle, X, Edit, Trash } from "lucide-react";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

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
  return stored;
};

export default function ProductListPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [editingProduct, setEditingProduct] = useState(null);
  const [preview, setPreview] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

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
  } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  if (isError) toast.error(error?.message || "Failed to load products");

  const updateMutation = useMutation({
    mutationFn: async (updated) => {
      let imageUrl = updated.image;
      if (updated.image instanceof File) {
        imageUrl = await uploadToImgbb(updated.image);
      }
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

  const openEdit = (product) => {
    setEditingProduct(product);
    form.reset(product);
    setPreview(product.image || null);
  };

  const onSubmit = (data) => {
    const updated = { ...editingProduct, ...data };
    updateMutation.mutate(updated);
  };

  const totalPages = Math.ceil(products.length / itemsPerPage);
  const paginatedProducts = products.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div>
      <div className="flex justify-between items-center m-4">
        <h1 className="text-2xl font-bold text-white">Products</h1>
        <Button
          className="cursor-pointer"
          onClick={() => router.push("/dashboard/products/create")}
        >
          Add Product
        </Button>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200 rounded-md mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && (
        <>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {paginatedProducts.map((product) => (
             <Card key={product.id} className="relative flex flex-col h-full">
  {product.image && (
    <div className="w-full h-48 md:h-60 lg:h-64 overflow-hidden rounded-t-md border-b">
      <Image
        src={product.image}
        alt={product.productName}
        width={600}
        height={400}
        className="object-cover w-full h-full"
      />
    </div>
  )}
  <CardContent className="flex-1 p-6  flex flex-col justify-between ">
    <div>
      <CardTitle className="mb-2 font-bold">{product.productName.toUpperCase()}</CardTitle>
      <p><strong>SKU:</strong> {product.sku}</p>
      <p><strong>Category:</strong> {product.category}</p>
      <p><strong>Price:</strong> {product.price} BDT</p>
      <p><strong>Stock:</strong> {product.stock}</p>
      <p><strong>Status:</strong> {product.active ? "Active" : "Inactive"}</p>
      <p><strong>Description:</strong> {product.description}</p>
    </div>
    <CardFooter className="flex w-full mt-4 gap-0 pb-0">
  <Button className="flex-1 cursor-pointer rounded-r-none" onClick={() => openEdit(product)}>Edit</Button>
  <Button className="flex-1 cursor-pointer rounded-l-none" variant="destructive" onClick={() => deleteMutation.mutate(product.id)}>Delete</Button>
</CardFooter>

  </CardContent>
</Card>

            ))}
          </div>

          <div className="flex justify-center gap-2 mt-4">
            <Button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
            >
              Previous
            </Button>
            <span className="px-3 py-1">
              {currentPage} / {totalPages}
            </span>
            <Button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
            >
              Next
            </Button>
          </div>
        </>
      )}

      {editingProduct && (
        <div className="fixed inset-0 bg-gray-200/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-3xl relative">
            <Button
              className="flex justify-end cursor-pointer text-red-500 w-full"
              variant="ghost"
              onClick={() => {
                setEditingProduct(null);
                setPreview(null);
              }}
            >
              <X />
            </Button>
            <CardHeader className="flex justify-between items-center">
              <CardTitle>Edit Product</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="productName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="sku"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SKU</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              onChange={(e) =>
                                field.onChange(e.target.value.toUpperCase())
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                {["Electronics", "Furniture", "Clothing"].map(
                                  (c) => (
                                    <SelectItem key={c} value={c}>
                                      {c}
                                    </SelectItem>
                                  )
                                )}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="stock"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stock Quantity</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="active"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                          <FormLabel>Active Status</FormLabel>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea {...field} className="resize-none" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Image</FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-4">
                            <label className="cursor-pointer flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-md border hover:bg-gray-200">
                              <Upload className="w-4 h-4" />
                              <span>Upload Image</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files[0];
                                  field.onChange(file);
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () =>
                                      setPreview(reader.result);
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                            </label>
                            {preview && (
                              <Image
                                src={preview}
                                alt="Preview"
                                width={150}
                                height={150}
                                className="w-16 h-16 object-cover rounded-md border"
                              />
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full flex items-center gap-2 cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Update Product
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
