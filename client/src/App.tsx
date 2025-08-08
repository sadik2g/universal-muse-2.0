import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { useAuth } from "@/hooks/useAuth";
import Home from "@/pages/home";
import Contests from "@/pages/contests";
import ContestDetail from "@/pages/contest-detail";
import Leaderboard from "@/pages/leaderboard";
import BuyVotes from "@/pages/buy-votes";
import About from "@/pages/about";
import FAQ from "@/pages/faq";
import Contact from "@/pages/contact";
import Dashboard from "@/pages/dashboard";
import DashboardContests from "@/pages/dashboard-contests";
import DashboardSubmissions from "@/pages/dashboard-submissions";
import MySubmissions from "@/pages/my-submissions";
import ProfileSettings from "@/pages/profile-settings";

// Admin components
import AdminDashboard from "@/pages/admin-dashboard";
import AdminContests from "@/pages/admin-contests";
import AdminModerate from "@/pages/admin-moderate";
import AdminAnalytics from "@/pages/admin-analytics";
import AdminComplaints from "@/pages/admin-complaints";
import AdminSettings from "@/pages/admin-settings";
import AdminPrizeRequests from "@/pages/admin-prize-requests";
import AdminWinners from "@/pages/admin-winners";
import AdminNav from "@/components/layout/admin-nav";

import NotFound from "@/pages/not-found";
import CheckoutSuccess from "./pages/paymentSuccess";
import CheckoutFailed from "./pages/paymentFail";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const isAdmin = user?.userType === "admin";

  return (
    <div className="min-h-screen bg-background">
      {/* Only show navbar when user is not authenticated */}
      {!isAuthenticated && !isLoading && <Navbar />}

      <main className={isAuthenticated && !isLoading ? "min-h-screen" : ""}>
        {isLoading ? (
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your account...</p>
            </div>
          </div>
        ) : isAuthenticated && isAdmin ? (
          // Admin routes - admin panel layout
          <>
            <AdminNav />
            <main className="xl:ml-80">
              <Switch>
                <Route path="/" component={AdminDashboard} />
                <Route path="/admin" component={AdminDashboard} />
                <Route path="/admin/contests" component={AdminContests} />
                <Route path="/admin/moderate" component={AdminModerate} />
                <Route path="/admin/analytics" component={AdminAnalytics} />
                <Route path="/admin/complaints" component={AdminComplaints} />
                <Route path="/admin/prize-requests" component={AdminPrizeRequests} />
                <Route path="/admin/winners" component={AdminWinners} />
                <Route path="/admin/settings" component={AdminSettings} />
                <Route component={NotFound} />
              </Switch>
            </main>
          </>
        ) : isAuthenticated ? (
          // Model routes - dashboard layout
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/dashboard/contests" component={DashboardContests} />
            <Route path="/dashboard/contests/:id" component={ContestDetail} />
            <Route path="/dashboard/mysubmissions" component={MySubmissions} />
            <Route path="/dashboard/buy-votes" component={BuyVotes} />
            <Route path="/dashboard/profileSettings" component={ProfileSettings} />
            <Route path="/dashboard/success" component={CheckoutSuccess} />
            <Route path="/dashboard/fail" component={CheckoutFailed} />
            <Route component={NotFound} />
          </Switch>
        ) : (
          // Public routes
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/contests" component={Contests} />
            <Route path="/contests/:id" component={ContestDetail} />
            <Route path="/leaderboard" component={Leaderboard} />
            <Route path="/buy-votes" component={BuyVotes} />
            <Route path="/about" component={About} />
            <Route path="/faq" component={FAQ} />
            <Route path="/contact" component={Contact} />
            <Route component={NotFound} />
          </Switch>
        )}
      </main>

      {/* Only show footer when user is not authenticated */}
      {!isAuthenticated && !isLoading && <Footer />}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
