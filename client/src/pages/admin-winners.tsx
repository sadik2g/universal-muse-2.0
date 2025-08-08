// import { useState } from "react";
// import { motion } from "framer-motion";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { 
//   Crown, 
//   Eye, 
//   Trash2, 
//   Search,
//   Mail,
//   MapPin,
//   Calendar,
//   Trophy,
//   ChevronLeft,
//   ChevronRight,
//   Filter
// } from "lucide-react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Input } from "@/components/ui/input";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
// import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
// import { useToast } from "@/hooks/use-toast";
// import { apiRequest } from "@/lib/queryClient";
// import { fadeInUp } from "@/lib/animations";
// import AdminNav from "@/components/layout/admin-nav";

// interface Winner {
//   id: number;
//   contestTitle: string;
//   contestId: number;
//   modelName: string;
//   stageName: string;
//   email: string;
//   instagramHandle: string;
//   location: string;
//   winningVotes: number;
//   prizeAmount: number;
//   prizeCurrency: string;
//   contestEndDate: string;
//   profileImage: string;
//   bio: string;
//   dateOfBirth: string;
// }

// export default function AdminWinners() {
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedWinner, setSelectedWinner] = useState<Winner | null>(null);
//   const [showDetailsModal, setShowDetailsModal] = useState(false);
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 10;

//   const { toast } = useToast();
//   const queryClient = useQueryClient();

//   // Fetch winners data
//   const { data: winners, isLoading } = useQuery({
//     queryKey: ['/api/admin/winners'],
//     queryFn: async () => {
//       const response = await fetch('/api/admin/winners');
//       if (!response.ok) {
//         throw new Error('Failed to fetch winners');
//       }
//       return response.json();
//     },
//   });
// console.log(winners,"winners data");
//   // Delete winner mutation
//   const deleteWinnerMutation = useMutation({
//     mutationFn: async (winnerId: number) => {
//       return apiRequest(`/api/admin/winners/${winnerId}`, {
//         method: 'DELETE',
//       });
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['/api/admin/winners'] });
//       toast({
//         title: "Winner Deleted",
//         description: "Winner record has been successfully deleted.",
//       });
//     },
//     onError: (error: any) => {
//       toast({
//         title: "Delete Failed",
//         description: error.message || "Failed to delete winner record.",
//         variant: "destructive",
//       });
//     },
//   });

//   // Filter and paginate winners
//   const filteredWinners = winners?.filter((winner: Winner) =>
//     winner.modelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     winner.contestTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     winner.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     (winner.stageName && winner.stageName.toLowerCase().includes(searchTerm.toLowerCase()))
//   ) || [];

//   const totalPages = Math.ceil(filteredWinners.length / itemsPerPage);
//   const paginatedWinners = filteredWinners.slice(
//     (currentPage - 1) * itemsPerPage,
//     currentPage * itemsPerPage
//   );

//   const handleViewDetails = (winner: Winner) => {
//     setSelectedWinner(winner);
//     setShowDetailsModal(true);
//   };

//   const handleDeleteWinner = (winnerId: number) => {
//     deleteWinnerMutation.mutate(winnerId);
//   };

//   const formatCurrency = (amount: number, currency: string) => {
//     return new Intl.NumberFormat('en-US', {
//       style: 'currency',
//       currency: currency || 'USD',
//     }).format(amount / 100);
//   };

//   const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric'
//     });
//   };

//   return (
//     <div className="min-h-screen bg-gray-100">
//       <div className="p-8">
//           <motion.div
//             variants={fadeInUp}
//             initial="initial"
//             animate="animate"
//           >
//             <div className="flex items-center justify-between mb-8">
//               <div>
//                 <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
//                   <Crown className="text-yellow-500 w-8 h-8" />
//                   Contest Winners Management
//                 </h1>
//                 <p className="text-gray-600 mt-2">
//                   View and manage all contest winners and their details
//                 </p>
//               </div>

//               <div className="flex items-center gap-4">
//                 <div className="relative">
//                   <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
//                   <Input
//                     type="text"
//                     placeholder="Search winners, contests, emails..."
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                     className="pl-10 w-80"
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Stats Cards */}
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//               <Card>
//                 <CardContent className="p-6">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <p className="text-sm font-medium text-gray-600">Total Winners</p>
//                       <p className="text-3xl font-bold text-gray-900">{winners?.length || 0}</p>
//                     </div>
//                     <Crown className="h-12 w-12 text-yellow-500" />
//                   </div>
//                 </CardContent>
//               </Card>

