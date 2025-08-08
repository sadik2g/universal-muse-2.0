import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Trophy, 
  Upload, 
  Users, 
  Vote,
  Eye,
  CheckCircle,
  XCircle
} from "lucide-react";

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

export default function AdminDashboard() {
  const { user } = useAuth();

  // Fetch admin stats
  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const statCards = [
    {
      title: "Total Contests",
      value: stats?.totalContests || 0,
      icon: Trophy,
      color: "text-blue-600"
    },
    {
      title: "Total Submissions",
      value: stats?.totalSubmissions || 0,
      icon: Upload,
      color: "text-green-600"
    },
    // {
    //   title: "Total Votes",
    //   value: stats?.totalVotes || 0,
    //   icon: Vote,
    //   color: "text-purple-600"
    // },
    {
      title: "Active Contests",
      value: stats?.activeContests || 0,
      icon: Eye,
      color: "text-orange-600"
    },
    {
      title: "Pending Submissions",
      value: stats?.pendingSubmissions || 0,
      icon: CheckCircle,
      color: "text-yellow-600"
    },
    {
      title: "Approved Photos",
      value: stats?.approvedSubmissions || 0,
      icon: CheckCircle,
      color: "text-green-600"
    },
    {
      title: "Rejected Photos",
      value: stats?.rejectedSubmissions || 0,
      icon: XCircle,
      color: "text-red-600"
    },
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      icon: Users,
      color: "text-indigo-600"
    }
  ];

  if (statsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {user?.email}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {statCards.map((card, index) => (
            <Card key={index} className="border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg bg-gray-100 ${card.color}`}>
                    <card.icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}