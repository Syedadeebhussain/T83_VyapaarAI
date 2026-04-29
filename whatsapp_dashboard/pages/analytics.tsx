
import { useState } from "react";
import { useGetDashboardStats, useGetRevenueChart, useGetTopProducts, useGetCustomerInsights, useGetIntentBreakdown } from "@workspace/api-client-react";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

const COLORS = ['#f97316', '#0ea5e9', '#8b5cf6', '#10b981', '#f43f5e', '#8b5cf6'];
const INTENT_COLORS: Record<string, string> = {
  greeting: '#3b82f6', // blue
  order: '#22c55e',    // green
  query: '#eab308',    // yellow
  complaint: '#ef4444',// red
  payment: '#a855f7',  // purple
  spam: '#9ca3af',     // gray
  unknown: '#6b7280'   // dark gray
};

const LANG_COLORS: Record<string, string> = {
  english: '#0ea5e9',
  hindi: '#f97316',
  urdu: '#10b981',
  unknown: '#9ca3af'
};

export default function AnalyticsPage() {
  const [days, setDays] = useState("30");

  const { data: revenueData, isLoading: revenueLoading } = useGetRevenueChart(
    { days: parseInt(days) },
    { query: { queryKey: ["/api/analytics/revenue", days] } }
  );

  const { data: topProducts, isLoading: productsLoading } = useGetTopProducts(
    { limit: 5 },
    { query: { queryKey: ["/api/analytics/products"] } }
  );

  const { data: customerInsights, isLoading: customersLoading } = useGetCustomerInsights({
    query: { queryKey: ["/api/analytics/customers"] }
  });

  const { data: intentBreakdown, isLoading: intentLoading } = useGetIntentBreakdown({
    query: { queryKey: ["/api/analytics/intents"] }
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">Deep dive into your business metrics.</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={days} onValueChange={setDays}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Revenue Chart */}
        <Card className="col-span-full lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue & Orders</CardTitle>
            <CardDescription>Daily performance over the selected timeframe</CardDescription>
          </CardHeader>
          <CardContent>
            {revenueLoading ? (
              <Skeleton className="w-full h-[300px]" />
            ) : revenueData && revenueData.length > 0 ? (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(val) => format(new Date(val), 'MMM d')}
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val) => `₹${val/1000}k`}
                    />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
                      formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                      labelFormatter={(label) => format(new Date(label), 'MMM d, yyyy')}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No revenue data available for this period.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
            <CardDescription>Best selling items by revenue</CardDescription>
          </CardHeader>
          <CardContent>
            {productsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : topProducts && topProducts.length > 0 ? (
              <div className="space-y-4">
                {topProducts.map((product, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs">
                        #{i + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium leading-none">{product.productName}</p>
                        <p className="text-xs text-muted-foreground mt-1">{product.totalQuantity} units sold</p>
                      </div>
                    </div>
                    <div className="font-medium text-sm">
                      {formatCurrency(product.totalRevenue)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
                No product sales data available.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Customer Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Insights</CardTitle>
            <CardDescription>Demographics and engagement</CardDescription>
          </CardHeader>
          <CardContent>
            {customersLoading ? (
              <Skeleton className="w-full h-[250px]" />
            ) : customerInsights ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground">Total Customers</p>
                    <p className="text-xl font-bold">{customerInsights.totalCustomers}</p>
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground">New This Month</p>
                    <p className="text-xl font-bold">{customerInsights.newCustomersThisMonth}</p>
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground">Returning Rate</p>
                    <p className="text-xl font-bold">
                      {Math.round((customerInsights.returningCustomers / customerInsights.totalCustomers) * 100 || 0)}%
                    </p>
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground">Avg Messages</p>
                    <p className="text-xl font-bold">{customerInsights.avgMessagesPerCustomer.toFixed(1)}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-3">Language Preference</p>
                  <div className="h-[140px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={customerInsights.topLanguages}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={60}
                          paddingAngle={2}
                          dataKey="count"
                          nameKey="language"
                        >
                          {customerInsights.topLanguages.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={LANG_COLORS[entry.language.toLowerCase()] || COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* Intent Breakdown */}
        <Card className="col-span-full md:col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>AI Intent Detection</CardTitle>
            <CardDescription>What customers are messaging you about</CardDescription>
          </CardHeader>
          <CardContent>
            {intentLoading ? (
              <Skeleton className="w-full h-[250px]" />
            ) : intentBreakdown && intentBreakdown.length > 0 ? (
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={intentBreakdown} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" />
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="intent" 
                      type="category" 
                      axisLine={false} 
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                      width={80}
                      style={{ textTransform: 'capitalize' }}
                    />
                    <RechartsTooltip 
                      cursor={{ fill: 'hsl(var(--muted))' }}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
                      formatter={(value: number, name: string, props: any) => [
                        `${value} msgs (${props.payload.percentage.toFixed(1)}%)`, 
                        'Volume'
                      ]}
                    />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                      {intentBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={INTENT_COLORS[entry.intent.toLowerCase()] || COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
                No intent data available yet. Connect WhatsApp and receive messages to see analytics.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
