import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Heart, Crown, Zap, Check } from "lucide-react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface VoteButtonProps {
  contestId: number;
  modelId: number;
  className?: string;
  size?: "sm" | "md" | "lg";
  voteType?: "free" | "power" | "vip";
}

interface VoteEffect {
  id: string;
  x: number;
  y: number;
  type: "free" | "power" | "vip";
}

export default function VoteButton({ 
  contestId, 
  modelId, 
  className = "", 
  size = "md",
  voteType = "free" 
}: VoteButtonProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [effects, setEffects] = useState<VoteEffect[]>([]);

  // Check voting status
  const { data: voteStatus } = useQuery({
    queryKey: ['/api/contests', contestId, 'vote-status'],
    queryFn: async () => {
      const response = await fetch(`/api/contests/${contestId}/vote-status`);
      if (!response.ok) throw new Error('Failed to check vote status');
      return response.json();
    },
  });

  const voteMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("/api/votes", {
        method: "POST",
        body: JSON.stringify({
          contestId,
          modelId,
          voteType,
          voteWeight: voteType === "free" ? 1 : voteType === "power" ? 2 : 5,
        }),
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Vote Cast Successfully!",
        description: `Your ${voteType} vote has been counted.`,
      });

      // Trigger vote effect animation
      const effect: VoteEffect = {
        id: Math.random().toString(),
        x: Math.random() * 100,
        y: Math.random() * 100,
        type: voteType,
      };
      
      setEffects(prev => [...prev, effect]);
      
      setTimeout(() => {
        setEffects(prev => prev.filter(e => e.id !== effect.id));
      }, 2000);

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/contests', contestId] });
      queryClient.invalidateQueries({ queryKey: ['/api/contests', contestId, 'vote-status'] });
      queryClient.invalidateQueries({ queryKey: ['/api/leaderboard'] });
      queryClient.invalidateQueries({ queryKey: ['/api/models/top'] });
    },
    onError: (error: any) => {
      toast({
        title: "Vote Failed",
        description: "Unable to cast vote at this time. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getIcon = () => {
    // If user has voted and this is the model they voted for
    if (voteStatus?.hasVoted && voteStatus?.votedModelId === modelId) {
      return <Check className="mr-2" />;
    }
    
    switch (voteType) {
      case "power":
        return <Zap className="mr-2" />;
      case "vip":
        return <Crown className="mr-2" />;
      default:
        return <Heart className="mr-2" />;
    }
  };

  const getButtonClasses = () => {
    const baseClasses = "font-semibold transition-all duration-300 relative overflow-hidden";
    const sizeClasses = {
      sm: "px-4 py-2 text-sm",
      md: "px-6 py-3 text-base",
      lg: "px-8 py-4 text-lg",
    };

    // If user has voted for this model, show as voted
    if (voteStatus?.hasVoted && voteStatus?.votedModelId === modelId) {
      const votedClasses = "bg-gradient-to-r from-green-500 to-emerald-500 text-white cursor-default";
      return `${baseClasses} ${sizeClasses[size]} ${votedClasses} ${className}`;
    }
    
    // If user has voted for another model, disable this button
    if (voteStatus?.hasVoted && voteStatus?.votedModelId !== modelId) {
      const disabledClasses = "bg-gray-400 text-gray-600 cursor-not-allowed opacity-50";
      return `${baseClasses} ${sizeClasses[size]} ${disabledClasses} ${className}`;
    }

    const typeClasses = {
      free: "bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600",
      power: "bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 animate-glow",
      vip: "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 animate-glow",
    };

    return `${baseClasses} ${sizeClasses[size]} ${typeClasses[voteType]} ${className}`;
  };

  const getEffectColor = (type: "free" | "power" | "vip") => {
    switch (type) {
      case "power":
        return "text-amber-400";
      case "vip":
        return "text-purple-400";
      default:
        return "text-pink-400";
    }
  };

  const getEffectText = (type: "free" | "power" | "vip") => {
    switch (type) {
      case "power":
        return "+2";
      case "vip":
        return "+5";
      default:
        return "+1";
    }
  };

  const getButtonText = () => {
    if (voteMutation.isPending) return "Voting...";
    if (voteStatus?.hasVoted && voteStatus?.votedModelId === modelId) return "Voted";
    if (voteStatus?.hasVoted && voteStatus?.votedModelId !== modelId) return "Already Voted";
    
    return voteType === "free" ? "Vote" :
           voteType === "power" ? "Power Vote" : "VIP Vote";
  };

  const isDisabled = voteMutation.isPending || 
                    (voteStatus?.hasVoted && voteStatus?.votedModelId !== modelId) ||
                    (voteStatus?.hasVoted && voteStatus?.votedModelId === modelId);

  return (
    <>
      <motion.div
        whileHover={!isDisabled ? { scale: 1.05 } : {}}
        whileTap={!isDisabled ? { scale: 0.95 } : {}}
        transition={{ duration: 0.2 }}
      >
        <Button
          onClick={() => !isDisabled && voteMutation.mutate()}
          disabled={isDisabled}
          className={getButtonClasses()}
        >
          {getIcon()}
          {getButtonText()}
        </Button>
      </motion.div>

      <AnimatePresence>
        {effects.map((effect) => (
          <motion.div
            key={effect.id}
            className={`fixed pointer-events-none z-50 font-bold text-2xl ${getEffectColor(effect.type)}`}
            style={{
              left: `${effect.x}%`,
              top: `${effect.y}%`,
            }}
            initial={{ opacity: 1, y: 0, scale: 1 }}
            animate={{ 
              opacity: 0, 
              y: -50, 
              scale: 1.5,
              transition: { duration: 2, ease: "easeOut" }
            }}
            exit={{ opacity: 0 }}
          >
            {getEffectText(effect.type)}
          </motion.div>
        ))}
      </AnimatePresence>
    </>
  );
}
