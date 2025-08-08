import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  CheckCircle,
  XCircle,
  Eye,
  Filter,
  Search,
  Clock,
  User,
  Camera,
  AlertTriangle
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Pagination } from "@/components/ui/pagination";

interface PendingSubmission {
  id: string;
  modelName: string;
  contestTitle: string;
  photoUrl: string;
  title: string;
  description: string;
  submittedAt: string;
  modelId: number;
  contestId: number;
  status: "pending" | "approved" | "rejected";
}

interface AdminStats {
  totalContests: number;
  totalSubmissions: number;
  totalVotes: number;
  activeContests: number;
  pendingSubmissions: number;
  approvedSubmissions: number;
  rejectedSubmissions: number;
  totalUsers: number;
}

export default function AdminModerate() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [selectedSubmission, setSelectedSubmission] = useState<PendingSubmission | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch admin stats for total counts
  const { data: stats } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Fetch submissions based on status filter with pagination
  const { data: submissionsResponse, isLoading } = useQuery({
    queryKey: ["/api/admin/submissions", statusFilter, currentPage],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('status', statusFilter);
      params.append('page', currentPage.toString());
      params.append('limit', itemsPerPage.toString());

      const response = await fetch(`/api/admin/submissions?${params.toString()}`, {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch submissions');
      }
      return response.json();
    },
    staleTime: 30 * 1000, // 30 seconds
  });

  const submissions = submissionsResponse?.submissions || [];
  const totalSubmissions = submissionsResponse?.total || 0;
  const totalPages = Math.ceil(totalSubmissions / itemsPerPage);

  // Approve submission mutation
  const approveSubmissionMutation = useMutation({
    mutationFn: ({ submissionId, modelId }: { submissionId: string; modelId: string }) =>
      apiRequest(`/api/admin/submissions/${submissionId}/approve`, {
        method: "POST",
        body: JSON.stringify({ modelId }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/submissions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setSelectedSubmission(null);
      toast({
        title: "Success",
        description: "Submission approved successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to approve submission",
        variant: "destructive",
      });
    },
  });


  // Reject submission mutation
  const rejectSubmissionMutation = useMutation({
    mutationFn: (submissionId: string) => apiRequest(`/api/admin/submissions/${submissionId}/reject`, {
      method: "POST",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/submissions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setSelectedSubmission(null);
      toast({
        title: "Success",
        description: "Submission rejected successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reject submission",
        variant: "destructive",
      });
    },
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
      transition: { duration: 0.5 }
    }
  };

  const filteredSubmissions = Array.isArray(submissions) ? submissions.filter(submission => {
    const matchesSearch = submission.modelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.contestTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  }) : [];

  console.log("filteredSubmissions", filteredSubmissions);
  // Reset to page 1 when filters change
  const handleStatusChange = (newStatus: string) => {
    setStatusFilter(newStatus);
    setCurrentPage(1);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleApprove = (submissionId: string, modelId: string) => {
    approveSubmissionMutation.mutate({ submissionId: submissionId, modelId: modelId });
  };

  const handleReject = (submissionId: string) => {
    if (window.confirm("Are you sure you want to reject this submission?")) {
      rejectSubmissionMutation.mutate(submissionId);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  console.log("filteredSubmissions::::", filteredSubmissions)
  console.log("submissions::::", submissions)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="space-y-8"
        >
          {/* Header */}
          <motion.div variants={itemVariants}>
            <h1 className="text-3xl font-bold text-gray-900">Moderate Uploads</h1>
            <p className="text-gray-600 mt-1">Review and approve contest submissions</p>
          </motion.div>

          {/* Stats */}
          <motion.div variants={itemVariants}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-yellow-100">
                      <Clock className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats?.pendingSubmissions || 0}
                      </p>
                      <p className="text-sm text-gray-600">Pending Review</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-green-100">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats?.approvedSubmissions || 0}
                      </p>
                      <p className="text-sm text-gray-600">Total Approved</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-red-100">
                      <XCircle className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats?.rejectedSubmissions || 0}
                      </p>
                      <p className="text-sm text-gray-600">Total Rejected</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div variants={itemVariants}>
            <Card className="border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search submissions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={statusFilter === "pending" ? "default" : "outline"}
                      onClick={() => handleStatusChange("pending")}
                      size="sm"
                    >
                      Pending
                    </Button>
                    <Button
                      variant={statusFilter === "approved" ? "default" : "outline"}
                      onClick={() => handleStatusChange("approved")}
                      size="sm"
                    >
                      Approved
                    </Button>
                    <Button
                      variant={statusFilter === "rejected" ? "default" : "outline"}
                      onClick={() => handleStatusChange("rejected")}
                      size="sm"
                    >
                      Rejected
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Submissions Grid */}
          <motion.div variants={itemVariants}>
            {filteredSubmissions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSubmissions.map((submission, index) => (
                  <motion.div
                    key={submission.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                  >
                    <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                      <div className="relative">
                        <img
                          src={`${"http://localhost:5000"}${submission.photoUrl}`}
                          alt={`Submission by ${submission.modelName}`}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute top-3 right-3">
                          <Badge className={getStatusColor(submission.status)}>
                            {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="p-4 space-y-3">
                        <div>
                          <h3 className="font-semibold text-gray-900 line-clamp-1">
                            {submission.contestTitle}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                            <User className="h-4 w-4" />
                            <span>{submission.modelName}</span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <h4 className="font-medium text-gray-900 text-sm">
                            {submission.title}
                          </h4>
                          {submission.description && (
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {submission.description}
                            </p>
                          )}
                        </div>

                        <div className="text-xs text-gray-500">
                          Submitted: {new Date(submission.submittedAt).toLocaleString()}
                        </div>

                        {submission.status === "pending" && (
                          <div className="flex gap-2 pt-2">
                            <Button
                              size="sm"
                              className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                              onClick={() => handleApprove(submission.id, submission.modelId)}
                              disabled={approveSubmissionMutation.isPending}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 text-red-600 hover:bg-red-50 border-red-200"
                              onClick={() => handleReject(submission.id)}
                              disabled={rejectSubmissionMutation.isPending}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}

                        {/* <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => setSelectedSubmission(submission)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button> */}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card className="border-0 shadow-md">
                <CardContent className="p-12 text-center">
                  <Camera className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    No submissions found
                  </h3>
                  <p className="text-gray-500">
                    {searchTerm
                      ? "Try adjusting your search terms"
                      : `No ${statusFilter} submissions at the moment`}
                  </p>
                </CardContent>
              </Card>
            )}
          </motion.div>

          {/* Pagination */}
          {totalPages > 1 && (
            <motion.div variants={itemVariants}>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalSubmissions}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                className="mt-8"
              />
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}