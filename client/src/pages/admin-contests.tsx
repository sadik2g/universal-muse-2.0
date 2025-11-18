import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Trophy,
  Plus,
  Edit,
  Trash2,
  Search,
  Calendar,
  Users,
  Eye,
  Clock,
  Filter,
  Info,
  Crown
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import CreateContestModal from "@/components/modals/create-contest-modal";
import EditContestModal from "@/components/modals/edit-contest-modal";
import ViewContestModal from "@/components/modals/view-contest-modal";
import DeleteContestModal from "@/components/modals/delete-contest-modal";

interface Contest {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  prizeAmount: number;
  submissionCount: number;
  status: "draft" | "active" | "ended" | "completed";
  createdAt: string;
}

export default function AdminContests() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedContest, setSelectedContest] = useState<Contest | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch contests
  const { data: contests, isLoading } = useQuery<Contest[]>({
    queryKey: ["/api/admin/contests"],
    staleTime: 2 * 60 * 1000,
  });

  const handleViewContest = (contest: Contest) => {
    setSelectedContest(contest);
    setIsViewModalOpen(true);
  };

  const handleEditContest = (contest: Contest) => {
    setSelectedContest(contest);
    setIsEditModalOpen(true);
  };

  const handleDeleteContest = (contest: Contest) => {
    setSelectedContest(contest);
    setIsDeleteModalOpen(true);
  };

  // Set contest winner mutation
  const setWinnerMutation = useMutation({
    mutationFn: async (contestId: string) => {
      return await apiRequest(`/api/admin/contests/${contestId}/set-winner`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/contests"] });
      toast({
        title: "Success",
        description: "Contest winner has been set successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to set contest winner. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSetWinner = (contest: Contest) => {
    if (contest.status !== 'completed' && contest.status !== 'ended') {
      toast({
        title: "Cannot Set Winner",
        description: "Contest must be completed before setting a winner",
        variant: "destructive",
      });
      return;
    }
    
    setWinnerMutation.mutate(contest.id);
  };

  const closeAllModals = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setIsViewModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedContest(null);
  };

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

  const filteredContests = contests?.filter(contest => {
    const matchesSearch = contest.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contest.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || contest.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "ended":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "draft":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const updateContestMutation = useMutation({
  mutationFn: async (contest: any) => {
    const updatedContest = {
      title: contest.title,
      description: contest.description,
      startDate: new Date(contest.startDate).toISOString(),
      endDate: new Date(contest.endDate).toISOString(),
      prizeAmount: contest.prizeAmount,
      maxParticipants: contest.maxParticipants,
      bannerImage: contest.bannerImage,
      status: "completed", // override status to completed
      prizeCurrency: contest.prizeCurrency || "USD",
    };

    return await apiRequest(`/api/admin/contests/${contest.id}`, {
      method: "PUT",
      body: JSON.stringify(updatedContest),
    });
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["/api/admin/contests"] });
  },
});

useEffect(() => {
  if (!contests) return;

  const now = new Date();

  contests.forEach((contest) => {
    const hasEnded = new Date(contest.endDate) < now;
    if (hasEnded && contest.status !== "completed") {
      updateContestMutation.mutate({ ...contest, status: "completed" });
    }
  });
}, [contests]);


  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
              <h1 className="text-3xl font-bold text-gray-900">Manage Contests</h1>
              <p className="text-gray-600 mt-1">Create, edit, and manage photo contests</p>
            </div>
            <Button 
              className="bg-blue-500 hover:bg-blue-600 text-white"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Contest
            </Button>
          </motion.div>

          {/* Single Active Contest Notice */}
          <motion.div variants={itemVariants}>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <Info className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Single Active Contest Policy
                  </h3>
                  <p className="mt-1 text-sm text-blue-700">
                    Only one contest can be active at any time to ensure focused voting. New contests are created as "upcoming" 
                    and can be activated later. When you activate a contest, all other active contests will be automatically set to "completed" status.
                  </p>
                </div>
              </div>
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
                        placeholder="Search contests..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={statusFilter === "all" ? "default" : "outline"}
                      onClick={() => setStatusFilter("all")}
                      size="sm"
                    >
                      All
                    </Button>
                    <Button
                      variant={statusFilter === "active" ? "default" : "outline"}
                      onClick={() => setStatusFilter("active")}
                      size="sm"
                    >
                      Active
                    </Button>
                    <Button
                      variant={statusFilter === "ended" ? "default" : "outline"}
                      onClick={() => setStatusFilter("ended")}
                      size="sm"
                    >
                      Ended
                    </Button>
                    <Button
                      variant={statusFilter === "draft" ? "default" : "outline"}
                      onClick={() => setStatusFilter("draft")}
                      size="sm"
                    >
                      Draft
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Contests Grid */}
          <motion.div variants={itemVariants}>
            {filteredContests.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredContests.map((contest, index) => (
                  <motion.div
                    key={contest.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                  >
                    <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <Trophy className="h-6 w-6 text-yellow-500" />
                          <Badge className={getStatusColor(contest.status)}>
                            {contest.status.charAt(0).toUpperCase() + contest.status.slice(1)}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg line-clamp-2">
                          {contest.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {contest.description}
                        </p>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">
                              {new Date(contest.startDate).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">
                              {new Date(contest.endDate).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">
                              {contest.submissionCount} entries
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Trophy className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">
                              ${contest.prizeAmount?.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => handleViewContest(contest)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => handleEditContest(contest)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>

                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteContest(contest)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card className="border-0 shadow-md">
                <CardContent className="p-12 text-center">
                  <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    No contests found
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm || statusFilter !== "all" 
                      ? "Try adjusting your search or filters" 
                      : "Create your first contest to get started"}
                  </p>
                  {!searchTerm && statusFilter === "all" && (
                    <Button 
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                      onClick={() => setIsCreateModalOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Contest
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </motion.div>
        </motion.div>
      </div>

      {/* Create Contest Modal */}
      <CreateContestModal 
        isOpen={isCreateModalOpen} 
        onClose={closeAllModals} 
      />

      {/* Edit Contest Modal */}
      <EditContestModal 
        isOpen={isEditModalOpen} 
        onClose={closeAllModals}
        contest={selectedContest}
      />

      {/* View Contest Modal */}
      <ViewContestModal 
        isOpen={isViewModalOpen} 
        onClose={closeAllModals}
        contest={selectedContest}
      />

      {/* Delete Contest Modal */}
      <DeleteContestModal 
        isOpen={isDeleteModalOpen} 
        onClose={closeAllModals}
        contest={selectedContest}
      />
    </div>
  );
}