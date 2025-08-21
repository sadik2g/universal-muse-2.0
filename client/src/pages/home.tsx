import { useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Crown, Star, Trophy, Heart, Search, Eye, Flame, Calendar, Users, WandSparkles } from "lucide-react";
import CountdownTimer from "@/components/ui/countdown-timer";
import ModelCard from "@/components/ui/model-card";
import AnimatedCounter from "@/components/ui/animated-counter";
import { fadeInUp, staggerChildren, floatingAnimation } from "@/lib/animations";
import { ASSETS_URL } from "@/var";

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  const { data: topModels, isLoading: modelsLoading } = useQuery({
    queryKey: ['/api/models/top'],
    queryFn: async () => {
      const response = await fetch('/api/models/top?limit=10');
      if (!response.ok) {
        throw new Error('Failed to fetch top models');
      }
      return response.json();
    },
  });

  const { data: contests } = useQuery({
    queryKey: ['/api/contests'],
    queryFn: async () => {
      const response = await fetch('/api/contests');
      return response.json();
    },
  });

  // Filter to show only active or upcoming contests, sorted by date
  const activeOrUpcomingContests = Array.isArray(contests)
    ? contests.filter(contest => {
      const now = new Date();
      const endDate = new Date(contest.endDate);
      const startDate = new Date(contest.startDate);

      // Show if contest is active (started but not ended) or upcoming (hasn't started yet)
      return (startDate <= now && endDate > now) || (startDate > now);
    }).sort((a, b) => {
      // Sort by start date, showing active contests first, then upcoming
      const now = new Date();
      const aStart = new Date(a.startDate);
      const bStart = new Date(b.startDate);
      const aEnd = new Date(a.endDate);
      const bEnd = new Date(b.endDate);

      // Active contests (currently running) come first
      const aIsActive = aStart <= now && aEnd > now;
      const bIsActive = bStart <= now && bEnd > now;

      if (aIsActive && !bIsActive) return -1;
      if (!aIsActive && bIsActive) return 1;

      // Both active or both upcoming - sort by start date (earliest first)
      return aStart.getTime() - bStart.getTime();
    })
    : [];
  console.log("Active or Upcoming Contests:", activeOrUpcomingContests);
  const featuredContest = activeOrUpcomingContests.length > 0 ? activeOrUpcomingContests[0] : null;

  // Redirect authenticated users to dashboard after all hooks are called
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, isLoading, setLocation]);

  // Don't render home page if authenticated
  if (isAuthenticated && !isLoading) {
    return <div>Redirecting...</div>;
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen hero-bg flex items-center justify-center">
        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[Heart, Star, Crown, Trophy].map((Icon, index) => (
            <motion.div
              key={index}
              className="absolute text-4xl"
              style={{
                top: `${20 + index * 20}%`,
                left: `${10 + index * 20}%`,
                color: ['#EC4899', '#6366F1', '#F59E0B', '#EC4899'][index],
              }}
              variants={floatingAnimation}
              animate="animate"
              transition={{ delay: index * 0.5 }}
            >
              <Icon size={32} />
            </motion.div>
          ))}
        </div>

        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-black text-white mb-4 sm:mb-6 px-4"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
          >
            Vote for Your{" "}
            <span className="bg-gradient-to-r from-pink-400 to-amber-400 bg-clip-text text-transparent">
              Favorite Models
            </span>
          </motion.h1>

          <motion.p
            className="text-lg sm:text-xl md:text-2xl text-gray-200 mb-8 sm:mb-12 max-w-3xl mx-auto px-4 text-center"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.3 }}
          >
            Join the ultimate modeling contest platform. Vote daily, discover talent, and watch your favorites climb the leaderboard.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center px-4"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.6 }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto"
            >
              <Link href="/contests">
                <div className="w-full sm:w-auto bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 sm:px-12 py-3 sm:py-4 rounded-full text-base sm:text-lg font-bold shadow-2xl hover:shadow-indigo-500/50 cursor-pointer flex items-center justify-center">
                  <Search className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden sm:inline">Explore Contests</span>
                  <span className="sm:hidden">Explore</span>
                </div>
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto"
            >
              <Link href="/leaderboard">
                <div className="w-full sm:w-auto glass-effect text-white px-8 sm:px-12 py-3 sm:py-4 rounded-full text-base sm:text-lg font-bold border border-white/20 hover:bg-white/20 shadow-2xl cursor-pointer flex items-center justify-center">
                  <Trophy className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden sm:inline">View Leaderboard</span>
                  <span className="sm:hidden">Leaderboard</span>
                </div>
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="text-white text-2xl opacity-75">↓</div>
        </motion.div>
      </section>

      {/* Top Models Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center mb-16"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-black text-gray-800 mb-6">
              <Star className="inline text-amber-400 mr-3" />
              Top Performing Models
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Meet the current leaders dominating the contest rankings
            </p>
          </motion.div>

          {modelsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-2xl h-96 animate-pulse" />
              ))}
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
              variants={staggerChildren}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              {topModels?.map((model: any, index: number) => (
                <motion.div
                  key={model.id}
                  variants={fadeInUp}
                  transition={{ delay: index * 0.1 }}
                >
                  <ModelCard
                    model={model}
                    rank={index + 1}
                    activeOrUpcomingContests={activeOrUpcomingContests}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Featured Contest Section */}
      {featuredContest && featuredContest.status !== "completed" ? (
        <section className="py-20 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
          {/* Background elements */}
          <div className="absolute inset-0 opacity-20">
            <motion.div
              className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-pink-400 to-purple-600 rounded-full filter blur-3xl"
              animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
              transition={{ duration: 20, repeat: Infinity }}
            />
            <motion.div
              className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-br from-indigo-400 to-blue-600 rounded-full filter blur-3xl"
              animate={{ scale: [1.2, 1, 1.2], rotate: [360, 180, 0] }}
              transition={{ duration: 15, repeat: Infinity }}
            />
          </div>

          <div className="container mx-auto px-6 relative z-10">
            <motion.div
              className="text-center mb-16"
              variants={fadeInUp}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              <div className="inline-block bg-gradient-to-r from-amber-400 to-orange-500 text-white px-6 py-2 rounded-full font-bold mb-6">
                <Flame className="inline mr-2" />
                FEATURED CONTEST
              </div>
              <h2 className="text-5xl md:text-6xl font-black text-white mb-6">
                {featuredContest.title}
              </h2>
              <p className="text-xl text-gray-200 max-w-3xl mx-auto mb-12">
                {featuredContest.description}
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Contest Image */}
              <motion.div
                className="relative"
                variants={fadeInUp}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
              >
                <img
                  src={`${ASSETS_URL}${featuredContest.image}`}
                  alt="Fashion runway contest banner"
                  className="rounded-3xl shadow-2xl hover:scale-105 transition-transform duration-500"
                />

                <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl p-6 shadow-2xl">
                  <div className="text-center">
                    <div className="text-3xl font-black text-indigo-600 mb-2">
                      <AnimatedCounter value={featuredContest.entryCount || 0} suffix="" />
                    </div>
                    <div className="text-sm text-gray-600">Participants</div>
                  </div>
                </div>
              </motion.div>

              {/* Contest Details */}
              <motion.div
                className="text-white"
                variants={fadeInUp}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
              >
                {/* Countdown Timer */}
                <div className="bg-black/30 backdrop-blur-lg rounded-2xl p-8 mb-8">
                  <h3 className="text-2xl font-bold mb-6 text-center">Contest Ends In:</h3>
                  <CountdownTimer
                    endDate={new Date(featuredContest.endDate)}
                    className="grid-cols-4 gap-4"
                  />
                </div>

                {/* Contest Info */}
                <div className="space-y-6 mb-8">
                  <motion.div
                    className="flex items-center space-x-4"
                    whileHover={{ x: 10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="w-12 h-12 bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
                      <Trophy className="text-white text-xl" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">Grand Prize</h4>
                      <p className="text-gray-300">${isNaN(featuredContest.prizeAmount) ? 0 : Number(featuredContest.prizeAmount).toLocaleString()} {featuredContest.prizeCurrency || 'USD'}</p>
                    </div>
                  </motion.div>

                  <motion.div
                    className="flex items-center space-x-4"
                    whileHover={{ x: 10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-rose-500 rounded-xl flex items-center justify-center">
                      <Users className="text-white text-xl" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">Total Votes Cast</h4>
                      <p className="text-gray-300">
                        <AnimatedCounter value={featuredContest.totalVotes || 0} suffix=" votes" />
                      </p>
                    </div>
                  </motion.div>

                  <motion.div
                    className="flex items-center space-x-4"
                    whileHover={{ x: 10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="w-12 h-12 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-xl flex items-center justify-center">
                      <Calendar className="text-white text-xl" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">Registration Deadline</h4>
                      <p className="text-gray-300">
                        {new Date(featuredContest.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </motion.div>
                </div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link href={`/contests/${featuredContest.id}`}>
                    <div className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-black font-bold py-4 px-8 rounded-xl text-lg shadow-2xl cursor-pointer flex items-center justify-center">
                      <Eye className="mr-3" />
                      View Contest Details
                    </div>
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>
      ) : (
        // No Active Contests Message
        <section className="py-20 bg-gradient-to-br from-gray-100 to-gray-200">
          <div className="container mx-auto px-6 text-center">
            <motion.div
              variants={fadeInUp}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              <Calendar className="mx-auto mb-6 text-6xl text-gray-400" />
              <h2 className="text-4xl font-bold text-gray-800 mb-4">
                No Active Contests Right Now
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
                All current contests have ended. Stay tuned for exciting new contests coming soon!
              </p>
              <Link href="/contests">
                <div className="inline-block bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform cursor-pointer">
                  View All Contests
                </div>
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center mb-16"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-black text-gray-800 mb-6">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get started in just three simple steps
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-12"
            variants={staggerChildren}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              {
                step: 1,
                title: "Browse Contests",
                description: "Discover amazing modeling contests featuring talented participants from around the world. Filter by category, prizes, and timeline.",
                gradient: "from-indigo-500 to-purple-600"
              },
              {
                step: 2,
                title: "Vote Daily",
                description: "Cast your votes for your favorite models every day. Each vote counts towards their ranking and helps them climb the leaderboard.",
                gradient: "from-pink-500 to-rose-600"
              },
              {
                step: 3,
                title: "Watch Rankings",
                description: "Follow the live leaderboards and see real-time updates as your favorite models compete for the top positions and amazing prizes.",
                gradient: "from-amber-500 to-orange-600"
              }
            ].map((item) => (
              <motion.div
                key={item.step}
                className="text-center group"
                variants={fadeInUp}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className={`w-24 h-24 bg-gradient-to-br ${item.gradient} rounded-full flex items-center justify-center mx-auto mb-6 text-white text-3xl font-bold group-hover:scale-110 transition-transform duration-300`}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  {item.step}
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
