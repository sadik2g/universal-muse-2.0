import { Link, useLocation } from "wouter";
import { Home, Trophy, FileText, User, LogOut, CreditCard, Menu, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ASSETS_URL } from "@/var";

export default function DashboardNav() {
  const [location] = useLocation();
  const { model } = useAuth();
  const [open, setOpen] = useState(false);

  const navItems = [
    { path: "/dashboard", icon: Home, label: "Dashboard", exact: true },
    { path: "/dashboard/contests", icon: Trophy, label: "Contests" },
    { path: "/dashboard/mysubmissions", icon: FileText, label: "My Submissions" },
    { path: "/dashboard/buy-votes", icon: CreditCard, label: "Buy Votes" },
    { path: "/dashboard/profileSettings", icon: User, label: "Profile Settings" },
  ];

  const isActive = (path: string, exact = false) =>
    exact ? location === path : location.startsWith(path);

  const handleLogout = () => {
    fetch("/api/auth/logout", { method: "POST", credentials: "include" })
      .then(() => (window.location.href = "/"));
  };

  return (
    <>
      {/* MOBILE MENU BUTTON */}
      <Button
        variant="ghost"
        className="xl:hidden fixed top-4 left-4 z-50"
        onClick={() => setOpen(true)}
      >
        <Menu className="w-6 h-6" />
      </Button>

      {/* BACKDROP */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 xl:hidden z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed xl:static inset-y-0 left-0 z-50 bg-white border-r border-gray-200
          w-64 p-6 flex flex-col h-full transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full xl:translate-x-0"}
        `}
      >
       
        {/* HEADER */}
        <div className="mb-8 flex items-center gap-3">
         <img
        src={`${ASSETS_URL}${model?.profileImage}`}
        className="w-12 h-12 rounded-full object-cover"
      />
          <div>
            <h3 className="font-semibold text-gray-900">{model?.name}</h3>
            <p className="text-sm text-gray-500">{model?.stageName}</p>
          </div>

          {/* MOBILE CLOSE BUTTON */}
          <button
            className="xl:hidden ml-auto text-gray-600"
            onClick={() => setOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* NAVIGATION */}
        <nav className="space-y-2 mb-8">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link href={item.path} key={item.path}>
                <div
                  className={`flex items-center space-x-3 px-4 py-2 rounded-md cursor-pointer transition-colors
                    ${isActive(item.path, item.exact)
                      ? "bg-purple-600 text-white"
                      : "text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                    }
                  `}
                  onClick={() => setOpen(false)}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* STATS CARD */}
        <Card className="p-4 mb-6 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-100">
          <div className="space-y-2">
            <Stat label="Total Votes" value={model?.totalVotes} />
            <Stat label="Contests Won" value={model?.contestsWon} />
            <Stat label="Active Contests" value={model?.contestsJoined} />
          </div>
        </Card>

        {/* LOGOUT BUTTON */}
        <Button
          variant="outline"
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 justify-start hover:text-red-600 hover:bg-red-50"
        >
          <LogOut size={20} />
          <span>Sign Out</span>
        </Button>
      </aside>
    </>
  );
}

function Stat({ label, value }: { label: string; value?: number }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="font-semibold text-purple-600">{value ?? 0}</span>
    </div>
  );
}