//               <Card>
//                 <CardContent className="p-6">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <p className="text-sm font-medium text-gray-600">Total Prize Money</p>
//                       <p className="text-3xl font-bold text-gray-900">
//                         ${winners?.reduce((sum: number, winner: Winner) => sum + (winner.prizeAmount / 100), 0).toLocaleString() || 0}
//                       </p>
//                     </div>
//                     <Trophy className="h-12 w-12 text-green-500" />
//                   </div>
//                 </CardContent>
//               </Card>

//               <Card>
//                 <CardContent className="p-6">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <p className="text-sm font-medium text-gray-600">Active Contests</p>
//                       <p className="text-3xl font-bold text-gray-900">
//                         {winners?.filter((winner: Winner) => 
//                           new Date(winner.contestEndDate) > new Date()
//                         ).length || 0}
//                       </p>
//                     </div>
//                     <Calendar className="h-12 w-12 text-blue-500" />
//                   </div>
//                 </CardContent>
//               </Card>
//             </div>

//             {/* Winners Table */}
//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <Crown className="w-5 h-5 text-yellow-500" />
//                   Winners Directory ({filteredWinners.length})
//                 </CardTitle>
//               </CardHeader>
//               <CardContent>
//                 {isLoading ? (
//                   <div className="space-y-4">
//                     {Array.from({ length: 5 }).map((_, i) => (
//                       <div key={i} className="bg-gray-200 rounded-lg h-16 animate-pulse" />
//                     ))}
//                   </div>
//                 ) : filteredWinners.length === 0 ? (
//                   <div className="text-center py-12">
//                     <Crown className="mx-auto h-16 w-16 text-gray-400 mb-4" />
//                     <p className="text-lg font-medium text-gray-900 mb-2">No Winners Found</p>
//                     <p className="text-gray-600">
//                       {searchTerm ? "Try adjusting your search criteria" : "No contest winners recorded yet"}
//                     </p>
//                   </div>
//                 ) : (
//                   <>
//                     <div className="overflow-x-auto">
//                       <table className="w-full">
//                         <thead>
//                           <tr className="border-b border-gray-200">
//                             <th className="text-left py-3 px-4 font-medium text-gray-600">Winner</th>
//                             <th className="text-left py-3 px-4 font-medium text-gray-600">Contest</th>
//                             <th className="text-left py-3 px-4 font-medium text-gray-600">Prize</th>
//                             <th className="text-left py-3 px-4 font-medium text-gray-600">Votes</th>
//                             <th className="text-left py-3 px-4 font-medium text-gray-600">Date Won</th>
//                             <th className="text-left py-3 px-4 font-medium text-gray-600">Contact</th>
//                             <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {paginatedWinners.map((winner: Winner, index: number) => (
//                             <motion.tr
//                               key={winner.id}
//                               className="border-b border-gray-100 hover:bg-gray-50"
//                               variants={fadeInUp}
//                               transition={{ delay: index * 0.05 }}
//                             >
//                               <td className="py-4 px-4">
//                                 <div className="flex items-center gap-3">
//                                   <img
//                                     src={winner.profileImage}
//                                     alt={winner.modelName}
//                                     className="w-12 h-12 rounded-full object-cover"
//                                   />
//                                   <div>
//                                     <p className="font-medium text-gray-900">{winner.modelName}</p>
//                                     {winner.stageName && (
//                                       <p className="text-sm text-gray-600">@{winner.stageName}</p>
//                                     )}
//                                   </div>
//                                 </div>
//                               </td>
//                               <td className="py-4 px-4">
//                                 <p className="font-medium text-gray-900">{winner.contestTitle}</p>
//                                 <p className="text-sm text-gray-600">ID: {winner.contestId}</p>
//                               </td>
//                               <td className="py-4 px-4">
//                                 <p className="font-medium text-green-600">
//                                   {formatCurrency(winner.prizeAmount, winner.prizeCurrency)}
//                                 </p>
//                               </td>
//                               <td className="py-4 px-4">
//                                 <Badge variant="secondary">
//                                   {winner.winningVotes.toLocaleString()} votes
//                                 </Badge>
//                               </td>
//                               <td className="py-4 px-4">
//                                 <p className="text-gray-900">{formatDate(winner.contestEndDate)}</p>
//                               </td>
//                               <td className="py-4 px-4">
//                                 <div className="space-y-1">
//                                   <p className="text-sm text-gray-900">{winner.email}</p>
//                                   {winner.instagramHandle && (
//                                     <p className="text-sm text-gray-600">@{winner.instagramHandle}</p>
//                                   )}
//                                   {winner.location && (
//                                     <p className="text-sm text-gray-600">{winner.location}</p>
//                                   )}
//                                 </div>
//                               </td>
//                               <td className="py-4 px-4">
//                                 <div className="flex items-center gap-2">
//                                   <Button
//                                     variant="outline"
//                                     size="sm"
//                                     onClick={() => handleViewDetails(winner)}
//                                   >
//                                     <Eye className="w-4 h-4" />
//                                   </Button>

