import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import VoteButton from "@/components/ui/vote-button";
import { Heart, User, Clock, Trophy } from "lucide-react";

interface PhotoSubmissionCardProps {
  entry: {
    id: number;
    photoUrl: string;
    title: string;
    description: string;
    votes: number;
    submittedAt: string;
    model: {
      id: number;
      name: string;
      stageName?: string;
      profileImage?: string;
    };
  };
  rank: number;
  contestId: number;
  isActive: boolean;
}

export default function PhotoSubmissionCard({ entry, rank, contestId, isActive }: PhotoSubmissionCardProps) {
  const displayName = entry.model.stageName || entry.model.name;

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 group"
      whileHover={{ y: -8 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Photo */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={entry.photoUrl}
          alt={entry.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Rank Badge */}
        <div className="absolute top-4 left-4">
          <Badge className={`px-3 py-1 font-bold text-sm ${
            rank === 1 
              ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white" 
              : rank === 2
              ? "bg-gradient-to-r from-gray-300 to-gray-500 text-white"
              : rank === 3
              ? "bg-gradient-to-r from-orange-400 to-red-500 text-white"
              : "bg-white/90 text-gray-800"
          }`}>
            {rank === 1 && <Trophy className="h-3 w-3 mr-1" />}
            #{rank}
          </Badge>
        </div>

        {/* Vote Count */}
        <div className="absolute top-4 right-4 bg-black/80 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
          <Heart className="h-3 w-3 fill-current" />
          {entry.votes.toLocaleString()}
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Photo Title */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 line-clamp-2 mb-2">
            {entry.title}
          </h3>
          {entry.description && (
            <p className="text-gray-600 text-sm line-clamp-3">
              {entry.description}
            </p>
          )}
        </div>

        {/* Model Info */}
        <div className="flex items-center gap-3 py-3 border-t border-gray-100">
          <div className="flex items-center gap-2 flex-1">
            {entry.model.profileImage ? (
              <img
                src={entry.model.profileImage}
                alt={displayName}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="h-8 w-8 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
            )}
            <div>
              <p className="font-semibold text-gray-900 text-sm">{displayName}</p>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                {new Date(entry.submittedAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        {/* Vote Button */}
        {isActive && (
          <div className="pt-2">
            <VoteButton
              contestId={contestId}
              modelId={entry.model.id}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 transform hover:scale-105"
              size="lg"
            />
          </div>
        )}
      </div>
    </motion.div>
  );
}