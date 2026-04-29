
import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useGetMe } from "@workspace/api-client-react";
import { 
  LayoutDashboard, 
  MessageCircle, 
  ShoppingCart, 
  CreditCard, 
  BarChart3, 
  Bot, 
  Settings,
  LogOut,
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/chats", label: "Chats", icon: MessageCircle },
  { href: "/orders", label: "Orders", icon: ShoppingCart },
  { href: "/payments", label: "Payments", icon: CreditCard },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/chatbot", label: "Chatbot", icon: Bot },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { token, logout } = useAuth();
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();

  // Redirect to login if no token
  useEffect(() => {
    if (!token && location !== "/login" && location !== "/register") {
      window.location.href = "/login";
    }
  }, [token, location]);

  const { data: user, isLoading } = useGetMe({ 
    query: { 
      enabled: !!token, 
      queryKey: ["/api/auth/me"],
      retry: false
    } 
  });

  if (!token) {
    return <>{children}</>;
  }

  const NavLinks = () => (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
        const Icon = item.icon;
        return (
          <Link key={item.href} href={item.href}>
            <span className={`flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-pointer transition-colors ${
              isActive 
                ? "bg-primary/10 text-primary" 
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}>
              <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 flex-col fixed inset-y-0">
        <div className="flex flex-col flex-grow border-r bg-card pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4 mb-6">
            <Bot className="h-8 w-8 text-primary" />
            <span className="ml-2 text-xl font-bold tracking-tight">BizBot</span>
          </div>
          <div className="mt-5 flex-grow flex flex-col px-3">
            <NavLinks />
          </div>
          <div className="px-4 mt-auto border-t pt-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium truncate">
                {isLoading ? "Loading..." : user?.businessName || user?.email}
              </span>
              <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </div>
            <Button variant="outline" className="w-full justify-start" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-card border-b flex items-center px-4 z-10">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="-ml-2">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] p-0 flex flex-col">
            <div className="flex items-center px-4 h-16 border-b">
              <Bot className="h-6 w-6 text-primary" />
              <span className="ml-2 text-lg font-bold">BizBot</span>
            </div>
            <div className="p-3 flex-grow">
              <NavLinks />
            </div>
            <div className="p-4 border-t flex items-center justify-between">
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </div>
          </SheetContent>
        </Sheet>
        <span className="ml-4 text-lg font-bold">BizBot</span>
      </div>

      {/* Main content */}
      <div className="flex-1 md:pl-64 flex flex-col pt-16 md:pt-0 h-full overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-muted/20">
          {children}
        </main>
      </div>
    </div>
  );
}
