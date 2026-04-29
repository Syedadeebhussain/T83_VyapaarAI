import { useState, useEffect } from "react";
import { 
  useGetChatbotConfig, 
  useUpdateChatbotConfig, 
  useListChatbotResponses,
  useCreateChatbotResponse,
  useDeleteChatbotResponse,
  getGetChatbotConfigQueryKey,
  getListChatbotResponsesQueryKey
} from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const configSchema = z.object({
  isEnabled: z.boolean(),
  greetingMessage: z.string().min(1, "Greeting is required"),
  fallbackMessage: z.string().min(1, "Fallback is required"),
  spamFilterEnabled: z.boolean(),
});

type ConfigFormValues = z.infer<typeof configSchema>;

const responseSchema = z.object({
  trigger: z.string().min(1, "Trigger is required"),
  intent: z.enum(["greeting", "order", "query", "complaint", "payment", "spam", "unknown"]),
  responseText: z.string().min(1, "Response text is required"),
  language: z.enum(["hindi", "english", "urdu", "all"]),
  isActive: z.boolean().default(true)
});

type ResponseFormValues = z.infer<typeof responseSchema>;

export default function ChatbotPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: config, isLoading: configLoading } = useGetChatbotConfig({
    query: { queryKey: ["/api/chatbot/config"] }
  });

  const { data: responses, isLoading: responsesLoading } = useListChatbotResponses({
    query: { queryKey: ["/api/chatbot/responses"] }
  });

  const updateConfigMutation = useUpdateChatbotConfig();
  const createResponseMutation = useCreateChatbotResponse();
  const deleteResponseMutation = useDeleteChatbotResponse();

  const configForm = useForm<ConfigFormValues>({
    resolver: zodResolver(configSchema),
    defaultValues: {
      isEnabled: true,
      greetingMessage: "",
      fallbackMessage: "",
      spamFilterEnabled: true,
    }
  });

  const responseForm = useForm<ResponseFormValues>({
    resolver: zodResolver(responseSchema),
    defaultValues: {
      trigger: "",
      intent: "query",
      responseText: "",
      language: "all",
      isActive: true
    }
  });

  useEffect(() => {
    if (config) {
      configForm.reset({
        isEnabled: config.isEnabled,
        greetingMessage: config.greetingMessage,
        fallbackMessage: config.fallbackMessage,
        spamFilterEnabled: config.spamFilterEnabled,
      });
    }
  }, [config, configForm]);

  const onConfigSubmit = (data: ConfigFormValues) => {
    updateConfigMutation.mutate(
      { data },
      {
        onSuccess: () => {
          toast({ title: "Configuration saved" });
          queryClient.invalidateQueries({ queryKey: getGetChatbotConfigQueryKey() });
        },
        onError: () => {
          toast({ title: "Failed to save configuration", variant: "destructive" });
        }
      }
    );
  };

  const onResponseSubmit = (data: ResponseFormValues) => {
    createResponseMutation.mutate(
      { data },
      {
        onSuccess: () => {
          toast({ title: "Custom response added" });
          queryClient.invalidateQueries({ queryKey: getListChatbotResponsesQueryKey() });
          setOpen(false);
          responseForm.reset();
        },
        onError: () => {
          toast({ title: "Failed to add response", variant: "destructive" });
        }
      }
    );
  };

  const handleDeleteResponse = (id: number) => {
    deleteResponseMutation.mutate(
      { id },
      {
        onSuccess: () => {
          toast({ title: "Response deleted" });
          queryClient.invalidateQueries({ queryKey: getListChatbotResponsesQueryKey() });
        }
      }
    );
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Chatbot Config</h1>
        <p className="text-muted-foreground">Manage your AI automated responses.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Core behavior of your WhatsApp bot</CardDescription>
          </CardHeader>
          <CardContent>
            {configLoading ? (
              <div className="flex justify-center p-4"><Loader2 className="animate-spin h-6 w-6" /></div>
            ) : (
              <Form {...configForm}>
                <form onSubmit={configForm.handleSubmit(onConfigSubmit)} className="space-y-6">
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <Label className="text-base">Enable Bot</Label>
                      <p className="text-sm text-muted-foreground">Automatically respond to incoming messages.</p>
                    </div>
                    <FormField
                      control={configForm.control}
                      name="isEnabled"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={configForm.control}
                    name="greetingMessage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Greeting Message</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Welcome to our store! How can we help?" 
                            className="resize-none" 
                            rows={3}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={configForm.control}
                    name="fallbackMessage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fallback Message</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="I couldn't understand that. Let me connect you to a human." 
                            className="resize-none" 
                            rows={3}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end">
                    <Button type="submit" disabled={updateConfigMutation.isPending}>
                      {updateConfigMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save Changes
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle>Custom Responses</CardTitle>
              <CardDescription>Train the AI to answer specific queries</CardDescription>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Response
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Custom Response</DialogTitle>
                  <DialogDescription>Define what the bot should say for specific intents.</DialogDescription>
                </DialogHeader>
                <Form {...responseForm}>
                  <form onSubmit={responseForm.handleSubmit(onResponseSubmit)} className="space-y-4">
                    <FormField
                      control={responseForm.control}
                      name="trigger"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Trigger / Topic *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. store timing, delivery area" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={responseForm.control}
                        name="intent"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Detected Intent</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select intent" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="query">Query</SelectItem>
                                <SelectItem value="order">Order</SelectItem>
                                <SelectItem value="complaint">Complaint</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={responseForm.control}
                        name="language"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Language</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select language" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="all">All / Default</SelectItem>
                                <SelectItem value="english">English</SelectItem>
                                <SelectItem value="hindi">Hindi</SelectItem>
                                <SelectItem value="urdu">Urdu</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={responseForm.control}
                      name="responseText"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bot Response *</FormLabel>
                          <FormControl>
                            <Textarea placeholder="What should the bot reply..." className="resize-none" rows={4} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end gap-2 pt-2">
                      <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                      <Button type="submit" disabled={createResponseMutation.isPending}>
                        {createResponseMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Add
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {responsesLoading ? (
              <div className="flex justify-center p-4"><Loader2 className="animate-spin h-6 w-6" /></div>
            ) : responses && responses.length > 0 ? (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Trigger</TableHead>
                      <TableHead>Intent</TableHead>
                      <TableHead>Language</TableHead>
                      <TableHead className="w-1/2">Response</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {responses.map((resp) => (
                      <TableRow key={resp.id}>
                        <TableCell className="font-medium">{resp.trigger}</TableCell>
                        <TableCell><Badge variant="outline">{resp.intent}</Badge></TableCell>
                        <TableCell><Badge variant="secondary">{resp.language}</Badge></TableCell>
                        <TableCell className="max-w-xs truncate" title={resp.responseText}>{resp.responseText}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDeleteResponse(resp.id)}
                            disabled={deleteResponseMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground border rounded-md border-dashed">
                No custom responses configured.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
