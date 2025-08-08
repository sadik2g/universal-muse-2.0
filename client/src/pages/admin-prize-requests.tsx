import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Gift,
  Crown,
  User,
  Calendar,
  MessageSquare,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle
} from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface PrizeRequest {
  id: number;
  contestId: number;
  modelId: number;
  userId: number;
  requestMessage: string;
  contactInfo: string;
  status: "pending" | "processing" | "completed" | "rejected";
  adminNotes: string;
  createdAt: string;
  updatedAt: string;
  contestTitle: string;
  modelName: string;
  userEmail: string;
  prizeAmount: number;
  prizeCurrency: string;
}

export default function AdminPrizeRequests() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedRequest, setSelectedRequest] = useState<PrizeRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // Fetch prize requests with pagination
  const { data: prizeRequestsResponse, isLoading } = useQuery({
    queryKey: ["/api/admin/prize-requests", statusFilter, currentPage],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('status', statusFilter);
      params.append('page', currentPage.toString());
      params.append('limit', itemsPerPage.toString());
      
      const response = await fetch(`/api/admin/prize-requests?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch prize requests');
      return response.json();
    },
    staleTime: 2 * 60 * 1000,
  });

  const prizeRequests = prizeRequestsResponse || [];
  const totalRequests = prizeRequestsResponse?.total || 0;
  const totalPages = Math.ceil(totalRequests / itemsPerPage);

  // Update prize request status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, adminNotes }: { id: number; status: string; adminNotes?: string }) => {
      return await apiRequest(`/api/admin/prize-requests/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status, adminNotes }),
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/prize-requests"] });
      toast({
        title: "Success",
        description: "Prize request status updated successfully!",
      });
      setSelectedRequest(null);
      setAdminNotes("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update prize request",
        variant: "destructive",
      });
    },
  });

  const handleStatusUpdate = (request: PrizeRequest, newStatus: string) => {
    setSelectedRequest(request);
    setAdminNotes(request.adminNotes || "");
    
    updateStatusMutation.mutate({
      id: request.id,
      status: newStatus,
      adminNotes: adminNotes,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "processing":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "processing":
        return <AlertCircle className="w-4 h-4" />;
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "rejected":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const filteredRequests = prizeRequests || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

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
          <motion.div variants={itemVariants} className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Prize Requests</h1>
              <p className="text-gray-600 mt-1">Manage winner prize claims and payments</p>
            </div>
            <div className="flex items-center gap-3">
              <Gift className="h-8 w-8 text-yellow-500" />
              <span className="text-2xl font-bold text-gray-800">
                {filteredRequests.length} Requests
              </span>
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div variants={itemVariants}>
            <Card className="border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex gap-2">
                  <Button
                    variant={statusFilter === "all" ? "default" : "outline"}
                    onClick={() => setStatusFilter("all")}
                    size="sm"
                  >
                    All Requests
                  </Button>
                  <Button
                    variant={statusFilter === "pending" ? "default" : "outline"}
                    onClick={() => setStatusFilter("pending")}
                    size="sm"
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Pending
                  </Button>
                  <Button
                    variant={statusFilter === "processing" ? "default" : "outline"}
                    onClick={() => setStatusFilter("processing")}
                    size="sm"
                  >
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Processing
                  </Button>
                  <Button
                    variant={statusFilter === "completed" ? "default" : "outline"}
                    onClick={() => setStatusFilter("completed")}
                    size="sm"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Completed
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Prize Requests Grid */}
          <motion.div variants={itemVariants}>
            {filteredRequests.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredRequests.map((request, index) => (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                  >
                    <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <Crown className="h-6 w-6 text-yellow-500" />
                            <Badge className={getStatusColor(request.status)}>
                              {getStatusIcon(request.status)}
                              <span className="ml-1 capitalize">{request.status}</span>
                            </Badge>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-green-600">
                              ${request.prizeAmount.toLocaleString()} {request.prizeCurrency}
                            </p>
                          </div>
                        </div>
                        <CardTitle className="text-lg">
                          {request.contestTitle}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">{request.modelName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">
                              {new Date(request.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm font-semibold text-gray-700">Contact Info:</p>
                          <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                            {request.contactInfo}
                          </p>
                        </div>

                        {request.requestMessage && (
                          <div className="space-y-2">
                            <p className="text-sm font-semibold text-gray-700">Message:</p>
                            <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                              {request.requestMessage}
                            </p>
                          </div>
                        )}

                        {request.adminNotes && (
                          <div className="space-y-2">
                            <p className="text-sm font-semibold text-gray-700">Admin Notes:</p>
                            <p className="text-sm text-gray-600 bg-blue-50 p-2 rounded">
                              {request.adminNotes}
                            </p>
                          </div>
                        )}

                        <div className="flex gap-2 pt-2">
                          {request.status === "pending" && (
                            <>
                              <Button 
                                size="sm" 
                                className="flex-1 bg-blue-500 hover:bg-blue-600"
                                onClick={() => handleStatusUpdate(request, "processing")}
                                disabled={updateStatusMutation.isPending}
                              >
                                <AlertCircle className="h-4 w-4 mr-1" />
                                Start Processing
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleStatusUpdate(request, "rejected")}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                disabled={updateStatusMutation.isPending}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          
                          {request.status === "processing" && (
                            <Button 
                              size="sm" 
                              className="flex-1 bg-green-500 hover:bg-green-600"
                              onClick={() => handleStatusUpdate(request, "completed")}
                              disabled={updateStatusMutation.isPending}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Mark Completed
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card className="border-0 shadow-md">
                <CardContent className="p-12 text-center">
                  <Gift className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    No prize requests found
                  </h3>
                  <p className="text-gray-500">
                    {statusFilter !== "all" 
                      ? `No ${statusFilter} prize requests at the moment` 
                      : "No prize requests have been submitted yet"}
                  </p>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}