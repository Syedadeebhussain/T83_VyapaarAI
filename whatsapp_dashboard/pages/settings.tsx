import { useEffect } from "react";
import { useGetMe, useGetBusiness, useUpdateBusiness, getGetBusinessQueryKey, getGetMeQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Key } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";

const businessSchema = z.object({
  name: z.string().min(2, "Business name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  category: z.string().optional(),
  address: z.string().optional(),
});

type BusinessFormValues = z.infer<typeof businessSchema>;

const metaApiSchema = z.object({
  whatsappPhoneNumberId: z.string().min(1, "Phone Number ID is required"),
  whatsappAccessToken: z.string().min(1, "Access Token is required"),
});

type MetaApiFormValues = z.infer<typeof metaApiSchema>;

export default function SettingsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: user } = useGetMe({
    query: { queryKey: getGetMeQueryKey() }
  });

  const businessId = user?.businessId;

  const { data: business, isLoading: businessLoading } = useGetBusiness(
    businessId || 0,
    { query: { enabled: !!businessId, queryKey: getGetBusinessQueryKey(businessId || 0) } }
  );

  const updateBusinessMutation = useUpdateBusiness();

  const form = useForm<BusinessFormValues>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      name: "",
      phone: "",
      category: "",
      address: "",
    }
  });

  const metaForm = useForm<MetaApiFormValues>({
    resolver: zodResolver(metaApiSchema),
    defaultValues: {
      whatsappPhoneNumberId: "",
      whatsappAccessToken: "",
    }
  });

  useEffect(() => {
    if (business) {
      form.reset({
        name: business.name || "",
        phone: business.phone || "",
        category: business.category || "",
        address: business.address || "",
      });
      metaForm.reset({
        whatsappPhoneNumberId: business.whatsappPhoneNumberId || "",
        whatsappAccessToken: "", // Don't prefill token for security
      });
    }
  }, [business, form, metaForm]);

  const onBusinessSubmit = (data: BusinessFormValues) => {
    if (!businessId) return;
    updateBusinessMutation.mutate(
      { id: businessId, data },
      {
        onSuccess: () => {
          toast({ title: "Profile updated successfully" });
          queryClient.invalidateQueries({ queryKey: getGetBusinessQueryKey(businessId) });
          queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        },
        onError: (error) => {
          toast({ title: "Update failed", description: error.data?.message, variant: "destructive" });
        }
      }
    );
  };

  const onMetaSubmit = (data: MetaApiFormValues) => {
    if (!businessId) return;
    updateBusinessMutation.mutate(
      { id: businessId, data },
      {
        onSuccess: () => {
          toast({ title: "WhatsApp API credentials updated" });
          queryClient.invalidateQueries({ queryKey: getGetBusinessQueryKey(businessId) });
          metaForm.setValue("whatsappAccessToken", ""); // Clear after save
        },
        onError: (error) => {
          toast({ title: "Failed to update credentials", description: error.data?.message, variant: "destructive" });
        }
      }
    );
  };

  if (!businessId) {
    return <div className="p-6">Loading profile...</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your business profile and integrations.</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Business Profile</CardTitle>
            <CardDescription>Your public business information.</CardDescription>
          </CardHeader>
          <CardContent>
            {businessLoading ? (
              <div className="flex justify-center p-4"><Loader2 className="animate-spin h-6 w-6" /></div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onBusinessSubmit)} className="space-y-4 max-w-2xl">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Support Phone</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Category</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Grocery, Coaching, Clinic" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={updateBusinessMutation.isPending}>
                    {updateBusinessMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Profile
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Meta WhatsApp Integration
            </CardTitle>
            <CardDescription>Connect your Meta App to send and receive messages.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...metaForm}>
              <form onSubmit={metaForm.handleSubmit(onMetaSubmit)} className="space-y-4 max-w-2xl">
                <FormField
                  control={metaForm.control}
                  name="whatsappPhoneNumberId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number ID</FormLabel>
                      <FormControl>
                        <Input placeholder="101234567890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={metaForm.control}
                  name="whatsappAccessToken"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Permanent Access Token</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="EAAB..." {...field} />
                      </FormControl>
                      <p className="text-xs text-muted-foreground mt-1">Leave blank if you don't want to change the existing token.</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" variant="secondary" disabled={updateBusinessMutation.isPending}>
                  {updateBusinessMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update Meta Credentials
                </Button>
              </form>
            </Form>

            <Separator className="my-6" />

            <div className="space-y-2">
              <h4 className="font-medium text-sm">Webhook URL</h4>
              <p className="text-sm text-muted-foreground">Configure this URL in your Meta App Dashboard under Webhooks setup.</p>
              <code className="block p-3 bg-muted rounded-md text-xs">
                https://your-domain.com/api/webhook
              </code>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
