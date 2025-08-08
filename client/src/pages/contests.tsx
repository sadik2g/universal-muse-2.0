import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Trophy, Filter } from "lucide-react";
import ContestCard from "@/components/ui/contest-card";
import { fadeInUp, staggerChildren } from "@/lib/animations";

export default function Contests() {
  const [activeFilter, setActiveFilter] = useState("active");

  const { data: contests, isLoading } = useQuery({
    queryKey: ['/api/contests'],
  });

  const filters = [
    { id: "active", label: "Active" },
    { id: "upcoming", label: "Upcoming" },
    { id: "ended", label: "Ended" },
  ];

  const filteredContests = contests?.filter((contest: any) => {
    const now = new Date();
    const startDate = new Date(contest.startDate);
    const endDate = new Date(contest.endDate);
    
    const isActive = endDate > now && startDate <= now;
    const isUpcoming = startDate > now;
    const isEnded = endDate <= now;

    switch (activeFilter) {
      case "active":
        return isActive || contest.status === "active";
      case "upcoming":
        return isUpcoming || contest.status === "upcoming";
      case "ended":
        return isEnded || contest.status === "completed";
      default:
        return true;
    }
  });

  return (
    <div className="min-h-screen pt-24 pb-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          variants={fadeInUp}
          initial="initial"
          animate="animate"
        >
          <h1 className="text-4xl md:text-5xl font-black text-gray-800 mb-6">
            <Trophy className="inline text-amber-500 mr-3" />
            Active Contests
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Join the excitement and vote for your favorites in these ongoing contests
          </p>
          
          {/* Contest Filters */}
          <motion.div
            className="flex flex-wrap justify-center gap-4 mb-8"
            variants={staggerChildren}
            initial="initial"
            animate="animate"
          >
            {filters.map((filter) => (
              <motion.div key={filter.id} variants={fadeInUp}>
                <Button
                  onClick={() => setActiveFilter(filter.id)}
                  className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
                    activeFilter === filter.id
                      ? "bg-indigo-500 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {filter.label}
                </Button>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
        
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-96 animate-pulse" />
            ))}
          </div>
        ) : filteredContests && filteredContests.length > 0 ? (
          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerChildren}
            initial="initial"
            animate="animate"
          >
            {filteredContests.map((contest: any, index: number) => (
              <motion.div
                key={contest.id}
                variants={fadeInUp}
                transition={{ delay: index * 0.1 }}
              >
                <ContestCard contest={contest} />
              </motion.div>
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
              <Filter className="text-gray-400 text-3xl" />
            </div>
            <h3 className="text-2xl font-bold text-gray-600 mb-4">
              No contests found
            </h3>
            <p className="text-gray-500">
              Try changing your filter or check back later for new contests.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
