import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Trophy, Crown, Medal, Award, Search, Users, Star, Zap } from "lucide-react";
import VoteButton from "@/components/ui/vote-button";
import AnimatedCounter from "@/components/ui/animated-counter";
import { fadeInUp, staggerChildren, cardHoverAnimation } from "@/lib/animations";
import { ASSETS_URL } from "@/var";

export default function Leaderboard() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ['/api/leaderboard/active'],
    queryFn: async () => {
      const response = await fetch('/api/leaderboard/active');
      return response.json();
    },
  });

  // Fetch contest winners for completed contests
  const { data: contestWinners } = useQuery({
    queryKey: ['/api/contests/winners'],
    queryFn: async () => {
      const response = await fetch('/api/contests');
      if (!response.ok) return [];
      const contests = await response.json();

      // Get winners for completed contests
      const completedContests = contests.filter((c: any) => c.status === 'completed');
      const winnerPromises = completedContests.map(async (contest: any) => {
        const winnerResponse = await fetch(`/api/contests/${contest.id}/winner`);
        if (winnerResponse.ok) {
          const winner = await winnerResponse.json();
          return winner ? { contestId: contest.id, ...winner } : null;
        }
        return null;
      });

      const winners = await Promise.all(winnerPromises);
      return winners.filter(Boolean);
    },
  });

  // Remove timeframes since we're focusing on active contests only

  const filteredLeaderboard = leaderboard?.filter((model: any) =>
    model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    model.stageName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const topThree = filteredLeaderboard?.length > 0 ? filteredLeaderboard : [];

  const getRankIcon = (rank: number, isWinner = false) => {
    if (isWinner) {
      return (
        <div className="relative">
          <Crown className="text-yellow-500 w-8 h-8" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
        </div>
      );
    }

    switch (rank) {
      case 1:
        return <Crown className="text-amber-400" />;
      case 2:
        return <Medal className="text-gray-400" />;
      case 3:
        return <Award className="text-orange-600" />;
      default:
        return <span className="font-bold text-lg">{rank}</span>;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-amber-300 to-amber-600";
      case 2:
        return "bg-gradient-to-r from-gray-300 to-gray-500";
      case 3:
        return "bg-gradient-to-r from-amber-600 to-orange-700";
      default:
        return "bg-gradient-to-r from-indigo-500 to-purple-600";
    }
  };

  const getRankSize = (rank: number) => {
    switch (rank) {
      case 1:
        return "w-40 h-40";
      case 2:
      case 3:
        return "w-32 h-32";
      default:
        return "w-16 h-16";
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20 bg-gradient-to-br from-gray-900 to-indigo-900">
      <div className="container mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          variants={fadeInUp}
          initial="initial"
          animate="animate"
        >
          <h1 className="text-4xl md:text-5xl font-black text-white mb-6">
            <Trophy className="inline text-amber-400 mr-3" />
            Active Contest Leaderboard
          </h1>
          <p className="text-xl text-gray-200 max-w-2xl mx-auto mb-8">
            Top 3 models from current active contests - Vote now!
          </p>

          {/* Active Contest Info */}
          <motion.div
            className="flex justify-center mb-8"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
          >
            <div className="bg-amber-500/20 backdrop-blur-lg rounded-full px-6 py-3 border border-amber-400/30">
              <div className="flex items-center gap-2 text-amber-300">
                <Zap className="w-5 h-5" />
                <span className="font-semibold">Live from Active Contests</span>
              </div>
            </div>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            className="max-w-md mx-auto"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300" />
              <Input
                type="text"
                placeholder="Search for a model..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/10 backdrop-blur text-white placeholder-gray-300 px-12 py-3 rounded-full border border-white/20 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
          </motion.div>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center">
            <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* Top 3 Special Display */}
            {topThree && topThree.length > 0 && (
              <motion.div
                className="grid md:grid-cols-3 gap-8 mb-16"
                variants={staggerChildren}
                initial="initial"
                animate="animate"
              >
                {/* 2nd Place */}
                {topThree[1] && (
                  <motion.div
                    className="md:order-1 text-center"
                    variants={fadeInUp}
                    transition={{ delay: 0.2 }}
                  >
                    <div className={`relative ${getRankBadgeColor(2)} p-1 rounded-3xl mx-auto w-fit mb-6`}>
                      <div className="bg-gray-900 rounded-3xl p-8 relative">
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-gray-300 to-gray-500 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl">
                          2
                        </div>
                        <img
                          src={`${ASSETS_URL}${topThree[1].profileImage}`}
                          alt={`${topThree[1].name} portrait`}
                          className={`${getRankSize(2)} rounded-full mx-auto mb-4 border-4 border-gray-300 object-cover`}
                        />
                        <h3 className="text-xl font-bold text-white mb-2">{topThree[1].name}</h3>
                        <p className="text-gray-300 text-sm mb-4">{topThree[1].stageName || "Fashion Model"}</p>
                        <div className="text-3xl font-black text-gray-300">
                          <AnimatedCounter value={topThree[1].totalVotes || 0} />
                        </div>
                        <div className="text-sm text-gray-400">Total Votes</div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 1st Place */}
                {topThree[0] && (
                  <motion.div
                    className="md:order-2 text-center"
                    variants={fadeInUp}
                    transition={{ delay: 0.1 }}
                  >
                    <div className={`relative ${getRankBadgeColor(1)} p-1 rounded-3xl mx-auto w-fit mb-6 animate-glow`}>
                      <div className="bg-gray-900 rounded-3xl p-8 relative">
                        <motion.div
                          className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-amber-400 to-amber-600 text-white w-16 h-16 rounded-full flex items-center justify-center font-bold text-2xl"
                          animate={{ y: [0, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Crown />
                        </motion.div>
                        <img
                          src={`${ASSETS_URL}${topThree[0].profileImage}`}
                          alt={`${topThree[0].name} portrait`}
                          className={`${getRankSize(1)} rounded-full mx-auto mb-4 border-4 border-amber-400 object-cover`}
                        />
                        <h3 className="text-2xl font-bold text-white mb-2">{topThree[0].name}</h3>
                        <p className="text-gray-300 text-sm mb-4">{topThree[0].stageName || "Elite Model"}</p>
                        <div className="text-4xl font-black text-amber-400">
                          <AnimatedCounter value={topThree[0].totalVotes || 0} />
                        </div>
                        <div className="text-sm text-gray-400">Total Votes</div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 3rd Place */}
                {topThree[2] && (
                  <motion.div
                    className="md:order-3 text-center"
                    variants={fadeInUp}
                    transition={{ delay: 0.3 }}
                  >
                    <div className={`relative ${getRankBadgeColor(3)} p-1 rounded-3xl mx-auto w-fit mb-6`}>
                      <div className="bg-gray-900 rounded-3xl p-8 relative">
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-amber-600 to-orange-700 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl">
                          3
                        </div>
                        <img
                          src={`${ASSETS_URL}${topThree[2].profileImage}`}
                          alt={`${topThree[2].name} portrait`}
                          className={`${getRankSize(3)} rounded-full mx-auto mb-4 border-4 border-orange-600 object-cover`}
                        />
                        <h3 className="text-xl font-bold text-white mb-2">{topThree[2].name}</h3>
                        <p className="text-gray-300 text-sm mb-4">{topThree[2].stageName || "Rising Star"}</p>
                        <div className="text-3xl font-black text-orange-400">
                          <AnimatedCounter value={topThree[2].totalVotes || 0} />
                        </div>
                        <div className="text-sm text-gray-400">Total Votes</div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Contest Winners Section */}
            {contestWinners && contestWinners.length > 0 && (
              <motion.div
                className="mt-16"
                variants={fadeInUp}
                initial="initial"
                animate="animate"
              >
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-4 flex items-center justify-center gap-3">
                    <Trophy className="text-yellow-500 w-8 h-8" />
                    Contest Winners
                  </h2>
                  <p className="text-gray-300 mb-8">
                    Celebrating our champions from completed contests
                  </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {contestWinners.map((winnerData: any, index: number) => (
                    <motion.div
                      key={winnerData.contestId}
                      className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-lg rounded-2xl p-6 border border-yellow-400/30"
                      variants={fadeInUp}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="text-center mb-4">
                        <div className="relative inline-block">
                          <Crown className="text-yellow-500 w-12 h-12 mx-auto mb-2" />
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-pulse" />
                        </div>
                        <h3 className="text-lg font-bold text-white">Contest Winner</h3>
                      </div>

                      <div className="text-center mb-4">
                        <img
                          src={`${ASSETS_URL}${winnerData.winner.profileImage}`}
                          alt={winnerData.winner.name}
                          className="w-20 h-20 rounded-full mx-auto mb-3 border-4 border-yellow-400 object-cover"
                        />
                        <h4 className="text-xl font-bold text-white">{winnerData.winner.name}</h4>
                        <p className="text-gray-300">{winnerData.winner.stageName || "Winner"}</p>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="bg-white/10 rounded-lg p-3">
                          <p className="text-gray-300">Contest:</p>
                          <p className="text-white font-semibold">{winnerData.contest.title}</p>
                        </div>

                        <div className="flex justify-between">
                          <div className="bg-white/10 rounded-lg p-3 flex-1 mr-2">
                            <p className="text-gray-300">Prize:</p>
                            <p className="text-green-400 font-bold">
                              ${winnerData.contest.prizeAmount} {winnerData.contest.prizeCurrency}
                            </p>
                          </div>
                          <div className="bg-white/10 rounded-lg p-3 flex-1">
                            <p className="text-gray-300">Votes:</p>
                            <p className="text-blue-400 font-bold">
                              {winnerData.contest.winningVotes?.toLocaleString() || 0}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Info about active contests */}
            <motion.div
              className="text-center mt-16"
              variants={fadeInUp}
              initial="initial"
              animate="animate"
            >
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 max-w-2xl mx-auto">
                <h3 className="text-2xl font-bold text-white mb-4">How Active Contest Leaderboard Works</h3>
                <p className="text-gray-300 mb-4">
                  This leaderboard shows the top 3 models from current active contests only. Rankings are based on actual votes from contest participants.
                </p>
                <p className="text-amber-300 font-semibold">
                  Want to see your favorite model here? Vote in active contests now!
                </p>
              </div>
            </motion.div>

            {(!topThree || topThree.length === 0) && (
              <motion.div
                className="text-center py-20"
                variants={fadeInUp}
                initial="initial"
                animate="animate"
              >
                <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Trophy className="text-gray-400 text-3xl" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  {searchTerm ? "No models found" : "No active contest leaders yet"}
                </h3>
                <p className="text-gray-300">
                  {searchTerm
                    ? "Try adjusting your search terms."
                    : "Vote in active contests to see the top performers!"
                  }
                </p>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