//                                   <AlertDialog>
//                                     <AlertDialogTrigger asChild>
//                                       <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
//                                         <Trash2 className="w-4 h-4" />
//                                       </Button>
//                                     </AlertDialogTrigger>
//                                     <AlertDialogContent>
//                                       <AlertDialogHeader>
//                                         <AlertDialogTitle>Delete Winner Record</AlertDialogTitle>
//                                         <AlertDialogDescription>
//                                           Are you sure you want to delete {winner.modelName}'s winner record for "{winner.contestTitle}"? 
//                                           This action cannot be undone.
//                                         </AlertDialogDescription>
//                                       </AlertDialogHeader>
//                                       <AlertDialogFooter>
//                                         <AlertDialogCancel>Cancel</AlertDialogCancel>
//                                         <AlertDialogAction
//                                           onClick={() => handleDeleteWinner(winner.id)}
//                                           className="bg-red-600 hover:bg-red-700"
//                                         >
//                                           Delete
//                                         </AlertDialogAction>
//                                       </AlertDialogFooter>
//                                     </AlertDialogContent>
//                                   </AlertDialog>
//                                 </div>
//                               </td>
//                             </motion.tr>
//                           ))}
//                         </tbody>
//                       </table>
//                     </div>

//                     {/* Pagination */}
//                     {totalPages > 1 && (
//                       <div className="flex items-center justify-between mt-6">
//                         <p className="text-sm text-gray-600">
//                           Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredWinners.length)} of {filteredWinners.length} results
//                         </p>
//                         <div className="flex items-center gap-2">
//                           <Button
//                             variant="outline"
//                             size="sm"
//                             onClick={() => setCurrentPage(currentPage - 1)}
//                             disabled={currentPage === 1}
//                           >
//                             <ChevronLeft className="w-4 h-4" />
//                             Previous
//                           </Button>
//                           <span className="text-sm text-gray-600">
//                             Page {currentPage} of {totalPages}
//                           </span>
//                           <Button
//                             variant="outline"
//                             size="sm"
//                             onClick={() => setCurrentPage(currentPage + 1)}
//                             disabled={currentPage === totalPages}
//                           >
//                             Next
//                             <ChevronRight className="w-4 h-4" />
//                           </Button>
//                         </div>
//                       </div>
//                     )}
//                   </>
//                 )}
//               </CardContent>
//             </Card>
//           </motion.div>
//         </div>

//       {/* Winner Details Modal */}
//       <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
//         <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
//           <DialogHeader>
//             <DialogTitle className="flex items-center gap-2">
//               <Crown className="w-5 h-5 text-yellow-500" />
//               Winner Details
//             </DialogTitle>
//           </DialogHeader>

//           {selectedWinner && (
//             <div className="space-y-6">
//               {/* Profile Section */}
//               <div className="flex items-start gap-4">
//                 <img
//                   src={selectedWinner.profileImage}
//                   alt={selectedWinner.modelName}
//                   className="w-24 h-24 rounded-full object-cover"
//                 />
//                 <div className="flex-1">
//                   <h3 className="text-xl font-bold text-gray-900">{selectedWinner.modelName}</h3>
//                   {selectedWinner.stageName && (
//                     <p className="text-lg text-gray-600">@{selectedWinner.stageName}</p>
//                   )}
//                   <div className="flex items-center gap-4 mt-2">
//                     <Badge className="bg-yellow-100 text-yellow-800">
//                       <Crown className="w-3 h-3 mr-1" />
//                       Contest Winner
//                     </Badge>
//                   </div>
//                 </div>
//               </div>

//               {/* Contest Information */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <h4 className="font-medium text-gray-900 mb-2">Contest Details</h4>
//                   <div className="space-y-2 text-sm">
//                     <p><span className="font-medium">Contest:</span> {selectedWinner.contestTitle}</p>
//                     <p><span className="font-medium">Contest ID:</span> {selectedWinner.contestId}</p>
//                     <p><span className="font-medium">Winning Votes:</span> {selectedWinner.winningVotes.toLocaleString()}</p>
//                     <p><span className="font-medium">Date Won:</span> {formatDate(selectedWinner.contestEndDate)}</p>
//                   </div>
//                 </div>

