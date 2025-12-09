import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard,
  Trophy,
  Eye,
  BarChart3,
  Flag,
  Settings,
  LogOut,
  Menu,
  X,
  Gift,
  Crown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const adminNavItems = [
  {
    href: "/admin",
    icon: LayoutDashboard,
    label: "Dashboard"
  },
  {
    href: "/admin/contests",
    icon: Trophy,
    label: "Contests"
  },
  {
    href: "/admin/moderate",
    icon: Eye,
    label: "Moderate"
  },
  {
    href: "/admin/analytics",
    icon: BarChart3,
    label: "Analytics"
  },
  {
    href: "/admin/complaints",
    icon: Flag,
    label: "Complaints"
  },
  {
    href: "/admin/prize-requests",
    icon: Gift,
    label: "Prize Requests"
  },
  {
    href: "/admin/winners",
    icon: Crown,
    label: "Winners"
  },
  {
    href: "/admin/settings",
    icon: Settings,
    label: "Settings"
  },
];

export default function AdminNav() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const logoutMutation = useMutation({
    mutationFn: () => apiRequest("/api/auth/logout", { method: "POST" }),
    onSuccess: () => {
      queryClient.clear();
      window.location.href = "/";
      toast({
        title: "Logged out successfully",
        description: "You have been signed out of the admin panel.",
      });
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        className="fixed top-4 left-4 z-50 xl:hidden"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 xl:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
     <aside
  className={`
    fixed inset-y-0 left-0 z-40 bg-white shadow-lg border-r border-gray-200 
    transition-transform duration-300
    w-64 xl:w-80
    overflow-y-auto
    xl:translate-x-0
    ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full xl:translate-x-0'}
  `}
>

        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <LayoutDashboard className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Admin Panel</h2>
                <p className="text-sm text-gray-500">Contest Management</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
  {adminNavItems.map((item) => {
    const active =
      location === item.href ||
      (item.href !== "/admin" && location.startsWith(item.href));

    return (
      <Link key={item.href} href={item.href}>
        <a
          onClick={() => setIsMobileMenuOpen(false)}
          className={`
            flex items-center gap-3 p-3 rounded-lg transition-colors cursor-pointer
            ${active
              ? "bg-blue-50 text-blue-700 border border-blue-200"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }
          `}
        >
          <item.icon className="h-5 w-5" />
          <span className="font-medium">{item.label}</span>
        </a>
      </Link>
    );
  })}
</nav>



          {/* Logout Button */}
          <div className="p-4 border-t border-gray-200">
            <Button
              variant="ghost"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              className="w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            >
              <LogOut className="h-5 w-5 mr-3" />
              {logoutMutation.isPending ? "Signing out..." : "Sign Out"}
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}