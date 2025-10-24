"use client";
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectValue, SelectItem } from "@/components/ui/select";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";
import { motion } from "framer-motion";


const orderSchema = z.object({
  clientName: z.string().min(1),
  deliveryAddress: z.string().min(1),
  selectedProducts: z.array(z.string()).min(1),
  quantities: z.record(z.string(), z.number().min(1)),
  paymentStatus: z.enum(["Paid", "Pending", "Refunded"]),
  deliveryStatus: z.enum(["Pending", "Shipped", "Delivered", "Canceled"]),
  expectedDelivery: z.string().min(1),
});

export default function OrderCreatePage() {
  const [products, setProducts] = useState([]);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = JSON.parse(localStorage.getItem("products") || "[]");
      setProducts(stored);
    }
  }, []);

  const { control, handleSubmit, watch } = useForm({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      clientName: "",
      deliveryAddress: "",
      selectedProducts: [],
      quantities: {},
      paymentStatus: "",
      deliveryStatus: "",
      expectedDelivery: "",
    },
  });

  const selectedProducts = watch("selectedProducts");
  const quantities = watch("quantities");

  const calculateTotal = () =>
    selectedProducts.reduce((sum, id) => {
      const product = products.find((p) => String(p.id) === id);
      const qty = quantities[id] || 0;
      return sum + (product?.price || 0) * qty;
    }, 0);

  const onSubmit = (data) => {
    const existingOrders = JSON.parse(localStorage.getItem("orders") || "[]");
    const newOrder = {
      id: `ORD-${Date.now()}`,
      clientName: data.clientName,
      deliveryAddress: data.deliveryAddress,
      selectedProducts: data.selectedProducts,
      quantities: data.quantities,
      paymentStatus: data.paymentStatus,
      deliveryStatus: data.deliveryStatus,
      expectedDelivery: data.expectedDelivery,
      totalAmount: calculateTotal(),
      createdAt: new Date().toISOString(),
    };
    existingOrders.push(newOrder);
    localStorage.setItem("orders", JSON.stringify(existingOrders));
    toast.success("Order created successfully!");
    router.push("/dashboard/orders");
  };

  return (
    <div className="p-4 flex justify-center">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-3xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Create Order</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Client Name</Label>
              <Controller name="clientName" control={control} render={({ field }) => <Input {...field} />} />
            </div>
            <div>
              <Label>Delivery Address</Label>
              <Controller name="deliveryAddress" control={control} render={({ field }) => <Textarea {...field} />} />
            </div>
            <div>
              <Label>Products</Label>
              <Controller
                name="selectedProducts"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={(value) => field.onChange([value])} value={field.value[0] || ""}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a Product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((p) => (
                        <SelectItem key={p.id} value={String(p.id)}>
                          {p.productName?.toUpperCase()} - {p.price} BDT
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            {selectedProducts.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold">Quantities</h3>
                {selectedProducts.map((id) => (
                  <div key={id} className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <Controller
                      name={`quantities.${id}`}
                      control={control}
                      defaultValue={0}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="number"
                          min={0}
                          value={field.value || 0}
                          onChange={(e) => field.onChange(Math.max(0, Number(e.target.value)))}
                          className="w-full sm:w-24"
                        />
                      )}
                    />
                  </div>
                ))}
              </div>
            )}
            <div>
              <Label>Payment Status</Label>
              <Controller
                name="paymentStatus"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Payment Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Paid">Paid</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div>
              <Label>Delivery Status</Label>
              <Controller
                name="deliveryStatus"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Delivery Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Shipped">Shipped</SelectItem>
                      <SelectItem value="Delivered">Delivered</SelectItem>
                      <SelectItem value="Canceled">Canceled</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div>
              <Label>Expected Delivery Date</Label>
              <Controller name="expectedDelivery" control={control} render={({ field }) => <Input type="date" {...field} />} />
            </div>
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p>Total Products: {selectedProducts.length}</p>
                <p>Total Amount: {calculateTotal()} BDT</p>
                <div>
                  {selectedProducts.map((id) => {
                    const product = products.find((p) => String(p.id) === id);
                    const qty = quantities[id] || 0;
                    return (
                      <div key={id} className="flex justify-between text-sm">
                        <span>{product?.productName?.toUpperCase()}</span>
                        <span>{qty} x {product?.price} = {qty * product?.price} BDT</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
             <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }} className="w-full">
                    <Button type="submit" className="w-full bg-black dark:text-white hover:bg-gray-900 transition-all flex items-center justify-center gap-2 py-2 shadow-md cursor-pointer">
                      <CheckCircle className="w-5 h-5"/>
                      Update
                    </Button>
                  </motion.div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