//                 <div>
//                   <h4 className="font-medium text-gray-900 mb-2">Prize Information</h4>
//                   <div className="space-y-2 text-sm">
//                     <p><span className="font-medium">Prize Amount:</span> 
//                       <span className="text-green-600 font-bold ml-1">
//                         {formatCurrency(selectedWinner.prizeAmount, selectedWinner.prizeCurrency)}
//                       </span>
//                     </p>
//                     <p><span className="font-medium">Currency:</span> {selectedWinner.prizeCurrency}</p>
//                   </div>
//                 </div>
//               </div>

//               {/* Contact Information */}
//               <div>
//                 <h4 className="font-medium text-gray-900 mb-3">Contact Information</h4>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div className="space-y-3">
//                     <div className="flex items-center gap-2">
//                       <Mail className="w-4 h-4 text-gray-600" />
//                       <span className="text-sm">{selectedWinner.email}</span>
//                     </div>
//                     {selectedWinner.instagramHandle && (
//                       <div className="flex items-center gap-2">
//                         <span className="text-sm text-gray-600">Instagram:</span>
//                         <span className="text-sm">@{selectedWinner.instagramHandle}</span>
//                       </div>
//                     )}
//                   </div>
//                   <div className="space-y-3">
//                     {selectedWinner.location && (
//                       <div className="flex items-center gap-2">
//                         <MapPin className="w-4 h-4 text-gray-600" />
//                         <span className="text-sm">{selectedWinner.location}</span>
//                       </div>
//                     )}
//                     {selectedWinner.dateOfBirth && (
//                       <div className="flex items-center gap-2">
//                         <Calendar className="w-4 h-4 text-gray-600" />
//                         <span className="text-sm">Born: {formatDate(selectedWinner.dateOfBirth)}</span>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>

//               {/* Bio */}
//               {selectedWinner.bio && (
//                 <div>
//                   <h4 className="font-medium text-gray-900 mb-2">Biography</h4>
//                   <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
//                     {selectedWinner.bio}
//                   </p>
//                 </div>
//               )}
//             </div>
//           )}
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }


import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function AdminWinnersPage() {
  const [contests, setContests] = useState<any[]>([]); // temporarily use any to inspect shape
  const { toast } = useToast();

  useEffect(() => {
    fetchWinners();
  }, []);

  const fetchWinners = async () => {
    try {
      const res = await apiRequest("/api/admin/winners");
      const data = await res.json();
      console.log("Fetched contests:", data);
      setContests(data);
    } catch (error) {
      console.error("Failed to fetch winners", error);
    }
  };

  const handleSetWinner = async (contestId: number): Promise<void> => {
    try {
      await apiRequest(`/api/admin/contests/${contestId}/set-winner`, {
        method: "POST",
      });
      toast({ title: "Winner Set Successfully" });
      fetchWinners();
    } catch (error) {
      console.error("Failed to set winner", error);
      toast({ title: "Error", description: "Failed to set winner." });
    }
  };
  console.log("contests:::", contests)
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Contest Winners</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contests?.map((c) => (
          <div key={c.contestId} className="p-4 bg-white shadow rounded-xl space-y-4">
            <h2 className="text-lg font-semibold">{c.contestTitle}</h2>
            <p>Status: {c.status || "N/A"}</p>

            {c?.winner ? (
              <div className="space-y-2">
                <p className="text-green-600 font-medium">
                  Winner: {c?.winner?.winner?.name || "Unknown"}
                </p>
                <img
                  src={c?.winner?.profileImage}
                  alt="winner"
                  className="w-20 h-20 rounded-full object-cover"
                />
              </div>
            ) : c?.topVotedModels?.length > 0 ? (
              <>
                {c?.topVotedModels?.map((model: any) => (
                  <div key={model.id} className="space-y-2">
                    <p className="text-gray-800 font-medium">
                      Top Model ID: {model.modelId} — Votes: {model.votes}
                    </p>
                    <img
                      src={model.photoUrl}
                      alt="Top Model"
                      className="w-full h-40 object-cover rounded-lg"
                    />
                    <Button
                      onClick={() => handleSetWinner(c.contestId)}
                      disabled={c?.winnerAnnouced}
                    >
                      Set Winner
                    </Button>
                  </div>
                ))}
              </>
            ) : (
              <p className="text-gray-500">No top models yet</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

