"use client";

import { useState, useEffect } from "react";
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
import { Edit, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const MotionButton = (props) => (
  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
    <Button {...props} />
  </motion.div>
);

const orderSchema = z.object({
  clientName: z.string().min(1),
  deliveryAddress: z.string().min(1),
  selectedProducts: z.array(z.string()).min(1),
  quantities: z.record(z.string(), z.number().min(1)),
  paymentStatus: z.enum(["Paid", "Pending", "Refunded"]),
  deliveryStatus: z.enum(["Pending", "Shipped", "Delivered", "Canceled"]),
  expectedDelivery: z.string().min(1),
});

export default function OrderListPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingOrder, setEditingOrder] = useState(null);
  const [products, setProducts] = useState([]);
  const pageSize = 8;
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedOrders = JSON.parse(localStorage.getItem("orders") || "[]");
      const storedProducts = JSON.parse(localStorage.getItem("products") || "[]");
      setOrders(Array.isArray(storedOrders) ? storedOrders.reverse() : []);
      setProducts(Array.isArray(storedProducts) ? storedProducts : []);
    }
    setTimeout(() => setLoading(false), 500);
  }, []);

  const deleteOrder = (id) => {
    const filteredOrders = orders.filter((o) => o.id !== id);
    localStorage.setItem("orders", JSON.stringify(filteredOrders));
    setOrders(filteredOrders);
    toast.success("Order deleted");
  };

  const openEditModal = (order) => setEditingOrder(order);
  const closeEditModal = () => setEditingOrder(null);

  const { control, handleSubmit, watch, reset, getValues } = useForm({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      clientName: "",
      deliveryAddress: "",
      selectedProducts: [],
      quantities: {},
      paymentStatus: "Pending",
      deliveryStatus: "Pending",
      expectedDelivery: new Date().toISOString().split("T")[0],
    },
  });

  useEffect(() => {
    if (editingOrder) {
      const normalizedSelected =
        Array.isArray(editingOrder.selectedProducts) ? editingOrder.selectedProducts.map((s) => String(s)) : [];
      const normalizedQuantities = {};
      if (editingOrder.quantities && typeof editingOrder.quantities === "object") {
        Object.entries(editingOrder.quantities).forEach(([k, v]) => {
          const key = String(k);
          const val = Number(v) || 1;
          normalizedQuantities[key] = Math.max(1, val);
        });
      }
      reset({
        clientName: editingOrder.clientName || "",
        deliveryAddress: editingOrder.deliveryAddress || "",
        selectedProducts: normalizedSelected.length ? normalizedSelected : [],
        quantities: Object.keys(normalizedQuantities).length ? normalizedQuantities : {},
        paymentStatus: editingOrder.paymentStatus || "Pending",
        deliveryStatus: editingOrder.deliveryStatus || "Pending",
        expectedDelivery: editingOrder.expectedDelivery || new Date().toISOString().split("T")[0],
      });
    }
  }, [editingOrder, reset]);

  const selectedProducts = watch("selectedProducts") || [];
  const quantities = watch("quantities") || {};

  const calculateTotal = (vals = null) => {
    const v = vals || getValues();
    const sel = v.selectedProducts || [];
    const qtys = v.quantities || {};
    return sel.reduce((sum, id) => {
      const product = products.find((p) => String(p.id) === String(id));
      const qty = Number(qtys[id] || 0);
      return sum + (product?.price || 0) * qty;
    }, 0);
  };

  const saveEdit = (data) => {
    const normalizedQuantities = {};
    Object.entries(data.quantities || {}).forEach(([k, v]) => {
      normalizedQuantities[String(k)] = Number(v) || 1;
      if (normalizedQuantities[String(k)] < 1) normalizedQuantities[String(k)] = 1;
    });

    const total = calculateTotal({ ...data, quantities: normalizedQuantities });

    const updatedOrders = orders.map((o) =>
      o.id === editingOrder.id ? { ...o, ...data, quantities: normalizedQuantities, totalAmount: total } : o
    );
    localStorage.setItem("orders", JSON.stringify(updatedOrders));
    setOrders(updatedOrders);
    toast.success("Order updated");
    closeEditModal();
  };

  const paginatedOrders = orders.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const totalPages = Math.ceil(orders.length / pageSize);

  const getStatusBadge = (status, type) => {
    let color = "";
    if (type === "payment") {
      color =
        status === "Paid"
          ? "bg-green-100 text-green-700"
          : status === "Pending"
          ? "bg-yellow-100 text-yellow-700"
          : "bg-red-100 text-red-700";
    } else {
      color =
        status === "Delivered"
          ? "bg-green-100 text-green-700"
          : status === "Processing"
          ? "bg-blue-100 text-blue-700"
          : "bg-gray-100 text-gray-700";
    }
    return <span className={`px-2 py-1 rounded ${color}`}>{status}</span>;
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Orders List</h2>
        <MotionButton className="cursor-pointer" onClick={() => router.push("/dashboard/orders/create")}>
          Create Order
        </MotionButton>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 dark:bg-black ">
              <thead className="bg-gray-100 dark:bg-gray-900 ">
                <tr>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700 dark:text-white whitespace-nowrap">ID</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700 dark:text-white whitespace-nowrap">Client</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700 dark:text-white whitespace-nowrap">Payment</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700 dark:text-white whitespace-nowrap">Delivery</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700 dark:text-white whitespace-nowrap">Total</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700 dark:text-white whitespace-nowrap">Created</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700 dark:text-white whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array(pageSize)
                      .fill(0)
                      .map((_, idx) => (
                        <tr key={idx}>
                          {Array(7)
                            .fill(0)
                            .map((__, i) => (
                              <td key={i} className="p-3">
                                <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                              </td>
                            ))}
                        </tr>
                      ))
                  : paginatedOrders.length === 0
                  ? (
                    <tr>
                      <td colSpan={7} className="p-4 text-center">
                        No orders found.
                      </td>
                    </tr>
                  )
                  : paginatedOrders.map((order) => (
                      <tr key={order.id} className="border-b ">
                        <td className="p-3 text-sm text-gray-800  dark:text-white whitespace-nowrap">{order.id}</td>
                        <td className="p-3 text-sm text-gray-800  dark:text-white whitespace-nowrap">{order.clientName}</td>
                        <td className="p-3 text-sm text-gray-800  dark:text-white whitespace-nowrap">{getStatusBadge(order.paymentStatus, "payment")}</td>
                        <td className="p-3 text-sm text-gray-800  dark:text-white whitespace-nowrap">{getStatusBadge(order.deliveryStatus, "delivery")}</td>
                        <td className="p-3 text-sm text-gray-800  dark:text-white whitespace-nowrap">{order.totalAmount} BDT</td>
                        <td className="p-3 text-sm text-gray-800  dark:text-white whitespace-nowrap">{new Date(order.createdAt).toLocaleString()}</td>
                        <td className="p-3 text-sm text-gray-800  dark:text-white whitespace-nowrap">
                          <div className="flex gap-2">
                            <MotionButton className="cursor-pointer" size="icon" variant="outline" onClick={() => openEditModal(order)}>
                              <Edit className="w-4 h-4" />
                            </MotionButton>
                            <MotionButton className="cursor-pointer" size="icon" variant="destructive" onClick={() => deleteOrder(order.id)}>
                              <Trash className="w-4 h-4" />
                            </MotionButton>
                          </div>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-center items-center gap-2 mt-4">
            <MotionButton disabled={currentPage === 1} onClick={() => setCurrentPage((prev) => prev - 1)}>
              Previous
            </MotionButton>
            <span>Page {currentPage} of {totalPages || 1}</span>
            <MotionButton disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage((prev) => prev + 1)}>
              Next
            </MotionButton>
          </div>
        </CardContent>
      </Card>

      {editingOrder && (
        <div className="fixed inset-0  bg-black/50 dark:bg-black/80 flex items-center justify-center z-50 p-4 overflow-auto">
          <div className="bg-white dark:bg-black rounded-lg w-full max-w-3xl p-6 space-y-4">
            <h3 className="text-lg font-semibold">Edit Order #{editingOrder.id}</h3>
            <form onSubmit={handleSubmit(saveEdit)} className="space-y-4">
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
                    <Select
                      value={field.value?.[0] ?? ""}
                      onValueChange={(value) => {
                        if (!value) field.onChange([]);
                        else field.onChange([value]);
                      }}
                    >
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
                        defaultValue={editingOrder?.quantities?.[id] ? Number(editingOrder.quantities[id]) : 1}
                        render={({ field }) => (
                          <Input
                            {...field}
                            type="number"
                            min={1}
                            value={field.value ?? 1}
                            onChange={(e) => field.onChange(Math.max(1, Number(e.target.value)))}
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
                      const qty = Number(quantities[id] || 0);
                      return (
                        <div key={id} className="flex justify-between text-sm">
                          <span>{product?.productName?.toUpperCase()}</span>
                          <span>{qty} x {product?.price} = {qty * (product?.price || 0)} BDT</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-2 mt-4">
                <MotionButton className="cursor-pointer" variant="outline" onClick={closeEditModal}>Cancel</MotionButton>
                <MotionButton className="cursor-pointer" type="submit">Save</MotionButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
