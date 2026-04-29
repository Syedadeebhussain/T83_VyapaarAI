import { useState } from "react";
import { useListPayments, useCreatePaymentLink, getListPaymentsQueryKey } from "@workspace/api-client-react";
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
import { format } from "date-fns";
import { Link as LinkIcon, Plus, Loader2, Copy, ExternalLink } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const STATUS_COLORS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  created: "secondary",
  paid: "default",
  expired: "destructive",
  cancelled: "destructive",
};

const paymentLinkSchema = z.object({
  orderId: z.coerce.number().min(1, "Order ID is required"),
  amount: z.coerce.number().min(1, "Amount must be greater than 0"),
  customerPhone: z.string().min(10, "Valid phone number required"),
  customerName: z.string().optional(),
  description: z.string().optional()
});

type PaymentLinkValues = z.infer<typeof paymentLinkSchema>;

export default function PaymentsPage() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: paymentsData, isLoading } = useListPayments(
    { limit: 50 },
    { query: { queryKey: ["/api/payments"] } }
  );

  const createPaymentMutation = useCreatePaymentLink();

  const form = useForm<PaymentLinkValues>({
    resolver: zodResolver(paymentLinkSchema),
    defaultValues: {
      orderId: 0,
      amount: 0,
      customerPhone: "",
      customerName: "",
      description: ""
    }
  });

  const onSubmit = (data: PaymentLinkValues) => {
    createPaymentMutation.mutate(
      { data },
      {
        onSuccess: (response) => {
          toast({ 
            title: "Payment link created",
            description: "Link has been generated successfully."
          });
          queryClient.invalidateQueries({ queryKey: getListPaymentsQueryKey() });
          setOpen(false);
          form.reset();
        },
        onError: (error) => {
          toast({
            title: "Failed to create link",
            description: error.data?.message || "An error occurred",
            variant: "destructive"
          });
        }
      }
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
          <p className="text-muted-foreground">Manage Razorpay payment links and transactions.</p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Payment Link
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Payment Link</DialogTitle>
              <DialogDescription>Generate a Razorpay payment link to send to a customer.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="orderId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Order ID *</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount (₹) *</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

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

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input placeholder="Payment for Order #123" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={createPaymentMutation.isPending}>
                    {createPaymentMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Generate Link
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Link ID</TableHead>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
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
            ) : paymentsData?.payments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No payments found.
                </TableCell>
              </TableRow>
            ) : (
              paymentsData?.payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{format(new Date(payment.createdAt), 'MMM d, yyyy')}</TableCell>
                  <TableCell className="font-mono text-xs">{payment.razorpayPaymentLinkId || '-'}</TableCell>
                  <TableCell>#{payment.orderId}</TableCell>
                  <TableCell>{payment.customerPhone}</TableCell>
                  <TableCell className="font-semibold">{formatCurrency(payment.amount)}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_COLORS[payment.status] || "default"} className="capitalize">
                      {payment.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {payment.razorpayPaymentLinkId && (
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => copyToClipboard(`https://rzp.io/i/${payment.razorpayPaymentLinkId}`)}
                          title="Copy Link"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
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
