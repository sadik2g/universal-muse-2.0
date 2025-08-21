import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Calendar, Trophy, Users } from "lucide-react";
import { cardHoverAnimation } from "@/lib/animations";
import type { Contest } from "@shared/schema";
import { ASSETS_URL } from "@/var";

interface ContestCardProps {
  contest: Contest;
  className?: string;
}

export default function ContestCard({ contest, className = "" }: ContestCardProps) {
  const endDate = new Date(contest.endDate);
  const isActive = endDate > new Date();
  const daysLeft = Math.ceil((endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  const getStatusBadge = () => {
    if (!isActive) {
      return <Badge className="bg-gray-500 text-white">ENDED</Badge>;
    }

    if (daysLeft <= 3) {
      return <Badge className="bg-red-500 text-white animate-pulse">LIVE</Badge>;
    }

    return <Badge className="bg-green-500 text-white">ACTIVE</Badge>;
  };

  return (
    <motion.div
      className={`bg-white rounded-2xl shadow-lg hover-lift transition-all duration-500 overflow-hidden ${className}`}
      variants={cardHoverAnimation}
      whileHover="whileHover"
      initial="initial"
      animate="animate"
    >
      <div className="relative">
        <motion.img
          src={`${ASSETS_URL}${contest.bannerImage}`}
          alt={`${contest.title} banner`}
          className="w-full h-48 object-cover"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.5 }}
        />

        <div className="absolute top-4 left-4">
          {getStatusBadge()}
        </div>

        <div className="absolute top-4 right-4">
          <Badge className="bg-black/50 text-white px-3 py-1 rounded-full text-sm font-semibold">
            <Users size={14} className="mr-1" />
            {isNaN(contest.entryCount) ? 0 : (contest.entryCount || 0)}
          </Badge>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">{contest.title}</h3>
        <p className="text-gray-600 mb-4 text-sm line-clamp-3">
          {contest.description}
        </p>

        <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
          <span>
            <Calendar size={14} className="inline mr-1" />
            {isActive ? `Ends in ${daysLeft} days` : "Contest ended"}
          </span>
          <span>
            <Trophy size={14} className="inline mr-1" />
            ${Number(contest.prizeAmount || 0).toLocaleString()} Prize
          </span>
        </div>

        <Link href={`/contests/${contest.id}`}>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              className={`w-full rounded-xl font-semibold transition-all duration-300 ${isActive
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:scale-105"
                  : "bg-gray-400 text-white cursor-not-allowed"
                }`}
              disabled={!isActive}
            >
              {isActive ? "View Contest" : "Contest Ended"}
            </Button>
          </motion.div>
        </Link>
      </div>
    </motion.div>
  );
}
