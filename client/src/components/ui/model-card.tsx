import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award } from "lucide-react";
import VoteButton from "./vote-button";
import { cardHoverAnimation } from "@/lib/animations";
import type { Model } from "@shared/schema";
import { ASSETS_URL } from "@/var";

interface ModelCardProps {
  model: Model;
  rank?: number;
  showStats?: boolean;
  activeOrUpcomingContests?: any;
  className?: string;
}

export default function ModelCard({
  model,
  rank,
  showStats = true,
  activeOrUpcomingContests,
  className = "",
}: ModelCardProps) {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="ml-1" size={16} />;
      case 2:
        return <Medal className="ml-1" size={16} />;
      case 3:
        return <Award className="ml-1" size={16} />;
      default:
        return null;
    }
  };
  console.log(
    "activeOrUpcomingContests:::",
    activeOrUpcomingContests?.[0]?.id,
    activeOrUpcomingContests?.[0]?.status
  );

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-amber-400 to-orange-500";
      case 2:
        return "bg-gradient-to-r from-gray-400 to-gray-600";
      case 3:
        return "bg-gradient-to-r from-amber-600 to-orange-700";
      default:
        return "bg-gradient-to-r from-indigo-500 to-purple-600";
    }
  };

  return (
    <motion.div
      className={`group relative bg-white rounded-2xl shadow-lg hover-lift transition-all duration-500 overflow-hidden ${className}`}
      variants={cardHoverAnimation}
      whileHover="whileHover"
    >
      {rank && (
        <div className="absolute top-4 left-4 z-10">
          <Badge
            className={`${getRankBadgeColor(
              rank
            )} text-white px-3 py-1 rounded-full text-sm font-bold`}
          >
            #{rank} {getRankIcon(rank)}
          </Badge>
        </div>
      )}

      <div className="relative">
        <motion.img
          src={`${ASSETS_URL}${model.profileImage}`}
          alt={`${model.name} portrait`}
          className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-700"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.7 }}
        />

        {showStats && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-white">
              <p className="text-sm mb-2">Quick Stats:</p>
              <div className="flex space-x-4 text-xs">
                <span>
                  <Trophy size={12} className="inline mr-1" />{" "}
                  {model.contestsWon} Wins
                </span>
                <span>
                  <Medal size={12} className="inline mr-1" /> Top 3s
                </span>
                <span>❤️ High Rating</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">{model.name}</h3>
        {model.bio && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{model.bio}</p>
        )}

        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-600">Total Votes</span>
          <motion.span
            className="text-lg font-bold text-indigo-600"
            key={model.totalVotes}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {(model.totalVotes ?? 0).toLocaleString()}
          </motion.span>
        </div>

        {activeOrUpcomingContests?.[0]?.id &&
          activeOrUpcomingContests?.[0]?.status === "active" && (
            <VoteButton
              contestId={activeOrUpcomingContests?.[0]?.id}
              modelId={model.id}
              className="w-full rounded-xl"
              size="md"
            />
          )}
      </div>
    </motion.div>
  );
}
