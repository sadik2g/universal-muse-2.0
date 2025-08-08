import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  Users,
  Trophy,
  Vote,
  Eye,
  ArrowUp,
  ArrowDown
} from "lucide-react";

interface AnalyticsData {
  totalVotes: number;
  dailyVotes: { date: string; votes: number }[];
  topContests: { id: string; title: string; votes: number; submissions: number }[];
  trafficSources: { source: string; visitors: number; percentage: number }[];
  userGrowth: { period: string; users: number }[];
  votesTrend: number; // percentage change
  submissionsTrend: number;
  usersTrend: number;
}

export default function AdminAnalytics() {
  const [timeRange, setTimeRange] = useState("7d");

  // Fetch analytics data
  const { data: analytics, isLoading } = useQuery<AnalyticsData>({
    queryKey: ["/api/admin/analytics", timeRange],
    staleTime: 5 * 60 * 1000, // 5 minutes
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

  const statCards = [
    {
      title: "Total Votes",
      value: analytics?.totalVotes || 0,
      icon: Vote,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
      trend: analytics?.votesTrend || 0
    },
    {
      title: "Active Contests",
      value: analytics?.topContests?.length || 0,
      icon: Trophy,
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
      trend: 12
    },
    {
      title: "Daily Submissions",
      value: analytics?.dailyVotes?.reduce((acc, day) => acc + day.votes, 0) || 0,
      icon: TrendingUp,
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
      trend: analytics?.submissionsTrend || 0
    },
    {
      title: "New Users",
      value: analytics?.userGrowth?.reduce((acc, period) => acc + period.users, 0) || 0,
      icon: Users,
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600",
      trend: analytics?.usersTrend || 0
    }
  ];

  const exportData = (format: "csv" | "pdf") => {
    // This would trigger a download of analytics data
    console.log(`Exporting data as ${format}`);
  };

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
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600 mt-1">Track performance and engagement metrics</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={timeRange === "7d" ? "default" : "outline"}
                onClick={() => setTimeRange("7d")}
                size="sm"
              >
                7 Days
              </Button>
              <Button
                variant={timeRange === "30d" ? "default" : "outline"}
                onClick={() => setTimeRange("30d")}
                size="sm"
              >
                30 Days
              </Button>
              <Button
                variant={timeRange === "90d" ? "default" : "outline"}
                onClick={() => setTimeRange("90d")}
                size="sm"
              >
                90 Days
              </Button>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {statCards.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  duration: 0.5, 
                  delay: 0.2 + index * 0.1,
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="group"
              >
                <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-full ${stat.bgColor}`}>
                        <stat.icon className={`h-6 w-6 ${stat.textColor}`} />
                      </div>
                      <div className={`flex items-center gap-1 text-xs ${stat.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {stat.trend >= 0 ? (
                          <ArrowUp className="h-3 w-3" />
                        ) : (
                          <ArrowDown className="h-3 w-3" />
                        )}
                        {Math.abs(stat.trend)}%
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        {stat.title}
                      </p>
                      <p className="text-3xl font-bold text-gray-900">
                        {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Daily Votes Chart */}
            <motion.div variants={itemVariants}>
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    Daily Votes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-end justify-between gap-2">
                    {analytics?.dailyVotes?.map((day, index) => (
                      <div key={day.date} className="flex-1 flex flex-col items-center">
                        <motion.div
                          className="bg-blue-500 w-full rounded-t"
                          initial={{ height: 0 }}
                          animate={{ height: `${(day.votes / Math.max(...analytics.dailyVotes.map(d => d.votes))) * 200}px` }}
                          transition={{ duration: 0.8, delay: index * 0.1 }}
                        />
                        <span className="text-xs text-gray-500 mt-2">
                          {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                        </span>
                      </div>
                    )) || (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <BarChart3 className="h-12 w-12" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Top Performing Contests */}
            <motion.div variants={itemVariants}>
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-600" />
                    Top Performing Contests
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics?.topContests?.slice(0, 5).map((contest, index) => (
                      <motion.div
                        key={contest.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 line-clamp-1">
                            {contest.title}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Active
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {(contest.submissions || 0).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">entries</p>
                        </div>
                      </motion.div>
                    )) || (
                      <div className="text-center py-8">
                        <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500">No contest data available</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Traffic Sources */}
          <motion.div variants={itemVariants}>
            <Card className="border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-green-600" />
                  Traffic Sources
                </CardTitle>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => exportData("csv")}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    CSV
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => exportData("pdf")}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    PDF
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {analytics?.trafficSources?.map((source, index) => (
                    <motion.div
                      key={source.source}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="text-center p-4 rounded-lg bg-gray-50"
                    >
                      <h4 className="font-medium text-gray-900 capitalize mb-2">
                        {source.source}
                      </h4>
                      <p className="text-2xl font-bold text-blue-600 mb-1">
                        {source.visitors.toLocaleString()}
                      </p>
                      <Badge variant="secondary">
                        {source.percentage}%
                      </Badge>
                    </motion.div>
                  )) || (
                    <div className="col-span-full text-center py-8">
                      <Eye className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">No traffic data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}