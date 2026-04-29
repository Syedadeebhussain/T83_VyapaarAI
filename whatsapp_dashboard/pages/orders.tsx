import { useState } from "react";
import { useListOrders, useCreateOrder, getListOrdersQueryKey } from "@workspace/api-client-react";
import { formatCurrency } from "@/lib/utils";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { Search, Plus, Loader2, Package } from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const STATUS_COLORS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "secondary",
  confirmed: "default",
  paid: "default",
  shipped: "default",
  delivered: "default",
  cancelled: "destructive",
};

const PAYMENT_COLORS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  unpaid: "destructive",
  paid: "default",
  refunded: "secondary",
};

const orderSchema = z.object({
  customerPhone: z.string().min(10, "Valid phone number required"),
  customerName: z.string().optional(),
  items: z.array(z.object({
    productName: z.string().min(1, "Product name required"),
    quantity: z.coerce.number().min(1, "Min quantity 1"),
    price: z.coerce.number().min(0, "Min price 0")
  })).min(1, "At least one item required"),
  notes: z.string().optional()
});

type OrderFormValues = z.infer<typeof orderSchema>;

export default function OrdersPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: ordersData, isLoading } = useListOrders(
    { 
      search, 
      status: status !== "all" ? status as any : undefined,
      limit: 50
    },
    { query: { queryKey: ["/api/orders", search, status] } }
  );

  const createOrderMutation = useCreateOrder();

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      customerPhone: "",
      customerName: "",
      items: [{ productName: "", quantity: 1, price: 0 }],
      notes: ""
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items"
  });

  const onSubmit = (data: OrderFormValues) => {
    createOrderMutation.mutate(
      { data },
      {
        onSuccess: () => {
          toast({ title: "Order created successfully" });
          queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
          setOpen(false);
          form.reset();
        },
        onError: (error) => {
          toast({
            title: "Failed to create order",
            description: error.data?.message || "An error occurred",
            variant: "destructive"
          });
        }
      }
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">Manage customer orders and status.</p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Order
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Order</DialogTitle>
              <DialogDescription>Manually create an order for a customer.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="customerPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer Phone *</FormLabel>
                        <FormControl>
                          <Input placeholder="+91..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="customerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">Order Items</h4>
                    <Button type="button" variant="outline" size="sm" onClick={() => append({ productName: "", quantity: 1, price: 0 })}>
                      Add Item
                    </Button>
                  </div>
                  
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex gap-4 items-start">
                      <FormField
                        control={form.control}
                        name={`items.${index}.productName`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input placeholder="Product name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`items.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem className="w-24">
                            <FormControl>
                              <Input type="number" min="1" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`items.${index}.price`}
                        render={({ field }) => (
                          <FormItem className="w-32">
                            <FormControl>
                              <Input type="number" min="0" placeholder="Price" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length === 1}>
                        <Package className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Internal Notes</FormLabel>
                      <FormControl>
                        <Input placeholder="Optional notes..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={createOrderMutation.isPending}>
                    {createOrderMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Order
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center bg-card p-4 rounded-lg border">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by ID, customer name or phone..."
            className="pl-8 w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : ordersData?.orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              ordersData?.orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">#{order.id}</TableCell>
                  <TableCell>{format(new Date(order.createdAt), 'MMM d, yyyy')}</TableCell>
                  <TableCell>
                    <div className="font-medium">{order.customerName || 'Unknown'}</div>
                    <div className="text-xs text-muted-foreground">{order.customerPhone}</div>
                  </TableCell>
                  <TableCell className="font-semibold">{formatCurrency(order.totalAmount)}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_COLORS[order.status] || "default"} className="capitalize">
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={PAYMENT_COLORS[order.paymentStatus] || "default"} className="capitalize">
                      {order.paymentStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">View</Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
