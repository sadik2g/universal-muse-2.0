import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  AlertTriangle, 
  Flag, 
  MessageSquare, 
  XCircle, 
  CheckCircle, 
  Clock, 
  User,
  Search,
  Eye,
  Filter,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Complaint {
  id: string;
  reporterName: string;
  reporterEmail: string;
  type: string;
  subject: string;
  description: string;
  targetType: string;
  targetId: string;
  targetName: string;
  status: "new" | "investigating" | "resolved" | "dismissed";
  priority: "low" | "medium" | "high";
  createdAt: string;
  updatedAt: string;
  adminNotes?: string;
}

interface ComplaintsResponse {
  complaints: Complaint[];
  total: number;
  page: number;
  totalPages: number;
}

export default function AdminComplaints() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch complaints with pagination
  const { data: complaintsResponse, isLoading: complaintsLoading } = useQuery<ComplaintsResponse>({
    queryKey: ["/api/admin/complaints", statusFilter, priorityFilter, currentPage],
    queryFn: () => {
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== "all") {
        params.append("status", statusFilter);
      }
      if (priorityFilter && priorityFilter !== "all") {
        params.append("priority", priorityFilter);
      }
      params.append("page", currentPage.toString());
      params.append("limit", "10");
      
      const url = `/api/admin/complaints?${params.toString()}`;
      return fetch(url).then(res => res.json());
    },
    staleTime: 30 * 1000,
  });

  // Update complaint status mutation
  const updateComplaintMutation = useMutation({
    mutationFn: ({ complaintId, status, notes }: { 
      complaintId: string; 
      status: string; 
      notes?: string; 
    }) => apiRequest(`/api/admin/complaints/${complaintId}`, {
      method: "PUT",
      body: JSON.stringify({ status, adminNotes: notes }),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/complaints"] });
      setSelectedComplaint(null);
      setAdminNotes("");
      toast({
        title: "Success",
        description: "Complaint updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update complaint",
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-red-100 text-red-800 border-red-200";
      case "investigating":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "resolved":
        return "bg-green-100 text-green-800 border-green-200";
      case "dismissed":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "inappropriate_content":
        return <Flag className="h-4 w-4" />;
      case "harassment":
        return <AlertTriangle className="h-4 w-4" />;
      case "spam":
        return <XCircle className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const handleUpdateStatus = (status: string) => {
    if (selectedComplaint) {
      updateComplaintMutation.mutate({
        complaintId: selectedComplaint.id,
        status,
        notes: adminNotes || undefined,
      });
    }
  };

  const complaints = complaintsResponse?.complaints || [];
  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = complaint.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.reporterName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  if (complaintsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="bg-gradient-to-r from-red-600 to-pink-600 rounded-lg p-8 text-white">
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle className="h-8 w-8" />
                <h1 className="text-3xl font-bold">Complaints & Contact Management</h1>
              </div>
              <p className="text-red-100">
                Manage user complaints and contact form submissions in one place
              </p>
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div variants={itemVariants} className="mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Search</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search complaints..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Status</Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="investigating">Investigating</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="dismissed">Dismissed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Priority</Label>
                    <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Priority</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Actions</Label>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchTerm("");
                        setStatusFilter("all");
                        setPriorityFilter("all");
                        setCurrentPage(1);
                      }}
                      className="w-full"
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      Reset Filters
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Complaints List */}
          <motion.div variants={itemVariants}>
            {filteredComplaints.length > 0 ? (
              <div className="space-y-4">
                {filteredComplaints.map((complaint, index) => (
                  <motion.div
                    key={complaint.id}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="p-2 rounded-lg bg-gray-100">
                                {getTypeIcon(complaint.type)}
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg text-gray-900">
                                  {complaint.subject}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  From: {complaint.reporterName} ({complaint.reporterEmail})
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <Badge className={getPriorityColor(complaint.priority)}>
                                  {complaint.priority.charAt(0).toUpperCase() + complaint.priority.slice(1)}
                                </Badge>
                                <Badge className={getStatusColor(complaint.status)}>
                                  {complaint.status.charAt(0).toUpperCase() + complaint.status.slice(1)}
                                </Badge>
                              </div>
                            </div>
                            <p className="text-gray-700 mb-3 line-clamp-2">
                              {complaint.description}
                            </p>
                            <div className="flex items-center justify-between text-sm text-gray-500">
                              <span>
                                Target: {complaint.targetName} ({complaint.targetType})
                              </span>
                              <span>
                                {new Date(complaint.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedComplaint(complaint)}
                            className="ml-4"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No complaints found</h3>
                  <p className="text-gray-600">
                    No complaints match your current filters.
                  </p>
                </CardContent>
              </Card>
            )}
          </motion.div>

          {/* Pagination */}
          {complaintsResponse && complaintsResponse.totalPages > 1 && (
            <motion.div variants={itemVariants} className="mt-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, complaintsResponse.total)} of {complaintsResponse.total} complaints
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: complaintsResponse.totalPages }, (_, i) => i + 1).map((page) => (
                          <Button
                            key={page}
                            variant={page === currentPage ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(page)}
                            className="w-8 h-8 p-0"
                          >
                            {page}
                          </Button>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === complaintsResponse.totalPages}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Complaint Details Modal */}
          {selectedComplaint && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedComplaint(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-red-100">
                        {getTypeIcon(selectedComplaint.type)}
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">Complaint Details</h2>
                        <p className="text-sm text-gray-500">
                          Submitted on {new Date(selectedComplaint.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getPriorityColor(selectedComplaint.priority)}>
                        {selectedComplaint.priority.charAt(0).toUpperCase() + selectedComplaint.priority.slice(1)}
                      </Badge>
                      <Badge className={getStatusColor(selectedComplaint.status)}>
                        {selectedComplaint.status.charAt(0).toUpperCase() + selectedComplaint.status.slice(1)}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Reporter</h3>
                      <p className="text-gray-700">{selectedComplaint.reporterName}</p>
                      <p className="text-gray-600">{selectedComplaint.reporterEmail}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Target</h3>
                      <p className="text-gray-700">{selectedComplaint.targetName}</p>
                      <p className="text-gray-600">Type: {selectedComplaint.targetType}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Subject</h3>
                    <p className="text-gray-700">{selectedComplaint.subject}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700 whitespace-pre-wrap">{selectedComplaint.description}</p>
                    </div>
                  </div>

                  {selectedComplaint.adminNotes && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Admin Notes</h3>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-blue-900">{selectedComplaint.adminNotes}</p>
                      </div>
                    </div>
                  )}

                  <div>
                    <Label className="text-sm font-medium mb-2 block">Add Admin Notes</Label>
                    <Textarea
                      placeholder="Add notes about this complaint..."
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>

                  <div className="flex gap-3 pt-4 border-t">
                    {selectedComplaint.status === "new" && (
                      <Button 
                        className="bg-yellow-500 hover:bg-yellow-600 text-white"
                        onClick={() => handleUpdateStatus("investigating")}
                        disabled={updateComplaintMutation.isPending}
                      >
                        <Clock className="h-4 w-4 mr-1" />
                        Start Investigation
                      </Button>
                    )}
                    {selectedComplaint.status === "investigating" && (
                      <>
                        <Button 
                          className="bg-green-500 hover:bg-green-600 text-white"
                          onClick={() => handleUpdateStatus("resolved")}
                          disabled={updateComplaintMutation.isPending}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Mark Resolved
                        </Button>
                        <Button 
                          className="bg-gray-500 hover:bg-gray-600 text-white"
                          onClick={() => handleUpdateStatus("dismissed")}
                          disabled={updateComplaintMutation.isPending}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Dismiss
                        </Button>
                      </>
                    )}
                    <Button 
                      variant="outline"
                      onClick={() => setSelectedComplaint(null)}
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}