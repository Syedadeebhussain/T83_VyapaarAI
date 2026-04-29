import { useGetDashboardStats, useGetRecentChats } from "@workspace/api-client-react";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  IndianRupee, 
  MessageCircle, 
  ShoppingCart, 
  TrendingUp, 
  Users, 
  Clock,
  ArrowUpRight
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats({
    query: {
      queryKey: ["/api/dashboard/stats"],
      refetchInterval: 30000 // Refetch every 30 seconds
    }
  });

  const { data: recentChats, isLoading: chatsLoading } = useGetRecentChats({
    query: {
      queryKey: ["/api/chats/recent"],
      refetchInterval: 30000
    }
  });

  const StatCard = ({ title, value, subValue, icon: Icon, loading }: any) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="w-4 h-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-[120px]" />
            <Skeleton className="h-4 w-[80px]" />
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              {subValue && (
                <>
                  <ArrowUpRight className="h-3 w-3 mr-1 text-green-500" />
                  <span className="text-green-500 font-medium mr-1">{subValue}</span>
                  today
                </>
              )}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your business performance.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href="/chats">View Messages</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={stats ? formatCurrency(stats.totalRevenue) : "$0"}
          subValue={stats ? formatCurrency(stats.revenueToday) : null}
          icon={IndianRupee}
          loading={statsLoading}
        />
        <StatCard
          title="Total Orders"
          value={stats?.totalOrders.toLocaleString()}
          subValue={stats?.ordersToday.toString()}
          icon={ShoppingCart}
          loading={statsLoading}
        />
        <StatCard
          title="Messages"
          value={stats?.totalMessages.toLocaleString()}
          subValue={stats?.messagesToday.toString()}
          icon={MessageCircle}
          loading={statsLoading}
        />
        <StatCard
          title="Active Customers"
          value={stats?.activeCustomers.toLocaleString()}
          subValue={`${stats?.conversionRate}% conv.`}
          icon={Users}
          loading={statsLoading}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {chatsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-[150px]" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentChats?.recentMessages && recentChats.recentMessages.length > 0 ? (
              <div className="space-y-6">
                {recentChats.recentMessages.slice(0, 5).map((msg) => (
                  <div key={msg.id} className="flex items-start gap-4">
                    <div className="bg-primary/10 p-2 rounded-full mt-0.5">
                      {msg.direction === "inbound" ? (
                        <MessageCircle className="h-4 w-4 text-primary" />
                      ) : (
                        <Bot className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium leading-none">
                          {msg.customerName || msg.customerPhone}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(msg.createdAt), 'h:mm a')}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {msg.content}
                      </p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline" className="text-[10px] h-4 px-1">
                          {msg.intent}
                        </Badge>
                        <Badge variant="secondary" className="text-[10px] h-4 px-1">
                          {msg.language}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="mx-auto h-8 w-8 mb-3 opacity-50" />
                <p>No recent messages.</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Business Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">Pending Orders</p>
                  <p className="text-xs text-muted-foreground">Require attention</p>
                </div>
              </div>
              <div className="font-bold text-xl">{statsLoading ? <Skeleton className="h-6 w-8" /> : stats?.pendingOrders || 0}</div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                  <IndianRupee className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">Avg Order Value</p>
                  <p className="text-xs text-muted-foreground">Across all orders</p>
                </div>
              </div>
              <div className="font-bold text-xl">{statsLoading ? <Skeleton className="h-6 w-16" /> : formatCurrency(stats?.avgOrderValue || 0)}</div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                  <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">Conversion Rate</p>
                  <p className="text-xs text-muted-foreground">Messages to orders</p>
                </div>
              </div>
              <div className="font-bold text-xl">{statsLoading ? <Skeleton className="h-6 w-12" /> : `${stats?.conversionRate || 0}%`}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
