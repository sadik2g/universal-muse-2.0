import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DashboardNav from "@/components/layout/dashboard-nav";
import ProfileHeader from "@/components/dashboard/profile-header";
import WinnerCongratulationsModal from "@/components/modals/winner-congratulations-modal";
import {
  Trophy,
  Upload,
  Eye,
  TrendingUp,
  Calendar,
  Camera,
  Heart,
  Star,
  Award
} from "lucide-react";
import { useLocation } from "wouter";

interface DashboardStats {
  totalVotes: number;
  contestsParticipated: number;
  activeSubmissions: number;
  ranking: number;
}



export default function Dashboard() {
  const { model, user } = useAuth();
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [winnerInfo, setWinnerInfo] = useState<any>(null);
  const [, navigate] = useLocation();
  // Fetch dashboard stats
  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
    initialData: {
      totalVotes: 0,
      contestsParticipated: 0,
      activeSubmissions: 0,
      ranking: 0
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false
  });
  // Fetch active contests
  const { data: activeContests } = useQuery({
    queryKey: ["/api/contests"],
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false
  });


  // Fetch model winnings
  const { data: winnings } = useQuery({
    queryKey: ["/api/my-winnings"],
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false
  });

  const hasWinnings = winnings && Array.isArray(winnings) && winnings.length > 0;

  const handlePrizeClick = (winning: any) => {
    // Only allow clicking if no prize request exists or it's not completed/processing
    if (winning && (!winning.prizeRequestStatus || winning.prizeRequestStatus === 'rejected')) {
      setWinnerInfo(winning);
      setShowWinnerModal(true);
    }
  };

  const handlePrizeRequestSuccess = () => {
    // Refresh winnings data immediately after successful prize request
    queryClient.invalidateQueries({ queryKey: ["/api/my-winnings"] });
    setShowWinnerModal(false);
    setWinnerInfo(null);
  };

  // Remove automatic modal showing - will be handled by notification system

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  const statCards = [
    {
      title: "Total Votes",
      value: model?.totalVotes || 0,
      icon: Heart,
      color: "from-pink-500 to-rose-500",
      bgColor: "bg-pink-50",
      textColor: "text-pink-600"
    },
    {
      title: "Contests Joined",
      value: model?.contestsJoined || 0,
      icon: Trophy,
      color: "from-blue-500 to-indigo-500",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600"
    },
    {
      title: "Active Submissions",
      value: stats?.activeSubmissions || 0,
      icon: Camera,
      color: "from-purple-500 to-violet-500",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600"
    },
    {
      title: "Current Ranking",
      value: `#${model?.currentRanking
        || 0}`,
      icon: Award,
      color: "from-amber-500 to-orange-500",
      bgColor: "bg-amber-50",
      textColor: "text-amber-600"
    }
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar Navigation */}
      <DashboardNav />

      {/* Main Content */}
      <div className="flex-1 p-6">
        <motion.div
          className="max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Welcome Header */}
          <motion.div
            className="mb-8"
            variants={itemVariants}
          >
            <div className="text-center">
              <motion.h1
                className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Welcome back, {model?.name || user?.email || 'Model'}!
              </motion.h1>
              <motion.p
                className="text-xl text-gray-600"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                Ready to shine in your next contest?
              </motion.p>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            variants={itemVariants}
          >
            {statCards.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  duration: 0.5,
                  delay: 0.6 + index * 0.1,
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="group"
              >
                <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">
                          {stat.title}
                        </p>
                        <motion.p
                          className="text-3xl font-bold text-gray-900"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{
                            duration: 0.6,
                            delay: 0.8 + index * 0.1,
                            type: "spring",
                            stiffness: 200
                          }}
                        >
                          {typeof stat.value === 'number' ? (
                            <motion.span
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 1, delay: 1 + index * 0.1 }}
                            >
                              {stat.value.toLocaleString()}
                            </motion.span>
                          ) : stat.value}
                        </motion.p>
                      </div>
                      <div className={`p-3 rounded-full ${stat.bgColor}`}>
                        <stat.icon className={`h-6 w-6 ${stat.textColor}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Quick Actions */}
          {/* <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
            variants={itemVariants}
          >
            {/* Upload Photo Button */}
          {/*             
              <motion.div
              onClick={() => navigate("dashboard/contests")}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="block"
              >
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
                  <CardContent className="p-8 flex items-center space-x-6 h-full">
                    <div className="p-4 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                      <Upload className="h-8 w-8" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        Upload Photo to Contest
                      </h3>
                      <p className="text-gray-600">
                        Join an active contest and showcase your talent
                      </p>
                    </div>
                    <TrendingUp className="h-6 w-6 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                  </CardContent>
                </Card>
              </motion.div> */}


          {/* View Submissions Button */}

          {/* <motion.div
              onClick={() => navigate("dashboard/mysubmissions")}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="block"
              >
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-rose-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
                  <CardContent className="p-8 flex items-center space-x-6 h-full">
                    <div className="p-4 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 text-white">
                      <Eye className="h-8 w-8" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        View My Submissions
                      </h3>
                      <p className="text-gray-600">
                        Track your performance and votes
                      </p>
                    </div>
                    <Star className="h-6 w-6 text-gray-400 group-hover:text-pink-500 transition-colors" />
                  </CardContent>
                </Card>
              </motion.div> */}

          {/* </motion.div>  */}

          {/* My Prizes Section */}
          <motion.div
            className="mb-8"
            variants={itemVariants}
          >
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-2xl font-bold text-gray-900">
                  <Trophy className="h-6 w-6 text-yellow-500" />
                  <span>My Prizes</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {hasWinnings ? (
                  <div className="space-y-4">
                    {winnings.map((winning: any, index: number) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className={`group ${winning.prizeRequestStatus && winning.prizeRequestStatus !== 'rejected' ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                        onClick={() => handlePrizeClick(winning)}
                      >
                        <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="p-3 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 text-white">
                                  <Award className="h-6 w-6" />
                                </div>
                                <div>
                                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                                    {winning.contestTitle}
                                  </h3>
                                  <p className="text-gray-600">
                                    Prize: {winning.prizeAmount} {winning.prizeCurrency}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    Winning votes: {winning.winningVotes}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                {winning.prizeRequestStatus ? (
                                  <Badge className={`${winning.prizeRequestStatus === 'pending' ? 'bg-blue-500' :
                                    winning.prizeRequestStatus === 'processing' ? 'bg-orange-500' :
                                      winning.prizeRequestStatus === 'completed' ? 'bg-green-500' :
                                        'bg-red-500'
                                    } text-white`}>
                                    {winning.prizeRequestStatus === 'pending' ? 'Request Pending' :
                                      winning.prizeRequestStatus === 'processing' ? 'Processing' :
                                        winning.prizeRequestStatus === 'completed' ? 'Prize Sent' :
                                          'Request Rejected'}
                                  </Badge>
                                ) : (
                                  <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white animate-pulse">
                                    Claim Prize
                                  </Badge>
                                )}
                                <Trophy className="h-6 w-6 text-yellow-500" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="p-4 rounded-full bg-gray-100 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <Trophy className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No Prizes Yet</h3>
                    <p className="text-gray-500 mb-4">
                      Keep participating in contests to win amazing prizes!
                    </p>
                    <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white" asChild>
                      <Link href="/contests">
                        Browse Contests
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Active Contests */}
          <motion.div
            className="mb-8"
            variants={itemVariants}
          >
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-2xl font-bold text-gray-900">
                  <Trophy className="h-6 w-6 text-yellow-500" />
                  <span>Active Contests</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activeContests &&
                  Array.isArray(activeContests) &&
                  activeContests.filter((contest: any) => contest.status === 'active').length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeContests
                      .filter((contest: any) => contest.status === 'active')
                      .map((contest: any) => (
                        <motion.div
                          key={contest.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3 }}
                          whileHover={{ y: -5 }}
                          className="group cursor-pointer"
                        >
                          <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
                            <div className="aspect-video relative overflow-hidden">
                              <img
                                src={contest.bannerImage}
                                alt={contest.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-all duration-300" />
                              <div className="absolute top-4 left-4">
                                <Badge className="bg-green-500 hover:bg-green-600 text-white">
                                  Active
                                </Badge>
                              </div>
                              <div className="absolute top-4 right-4">
                                <Badge variant="secondary" className="bg-white/90 text-black">
                                  ${contest.prizeAmount?.toLocaleString()} Prize
                                </Badge>
                              </div>
                            </div>
                            <CardContent className="p-4">
                              <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-1">
                                {contest.title}
                              </h3>
                              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                {contest.description}
                              </p>
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center text-gray-500">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  Ends: {new Date(contest.endDate).toLocaleDateString()}
                                </div>
                              </div>
                              <Button
                                className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                                asChild
                              >
                                <Link href={`dashboard/contests/${contest.id}`}>
                                  View Contest
                                </Link>
                              </Button>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">No Active Contests</h3>
                    <p className="text-gray-500">Check back soon for new contests to participate in!</p>
                  </div>
                )}

              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>

      {/* Winner Congratulations Modal */}
      {winnerInfo && (
        <WinnerCongratulationsModal
          isOpen={showWinnerModal}
          onClose={() => {
            setShowWinnerModal(false);
            setWinnerInfo(null);
          }}
          onSuccess={handlePrizeRequestSuccess}
          contestId={winnerInfo.contestId}
          contestTitle={winnerInfo.contestTitle}
          prizeAmount={winnerInfo.prizeAmount}
          prizeCurrency={winnerInfo.prizeCurrency}
          winningVotes={winnerInfo.winningVotes}
          winningPhoto={winnerInfo.winningPhoto}
          winningPhotoTitle={winnerInfo.winningPhotoTitle}
        />
      )}
    </div>
  );
}