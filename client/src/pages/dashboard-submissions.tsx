import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import DashboardNav from "@/components/layout/dashboard-nav";
import { 
  Heart, 
  Eye, 
  Calendar, 
  Trophy, 
  Search, 
  Filter,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Share2
} from "lucide-react";

interface ModelSubmission {
  id: string;
  contestId: string;
  contestName: string;
  photoUrl: string;
  votes: number;
  status: "approved" | "pending" | "rejected";
  submittedAt: string;
  contestEndDate: string;
  ranking: number | null;
  totalEntries: number;
  prizeEligible: boolean;
}

export default function DashboardSubmissions() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Fetch user submissions
  const { data: submissions } = useQuery<ModelSubmission[]>({
    queryKey: ["/api/dashboard/my-submissions"],
    initialData: [
      {
        id: "1",
        contestId: "summer-2024",
        contestName: "Summer Elegance 2024",
        photoUrl: "https://images.unsplash.com/photo-1594736797933-d0f37ba2fe64?w=500",
        votes: 1247,
        status: "approved",
        submittedAt: "2024-01-15",
        contestEndDate: "2024-02-15",
        ranking: 3,
        totalEntries: 234,
        prizeEligible: true
      },
      {
        id: "2", 
        contestId: "winter-glow",
        contestName: "Winter Glow Contest",
        photoUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500",
        votes: 892,
        status: "approved",
        submittedAt: "2024-01-12",
        contestEndDate: "2024-02-10",
        ranking: 7,
        totalEntries: 156,
        prizeEligible: true
      },
      {
        id: "3",
        contestId: "urban-chic",
        contestName: "Urban Chic Photography",
        photoUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500",
        votes: 1523,
        status: "approved", 
        submittedAt: "2024-01-10",
        contestEndDate: "2024-02-05",
        ranking: 1,
        totalEntries: 189,
        prizeEligible: true
      },
      {
        id: "4",
        contestId: "natural-beauty-spring",
        contestName: "Natural Beauty Spring",
        photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500",
        votes: 456,
        status: "pending",
        submittedAt: "2024-01-20",
        contestEndDate: "2024-02-20",
        ranking: null,
        totalEntries: 87,
        prizeEligible: false
      },
      {
        id: "5",
        contestId: "evening-glamour",
        contestName: "Evening Glamour Contest",
        photoUrl: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=500",
        votes: 234,
        status: "rejected",
        submittedAt: "2024-01-08",
        contestEndDate: "2024-02-01",
        ranking: null,
        totalEntries: 145,
        prizeEligible: false
      },
      {
        id: "6",
        contestId: "fitness-inspiration",
        contestName: "Fitness Inspiration 2024",
        photoUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500",
        votes: 678,
        status: "approved",
        submittedAt: "2024-01-18",
        contestEndDate: "2024-02-25",
        ranking: 12,
        totalEntries: 298,
        prizeEligible: false
      }
    ]
  });

  const filteredSubmissions = submissions?.filter(submission => {
    const matchesSearch = submission.contestName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || submission.status === statusFilter;
    return matchesSearch && matchesStatus;
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "pending":
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRankingBadgeColor = (ranking: number) => {
    if (ranking === 1) return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white";
    if (ranking === 2) return "bg-gradient-to-r from-gray-300 to-gray-500 text-white";
    if (ranking === 3) return "bg-gradient-to-r from-orange-400 to-orange-600 text-white";
    if (ranking <= 10) return "bg-gradient-to-r from-blue-400 to-blue-600 text-white";
    return "bg-gray-100 text-gray-800";
  };

  // Stats calculation
  const totalVotes = submissions?.reduce((acc, sub) => acc + sub.votes, 0) || 0;
  const approvedCount = submissions?.filter(sub => sub.status === "approved").length || 0;
  const pendingCount = submissions?.filter(sub => sub.status === "pending").length || 0;
  const topRankings = submissions?.filter(sub => sub.ranking && sub.ranking <= 10).length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <DashboardNav />
          </div>
          
          {/* Main Content */}
          <motion.div
            className="lg:col-span-3"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
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
              My Submissions
            </motion.h1>
            <motion.p 
              className="text-xl text-gray-600"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Track your contest entries and performance
            </motion.p>
          </div>
        </motion.div>

        {/* Summary Stats */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          variants={itemVariants}
        >
          <Card className="border-0 shadow-lg bg-gradient-to-r from-pink-50 to-rose-50">
            <CardContent className="p-6 text-center">
              <Heart className="h-8 w-8 text-pink-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-pink-900">{totalVotes.toLocaleString()}</p>
              <p className="text-pink-700">Total Votes</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-r from-green-50 to-emerald-50">
            <CardContent className="p-6 text-center">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-900">{approvedCount}</p>
              <p className="text-green-700">Approved</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-r from-orange-50 to-amber-50">
            <CardContent className="p-6 text-center">
              <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-orange-900">{pendingCount}</p>
              <p className="text-orange-700">Pending Review</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardContent className="p-6 text-center">
              <Trophy className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-900">{topRankings}</p>
              <p className="text-blue-700">Top 10 Ranks</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters */}
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 mb-6"
          variants={itemVariants}
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search contests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 border-2 border-gray-200 focus:border-indigo-400 transition-colors"
            />
          </div>
          
          <div className="flex gap-2">
            {["all", "approved", "pending", "rejected"].map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? "default" : "outline"}
                onClick={() => setStatusFilter(status)}
                className="capitalize"
              >
                <Filter className="mr-2 h-4 w-4" />
                {status === "all" ? "All" : status}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Submissions Grid */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
          variants={itemVariants}
        >
          {filteredSubmissions?.map((submission, index) => (
            <motion.div
              key={submission.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.5, 
                delay: 0.6 + index * 0.1,
                type: "spring",
                stiffness: 100
              }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="group"
            >
              <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="relative">
                  <img
                    src={submission.photoUrl}
                    alt={submission.contestName}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Status Badge */}
                  <div className="absolute top-3 left-3">
                    <Badge className={`${getStatusColor(submission.status)} border flex items-center gap-1`}>
                      {getStatusIcon(submission.status)}
                      {submission.status}
                    </Badge>
                  </div>
                  
                  {/* Ranking Badge */}
                  {submission.ranking && (
                    <div className="absolute top-3 right-3">
                      <Badge className={`${getRankingBadgeColor(submission.ranking)} border-0 font-bold`}>
                        #{submission.ranking}
                      </Badge>
                    </div>
                  )}

                  {/* Action Buttons Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" className="bg-white/90 hover:bg-white">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="secondary" className="bg-white/90 hover:bg-white">
                        <Share2 className="h-4 w-4 mr-1" />
                        Share
                      </Button>
                    </div>
                  </div>
                </div>

                <CardContent className="p-6">
                  <h4 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1">
                    {submission.contestName}
                  </h4>
                  
                  <div className="space-y-3">
                    {/* Vote Count */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Heart className="h-4 w-4 text-pink-500" />
                        <span className="font-semibold text-gray-900">
                          {submission.votes.toLocaleString()} votes
                        </span>
                      </div>
                      {submission.votes > 1000 && (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      )}
                    </div>

                    {/* Contest Info */}
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Submitted: {new Date(submission.submittedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Trophy className="h-3 w-3" />
                        <span>{submission.totalEntries} entries</span>
                      </div>
                    </div>

                    {/* Performance Metrics */}
                    {submission.ranking && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-600">Performance</span>
                          {submission.prizeEligible && (
                            <Badge variant="secondary" className="text-xs">
                              Prize Eligible
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                              style={{ 
                                width: `${Math.max(10, 100 - (submission.ranking / submission.totalEntries * 100))}%`
                              }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            Top {Math.round((submission.ranking / submission.totalEntries) * 100)}%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {filteredSubmissions?.length === 0 && (
          <motion.div 
            className="text-center py-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No submissions found
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || statusFilter !== "all" 
                ? "Try adjusting your filters" 
                : "Start by entering a contest to see your submissions here"
              }
            </p>
            <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
              Browse Contests
            </Button>
          </motion.div>
        )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}