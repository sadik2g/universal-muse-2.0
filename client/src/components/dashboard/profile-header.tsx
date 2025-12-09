import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { LogOut, Settings, User, Crown, Trophy } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { ASSETS_URL } from "@/var";

export default function ProfileHeader() {
  const { model, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("/api/auth/logout", {
        method: "POST",
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.clear();
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out",
      });
      setLocation("/");
    },
    onError: () => {
      toast({
        title: "Logout Failed",
        description: "An error occurred during logout",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center space-x-4">
        <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
        <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  if (!isAuthenticated || !model) {
    return null;
  }

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <motion.div 
      className="flex items-center space-x-4"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Stats quick view */}
      <motion.div 
        className="hidden md:flex items-center space-x-4 text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center space-x-1 text-yellow-600">
          <Trophy size={16} />
          <span className="font-semibold">{model.totalVotes || 0}</span>
          <span className="text-gray-500">votes</span>
        </div>
        
        <div className="flex items-center space-x-1 text-purple-600">
          <Crown size={16} />
          <span className="font-semibold">{model.contestsWon || 0}</span>
          <span className="text-gray-500">wins</span>
        </div>
      </motion.div>

      {/* Profile dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <motion.button
            className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Avatar className="w-10 h-10 border-2 border-purple-200">
              <AvatarImage 
            src={`${ASSETS_URL}${model?.profileImage}`}
                alt={model.name}
                className="object-cover"
              />
              <AvatarFallback className="bg-gradient-to-r from-purple-400 to-pink-400 text-white font-semibold">
                {getInitials(model.name)}
              </AvatarFallback>
            </Avatar>
            
            <div className="text-left">
              <div className="font-semibold text-gray-800">
                {model.stageName || model.name}
              </div>
              <div className="text-sm text-gray-500">
                {model.currentRanking ? `Rank #${model.currentRanking}` : "Unranked"}
              </div>
            </div>
          </motion.button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          <div className="px-3 py-2 border-b">
            <div className="font-semibold">{model.name}</div>
            <div className="text-sm text-gray-500">{model.stageName && `"${model.stageName}"`}</div>
          </div>
          
          <DropdownMenuItem 
            onClick={() => setLocation("/dashboard/profile")}
            className="cursor-pointer"
          >
            <User className="mr-2 h-4 w-4" />
            View Profile
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={() => setLocation("/dashboard/settings")}
            className="cursor-pointer"
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            className="cursor-pointer text-red-600 focus:text-red-600"
          >
            <LogOut className="mr-2 h-4 w-4" />
            {logoutMutation.isPending ? "Logging out..." : "Logout"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.div>
  );
}