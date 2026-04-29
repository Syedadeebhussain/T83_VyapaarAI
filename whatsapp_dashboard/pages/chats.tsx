import { useState, useRef, useEffect } from "react";
import { useListChats, useGetChatMessages, useSendMessage } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Search, Send, User, Bot, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const INTENT_COLORS: Record<string, string> = {
  greeting: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  order: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  query: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  complaint: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  payment: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  spam: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  unknown: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300"
};

const LANG_COLORS: Record<string, string> = {
  english: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300",
  hindi: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  urdu: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
  unknown: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
};

export default function ChatsPage() {
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const { data: chatList, isLoading: chatsLoading } = useListChats(
    { search, limit: 50 },
    { query: { queryKey: ["/api/chats", search], refetchInterval: 10000 } }
  );

  const { data: messages, isLoading: messagesLoading } = useGetChatMessages(
    selectedPhone || "",
    { limit: 100 },
    { 
      query: { 
        enabled: !!selectedPhone, 
        queryKey: ["/api/chats", selectedPhone], 
        refetchInterval: 5000 
      } 
    }
  );

  const sendMessageMutation = useSendMessage();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !selectedPhone) return;

    sendMessageMutation.mutate(
      { data: { customerPhone: selectedPhone, message } },
      {
        onSuccess: () => {
          setMessage("");
        },
        onError: (error) => {
          toast({
            title: "Failed to send message",
            description: error.data?.message || "Please try again.",
            variant: "destructive"
          });
        }
      }
    );
  };

  const selectedChat = chatList?.chats.find(c => c.customerPhone === selectedPhone);

  return (
    <div className="flex h-[calc(100vh-4rem)] md:h-screen">
      {/* Sidebar - Chat List */}
      <div className={`${selectedPhone ? 'hidden md:flex' : 'flex'} w-full md:w-80 lg:w-96 flex-col border-r bg-card`}>
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search conversations..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <ScrollArea className="flex-1">
          {chatsLoading ? (
            <div className="p-4 flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : chatList?.chats.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No conversations found.
            </div>
          ) : (
            <div className="divide-y">
              {chatList?.chats.map((chat) => (
                <div
                  key={chat.customerPhone}
                  className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${selectedPhone === chat.customerPhone ? 'bg-muted' : ''}`}
                  onClick={() => setSelectedPhone(chat.customerPhone)}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold truncate pr-2">
                      {chat.customerName || chat.customerPhone}
                    </span>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {format(new Date(chat.lastMessageAt), 'MMM d')}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                    {chat.lastMessage}
                  </p>
                  <div className="flex gap-2">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${INTENT_COLORS[chat.intent] || INTENT_COLORS.unknown}`}>
                      {chat.intent}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${LANG_COLORS[chat.language] || LANG_COLORS.unknown}`}>
                      {chat.language}
                    </span>
                    {chat.unreadCount > 0 && (
                      <span className="ml-auto bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-full">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Main Content - Chat Thread */}
      <div className={`${!selectedPhone ? 'hidden md:flex md:flex-1 items-center justify-center bg-muted/20' : 'flex-1 flex flex-col bg-muted/10'}`}>
        {!selectedPhone ? (
          <div className="text-center text-muted-foreground">
            <Bot className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>Select a conversation to start messaging</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="h-16 border-b bg-card flex items-center px-4 justify-between sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="md:hidden mr-1"
                  onClick={() => setSelectedPhone(null)}
                >
                  <User className="h-5 w-5" />
                </Button>
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{selectedChat?.customerName || selectedPhone}</h3>
                  <p className="text-xs text-muted-foreground">{selectedPhone}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Create Order</Button>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              {messagesLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-4 flex flex-col pb-4">
                  {messages?.slice().reverse().map((msg) => (
                    <div 
                      key={msg.id} 
                      className={`flex flex-col max-w-[80%] ${msg.direction === 'outbound' ? 'self-end items-end' : 'self-start items-start'}`}
                    >
                      <div 
                        className={`px-4 py-2 rounded-2xl ${
                          msg.direction === 'outbound' 
                            ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                            : 'bg-card border rounded-tl-sm'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-muted-foreground">
                          {format(new Date(msg.createdAt), 'h:mm a')}
                        </span>
                        {msg.direction === 'inbound' && (
                          <>
                            <span className={`text-[9px] px-1 rounded-sm ${INTENT_COLORS[msg.intent] || INTENT_COLORS.unknown}`}>
                              {msg.intent}
                            </span>
                            <span className={`text-[9px] px-1 rounded-sm ${LANG_COLORS[msg.language] || LANG_COLORS.unknown}`}>
                              {msg.language}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 bg-card border-t">
              <form onSubmit={handleSend} className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="flex-1"
                  autoFocus
                />
                <Button type="submit" size="icon" disabled={!message.trim() || sendMessageMutation.isPending}>
                  {sendMessageMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
