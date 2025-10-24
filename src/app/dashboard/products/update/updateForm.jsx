"use client";
import { useEffect, useState } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { X, Upload, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ProductUpdateForm({ product, form, preview, setPreview, onClose, onSubmit }) {
  const [categories, setCategories] = useState(() => {
    const stored = JSON.parse(localStorage.getItem("products") || "[]");
    return Array.from(new Set(stored.map(p => p.category))).filter(Boolean);
  });

  useEffect(() => {
    if (product) {
      form.reset(product);
      setPreview(product.image || null);
    }
  }, [product, form, setPreview]);

  if (!product) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-gray-200/50 flex items-start sm:items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: -50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: -50 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="w-full max-w-3xl mt-24 mb-24"
        >
          <Card className="relative overflow-visible  shadow-2xl">
            <Button className="absolute top-2 right-2 cursor-pointer text-red-500 hover:scale-110 transition-transform" variant="ghost" onClick={onClose}><X /></Button>
            <CardHeader>
              <CardTitle className="text-2xl text-center font-bold">Update Product</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="productName" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Name</FormLabel>
                        <FormControl>
                          <Input {...field} className="uppercase"/>
                        </FormControl>
                        <FormMessage/>
                      </FormItem>
                    )}/>
                    <FormField control={form.control} name="sku" render={({ field }) => (
                      <FormItem>
                        <FormLabel>SKU</FormLabel>
                        <FormControl>
                          <Input {...field} onChange={(e) => field.onChange(e.target.value.toUpperCase())}/>
                        </FormControl>
                        <FormMessage/>
                      </FormItem>
                    )}/>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="category" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger><SelectValue placeholder="Select category"/></SelectTrigger>
                            <SelectContent>
                              {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage/>
                      </FormItem>
                    )}/>
                    <FormField control={form.control} name="price" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price (BDT)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))}/>
                        </FormControl>
                        <FormMessage/>
                      </FormItem>
                    )}/>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="stock" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stock</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))}/>
                        </FormControl>
                        <FormMessage/>
                      </FormItem>
                    )}/>
                    <FormField control={form.control} name="active" render={({ field }) => (
                      <FormItem className="flex flex-col justify-center">
                        <FormLabel>Status</FormLabel>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange}/>
                        </FormControl>
                        <FormMessage/>
                      </FormItem>
                    )}/>
                  </div>
                  <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea rows={3} {...field}/>
                      </FormControl>
                      <FormMessage/>
                    </FormItem>
                  )}/>
                  <FormField control={form.control} name="image" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image</FormLabel>
                      <FormControl>
                        <div className="flex flex-row items-center gap-4 w-full flex-wrap sm:flex-nowrap">
                          <label className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded cursor-pointer hover:bg-gray-900 hover:scale-105 transition-all">
                            <Upload className="w-5 h-5"/>
                            Upload
                            <input type="file" accept="image/*" className="hidden" onChange={e => {
                              const file = e.target.files?.[0];
                              if(file){setPreview(URL.createObjectURL(file)); field.onChange(file);}
                            }}/>
                          </label>
                          <AnimatePresence>
                            {preview && (
                              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="w-24 h-24 relative rounded overflow-hidden shadow-lg flex-shrink-0">
                                <Image src={preview} fill className="object-cover" alt="Preview"/>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </FormControl>
                      <FormMessage/>
                    </FormItem>
                  )}/>
                  <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }} className="w-full">
                    <Button type="submit" className="w-full bg-black hover:bg-gray-900 transition-all flex items-center justify-center gap-2 py-2 shadow-md cursor-pointer dark:text-white">
                      <CheckCircle className="w-5 h-5"/>
                      Update
                    </Button>
                  </motion.div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
