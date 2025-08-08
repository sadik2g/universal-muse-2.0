import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DashboardNav from "@/components/layout/dashboard-nav";
import {
  Calendar,
  Clock,
  Upload,
  Trophy,
  Users,
  Timer,
  Star,
  Camera
} from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";

interface ActiveContest {
  id: string;
  title: string;
  description: string;
  deadline: string;
  entryCount: number;
  prizePool: string;
  category: string;
  status: "open" | "closing-soon" | "full";
  daysLeft: number;
}

export default function DashboardContests() {
  const { model, user } = useAuth();

  const { data: contests } = useQuery<ActiveContest[]>({
    queryKey: ["/api/contests"],
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false
  });

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-green-100 text-green-800 border-green-200";
      case "closing-soon":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "full":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "open":
        return "Open for Entry";
      case "closing-soon":
        return "Closing Soon";
      case "full":
        return "Entry Full";
      default:
        return "Unknown";
    }
  };

const { data: activeContests } = useQuery<ActiveContest[]>({
  queryKey: ["/api/contests"],
  staleTime: 5 * 60 * 1000, // 5 minutes
  refetchOnMount: false,
  refetchOnWindowFocus: false
});

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
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Available Contests</h1>
            <p className="text-gray-600">Browse and participate in exciting modeling contests</p>
          </div>
          {/* Header */}
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
                Active Contests
              </motion.h1>
              <motion.p
                className="text-xl text-gray-600"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                Choose a contest and showcase your talent
              </motion.p>
            </div>
          </motion.div>

          {/* Contest Stats Bar */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
            variants={itemVariants}
          >
            <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardContent className="p-6 text-center">
                <Trophy className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-900">{activeContests?.length || 0}</p>
                <p className="text-blue-700">Total Contests</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-50 to-pink-50">
              <CardContent className="p-6 text-center">
                <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-purple-900">
                  {model?.contestsJoined}
                </p>
                <p className="text-purple-700">Total Contest Joined</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-50 to-pink-50">
              <CardContent className="p-6 text-center">
                <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-purple-900">
                  {model?.contestsWon}
                </p>
                <p className="text-purple-700">Total Contest Won</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Contests Grid */}
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

          {/* Call to Action */}
          <motion.div
            className="mt-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
          >
            <Card className="border-0 shadow-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
              <CardContent className="p-8">
                <Trophy className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">
                  Ready to Win Big?
                </h3>
                <p className="text-indigo-100 mb-6">
                  Join contests to maximize your chances of winning amazing prizes!
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}