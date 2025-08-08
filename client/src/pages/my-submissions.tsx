import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DashboardNav from "@/components/layout/dashboard-nav";
import ProfileHeader from "@/components/dashboard/profile-header";
import {
  Upload,
  Calendar,
  Heart,
  Trophy,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { Pagination } from "@/components/ui/pagination";

interface SubmissionEntry {
  id: number;
  contestId: number;
  contestTitle: string;
  photoUrl: string;
  caption: string;
  votes: number;
  ranking: number | null;
  status: "approved" | "pending" | "rejected";
  submittedAt: string;
  approvedAt: string | null;
  contestEndDate: string;
}

export default function MySubmissions() {
  const { model, user } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState<"all" | "approved" | "pending" | "rejected">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Fetch user submissions with pagination
  const { data: submissionsResponse, isLoading } = useQuery({
    queryKey: ["/api/my-submissions", selectedStatus, currentPage],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedStatus !== "all") {
        params.append("status", selectedStatus);
      }
      params.append("page", currentPage.toString());
      params.append("limit", itemsPerPage.toString());

      const response = await fetch(`/api/my-submissions?${params.toString()}`);
      return response.json();
    },
  });

  const submissions = submissionsResponse?.submissions || [];
  const totalSubmissions = submissionsResponse?.total || 0;
  const totalPages = Math.ceil(totalSubmissions / itemsPerPage);

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
      transition: { duration: 0.5 }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
      case "rejected":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  // Filtering is now handled by the backend query, so no need to filter client-side
  const displayedSubmissions = submissions || [];

  const stats = {
    total: submissions?.length || 0,
    approved: submissions?.filter(s => s.status === "approved").length || 0,
    pending: submissions?.filter(s => s.status === "pending").length || 0,
    rejected: submissions?.filter(s => s.status === "rejected").length || 0,
    totalVotes: submissions?.reduce((sum, s) => sum + s.votes, 0) || 0
  };

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
          <motion.div variants={itemVariants} className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              My Contest Submissions
            </h1>
            <p className="text-xl text-gray-600">
              Track your contest entries and their performance
            </p>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6"
          >
            {[
              { title: "Total Submissions", value: stats.total, icon: Upload, color: "from-blue-500 to-indigo-500" },
              { title: "Approved", value: stats.approved, icon: CheckCircle, color: "from-green-500 to-emerald-500" },
              { title: "Pending Review", value: stats.pending, icon: Clock, color: "from-yellow-500 to-orange-500" },
              { title: "Rejected", value: stats.rejected, icon: XCircle, color: "from-red-500 to-rose-500" },
              { title: "Total Votes", value: stats.totalVotes, icon: Heart, color: "from-pink-500 to-purple-500" },
            ].map((stat, index) => (
              <Card key={stat.title} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
                    </div>
                    <div className={`p-3 rounded-full bg-gradient-to-r ${stat.color} text-white`}>
                      <stat.icon className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          {/* Filter Tabs */}
          <motion.div variants={itemVariants} className="flex flex-wrap gap-2">
            {[
              { key: "all", label: "All Submissions", count: stats.total },
              { key: "approved", label: "Approved", count: stats.approved },
              { key: "pending", label: "Pending", count: stats.pending },
              { key: "rejected", label: "Rejected", count: stats.rejected },
            ].map(({ key, label, count }) => (
              <Button
                key={key}
                variant={selectedStatus === key ? "default" : "outline"}
                onClick={() => setSelectedStatus(key as any)}
                className="flex items-center gap-2"
              >
                {label}
                <Badge variant="secondary" className="ml-1">
                  {count}
                </Badge>
              </Button>
            ))}
          </motion.div>

          {/* Submissions Grid */}
          <motion.div variants={itemVariants}>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <div className="aspect-video bg-gray-200 animate-pulse" />
                    <CardContent className="p-4 space-y-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse" />
                      <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : displayedSubmissions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedSubmissions.map((submission) => (
                  <motion.div
                    key={submission.id}
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
                      <div className="aspect-video relative overflow-hidden">
                        <img
                          src={submission.photoUrl}
                          alt="Contest submission"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-4 left-4">
                          <Badge className={getStatusColor(submission.status)}>
                            {getStatusIcon(submission.status)}
                            <span className="ml-1 capitalize">{submission.status}</span>
                          </Badge>
                        </div>
                        {submission.ranking && (
                          <div className="absolute top-4 right-4">
                            <Badge className="bg-yellow-500 text-white">
                              <Trophy className="h-4 w-4 mr-1" />
                              #{submission.ranking}
                            </Badge>
                          </div>
                        )}
                      </div>

                      <CardContent className="p-4">
                        <h3 className="font-semibold text-lg mb-2 line-clamp-1">
                          {submission.contestTitle}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {submission.caption}
                        </p>

                        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(submission.submittedAt).toLocaleDateString()}
                          </div>
                          <div className="flex items-center">
                            <Heart className="h-4 w-4 mr-1 text-pink-500" />
                            {submission.votes} votes
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1" asChild>
                            <a href={`/contests/${submission.contestId}`} target="_blank" rel="noopener noreferrer">
                              <Eye className="h-4 w-4 mr-1" />
                              View Contest
                            </a>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Upload className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  {selectedStatus === "all" ? "No Submissions Yet" : `No ${selectedStatus} submissions`}
                </h3>
                <p className="text-gray-500 mb-6">
                  {selectedStatus === "all"
                    ? "Start participating in contests to see your submissions here!"
                    : `You don't have any ${selectedStatus} submissions at the moment.`
                  }
                </p>
                <Button asChild>
                  <a href="/dashboard/contests">
                    Browse Active Contests
                  </a>
                </Button>
              </div>
            )}
          </motion.div>

          {/* Pagination */}
          {totalPages > 1 && (
            <motion.div variants={itemVariants} className="mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalSubmissions}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                className="justify-center"
              />
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}