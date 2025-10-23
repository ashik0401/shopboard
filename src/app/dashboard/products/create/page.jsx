"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "react-hot-toast";
import { Upload, CheckCircle, X } from "lucide-react";
import Image from "next/image";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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

export default function ProductCreatePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [preview, setPreview] = useState(null);

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

  const addProductMutation = useMutation({
    mutationFn: async (data) => {
      let imageUrl = "";
      if (data.image) imageUrl = await uploadToImgbb(data.image);
      const stored = JSON.parse(localStorage.getItem("products") || "[]");
      const newProduct = { ...data, image: imageUrl, id: Date.now() };
      stored.push(newProduct);
      localStorage.setItem("products", JSON.stringify(stored));
      return newProduct;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product created successfully!");
      router.push("/dashboard/products");
    },
    onError: (err) => toast.error(err.message),
  });

  const onSubmit = (data) => addProductMutation.mutate(data);

  return (
    <div className="max-w-3xl mx-auto mt-10 space-y-6 relative">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 cursor-pointer text-red-500"
        onClick={() => router.push("/dashboard/products")}
      >
        <X />
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>Basic Info</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="productName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter product name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="sku" render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter SKU" {...field} onChange={(e) => field.onChange(e.target.value.toUpperCase())} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="category" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {["Electronics", "Furniture", "Clothing"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="price" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="Enter price" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="stock" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter quantity" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="active" render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <FormLabel>Active Status</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter product description" className="resize-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="image" render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Image</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-4">
                      <label className="cursor-pointer flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-md border border-gray-300 hover:bg-gray-200">
                        <Upload className="w-4 h-4" />
                        <span>Upload Image</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                          const file = e.target.files[0];
                          field.onChange(file);
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => setPreview(reader.result);
                            reader.readAsDataURL(file);
                          }
                        }} />
                      </label>
                      {preview && <Image src={preview} alt="Preview" className="w-16 h-16 object-cover rounded-md border" width={64} height={64} />}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <Button type="submit" className="w-full flex items-center gap-2 cursor-pointer">
                <CheckCircle className="w-4 h-4" />
                Add Product
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
