import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Trophy, Users, Search, SortAsc, Camera } from "lucide-react";
import CountdownTimer from "@/components/ui/countdown-timer";
import PhotoSubmissionCard from "@/components/ui/photo-submission-card";
import SubmitPhotoModal from "@/components/modals/submit-photo-modal";
import DashboardNav from "@/components/layout/dashboard-nav";
import { useAuth } from "@/hooks/useAuth";
import { fadeInUp, staggerChildren } from "@/lib/animations";

export default function ContestDetail() {
  const { id } = useParams();
  const [location] = useLocation();
  const contestId = parseInt(id || "1");
  const [sortBy, setSortBy] = useState("votes");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  
  // Check if we're in dashboard context
  const isDashboardContext = location.startsWith('/dashboard/');

  const { data: contestData, isLoading } = useQuery({
    queryKey: ['/api/contests', contestId],
    queryFn: async () => {
      const response = await fetch(`/api/contests/${contestId}`);
      if (!response.ok) throw new Error('Contest not found');
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-20 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading contest...</p>
        </div>
      </div>
    );
  }

  if (!contestData) {
    return (
      <div className="min-h-screen pt-24 pb-20 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Contest Not Found</h1>
          <p className="text-gray-600">The contest you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const { contest, entries } = contestData;
  const isActive = new Date(contest.endDate) > new Date();

  const filteredAndSortedEntries = entries
    ?.filter((entry: any) => 
      entry.model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    ?.sort((a: any, b: any) => {
      switch (sortBy) {
        case "votes":
          return b.votes - a.votes;
        case "newest":
          return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
        case "alphabetical":
          return a.model.name.localeCompare(b.model.name);
        default:
          return b.votes - a.votes;
      }
    });

  return (
    <>
      {/* Show dashboard nav if in dashboard context */}
      {isDashboardContext && <DashboardNav />}
      
      <div className={`min-h-screen ${isDashboardContext ? 'pt-8' : 'pt-24'} pb-20 bg-gray-50`}>
      {/* Contest Header */}
      <section className="relative py-20 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={contest.image}
            alt={contest.title}
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/60 to-black/40"></div>
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            className="text-center text-white"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
          >
            <div className="inline-block mb-6">
              <Badge className={`px-4 py-2 text-lg font-bold ${
                isActive 
                  ? "bg-green-500 animate-pulse" 
                  : "bg-red-500"
              }`}>
                {isActive ? "LIVE CONTEST" : "CONTEST ENDED"}
              </Badge>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-black mb-6">
              {contest.title}
            </h1>
            
            <p className="text-xl text-gray-200 max-w-3xl mx-auto mb-8">
              {contest.description}
            </p>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Trophy className="text-white text-2xl" />
                </div>
                <h3 className="text-lg font-bold mb-2">Grand Prize</h3>
                <p className="text-gray-300">${isNaN(contest.prizeAmount) ? 0 : Number(contest.prizeAmount).toLocaleString()} {contest.prizeCurrency || 'USD'}</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-rose-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Users className="text-white text-2xl" />
                </div>
                <h3 className="text-lg font-bold mb-2">Participants</h3>
                <p className="text-gray-300">{isNaN(contest.entryCount) ? 0 : (contest.entryCount || 0)}</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Calendar className="text-white text-2xl" />
                </div>
                <h3 className="text-lg font-bold mb-2">End Date</h3>
                <p className="text-gray-300">{new Date(contest.endDate).toLocaleDateString()}</p>
              </div>
            </div>
            
            {/* Submit Photo Button for authenticated model users */}
            {user && user.userType === "model" && isActive && (
              <motion.div className="mb-8">
                <Button
                  onClick={() => setIsSubmitModalOpen(true)}
                  className="bg-white text-indigo-600 hover:bg-gray-100 font-semibold px-8 py-3 rounded-full text-lg shadow-lg cursor-pointer"
                  type="button"
                >
                  <Camera className="h-5 w-5 mr-2" />
                  Submit Your Photo
                </Button>
              </motion.div>
            )}



            {isActive && (
              <motion.div
                className="bg-black/30 backdrop-blur-lg rounded-2xl p-8 max-w-2xl mx-auto"
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                transition={{ delay: 0.3 }}
              >
                <h3 className="text-2xl font-bold mb-6">Contest Ends In:</h3>
                <CountdownTimer endDate={new Date(contest.endDate)} />
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Contest Entries - Hide for authenticated models */}
      {!(user && user.userType === "model") && (
        <section className="py-20">
          <div className="container mx-auto px-6">
          <motion.div
            className="flex flex-col md:flex-row justify-between items-center mb-12 gap-4"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
          >
            <h2 className="text-3xl font-bold text-gray-800">
              Photo Submissions ({entries?.length || 0})
            </h2>
            
            <div className="flex gap-4 w-full md:w-auto">
              {/* Search */}
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search photos and models..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SortAsc className="mr-2" size={20} />
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="votes">Most Voted</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="alphabetical">Alphabetical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </motion.div>
          
          {filteredAndSortedEntries && filteredAndSortedEntries.length > 0 ? (
            <motion.div
              className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
              variants={staggerChildren}
              initial="initial"
              animate="animate"
            >
              {filteredAndSortedEntries.map((entry: any, index: number) => (
                <PhotoSubmissionCard
                  key={entry.id}
                  entry={entry}
                  rank={index + 1}
                  contestId={contestId}
                  isActive={isActive}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              className="text-center py-20"
              variants={fadeInUp}
              initial="initial"
              animate="animate"
            >
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="text-gray-400 text-3xl" />
              </div>
              <h3 className="text-2xl font-bold text-gray-600 mb-4">
                {searchTerm ? "No models found" : "No entries yet"}
              </h3>
              <p className="text-gray-500">
                {searchTerm 
                  ? "Try adjusting your search terms."
                  : "Be the first to enter this contest!"
                }
              </p>
            </motion.div>
          )}
          </div>
        </section>
      )}

      {/* Submit Photo Modal - Always render for debugging */}
      <SubmitPhotoModal 
        isOpen={isSubmitModalOpen} 
        onClose={() => setIsSubmitModalOpen(false)}
        contest={contest || { id: contestId, title: "Loading...", prizeAmount: 0, endDate: new Date() }}
      />
      </div>
    </>
  );
}
