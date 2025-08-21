import { Link, useLocation } from "wouter";
import { Home, Trophy, FileText, User, LogOut, CreditCard } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { ASSETS_URL } from "@/var";

export default function DashboardNav() {
  const [location] = useLocation();
  const { model } = useAuth();

  const handleLogout = () => {
    // Make logout request to clear session
    fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    }).then(() => {
      // Reload the page to trigger authentication check
      window.location.href = "/";
    });
  };

  const navItems = [
    {
      path: "/dashboard",
      icon: Home,
      label: "Dashboard",
      exact: true,
    },
    {
      path: "/dashboard/contests",
      icon: Trophy,
      label: "Contests",
    },
    {
      path: "/dashboard/mysubmissions",
      icon: FileText,
      label: "My Submissions",
    },
    {
      path: "/dashboard/buy-votes",
      icon: CreditCard,
      label: "Buy Votes",
    },
    {
      path: "/dashboard/profileSettings",
      icon: User,
      label: "Profile Settings",
    },
  ];

  const isActive = (path: string, exact = false) => {
    if (exact) {
      return location === path;
    }
    return location.startsWith(path);
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-screen p-6">
      {/* Profile Section */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <img
            src={`${ASSETS_URL}${model?.profileImage}`}
            alt={model?.name || "Profile"}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <h3 className="font-semibold text-gray-900">{model?.name}</h3>
            <p className="text-sm text-gray-500">{model?.stageName}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-2 mb-8">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path, item.exact);

          return (
            <Link href={item.path} key={item.path}>
              <motion.div
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full flex items-center justify-start space-x-3 px-4 py-2 rounded-md cursor-pointer transition-colors ${active
                  ? "bg-purple-600 text-white hover:bg-purple-700"
                  : "text-gray-700 hover:text-purple-600 hover:bg-purple-50"
                  }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Stats Card */}
      <Card className="p-4 mb-6 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-100">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Total Votes</span>
            <span className="font-semibold text-purple-600">{model?.totalVotes || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Contests Won</span>
            <span className="font-semibold text-purple-600">{model?.contestsWon || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Active Contests</span>
            <span className="font-semibold text-purple-600">{model?.contestsJoined || 0}</span>
          </div>
        </div>
      </Card>

      {/* Logout Button */}
      <Button
        variant="outline"
        onClick={handleLogout}
        className="w-full justify-start space-x-3 text-gray-700 hover:text-red-600 hover:bg-red-50 border-gray-200"
      >
        <LogOut size={20} />
        <span>Sign Out</span>
      </Button>
    </div>
  );
}