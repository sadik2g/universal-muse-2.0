import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DashboardNav from "@/components/layout/dashboard-nav";
import {
  Crown,
  Gem,
  Award,
  Star,
  Sparkles,
  Check,
  ArrowRight,
  CreditCard,
  ShoppingCart,
  Trophy
} from "lucide-react";

interface VotePackage {
  id: string;
  name: string;
  price: number;
  votes: number;
  bonus: number;
  totalVotes: number;
  icon: React.ReactNode;
  color: string;
  gradient: string;
  popular?: boolean;
  features: string[];
}

const votePackages: VotePackage[] = [
  {
    id: "bronze",
    name: "Bronze Package",
    price: 9.99,
    votes: 50,
    bonus: 5,
    totalVotes: 55,
    icon: <Award className="w-8 h-8" />,
    color: "text-orange-600",
    gradient: "from-orange-400 to-orange-600",
    features: [
      "50 Base Votes",
      "5 Bonus Votes",
      "Contest Entry Support",
      "Basic Analytics"
    ]
  },
  {
    id: "silver",
    name: "Silver Package",
    price: 19.99,
    votes: 120,
    bonus: 15,
    totalVotes: 135,
    icon: <Star className="w-8 h-8" />,
    color: "text-gray-600",
    gradient: "from-gray-400 to-gray-600",
    features: [
      "120 Base Votes",
      "15 Bonus Votes",
      "Priority Contest Entry",
      "Advanced Analytics",
      "Email Support"
    ]
  },
  {
    id: "gold",
    name: "Gold Package",
    price: 39.99,
    votes: 300,
    bonus: 50,
    totalVotes: 350,
    icon: <Gem className="w-8 h-8" />,
    color: "text-yellow-600",
    gradient: "from-yellow-400 to-yellow-600",
    popular: true,
    features: [
      "300 Base Votes",
      "50 Bonus Votes",
      "Premium Contest Entry",
      "Detailed Analytics",
      "Priority Support",
      "Profile Boost"
    ]
  },
  {
    id: "diamond",
    name: "Diamond Package",
    price: 79.99,
    votes: 750,
    bonus: 150,
    totalVotes: 900,
    icon: <Crown className="w-8 h-8" />,
    color: "text-blue-600",
    gradient: "from-blue-400 to-blue-600",
    features: [
      "750 Base Votes",
      "150 Bonus Votes",
      "VIP Contest Entry",
      "Premium Analytics",
      "24/7 Priority Support",
      "Profile Highlighting",
      "Contest Recommendations"
    ]
  },
  {
    id: "platinum",
    name: "Platinum Package",
    price: 149.99,
    votes: 1500,
    bonus: 400,
    totalVotes: 1900,
    icon: <Sparkles className="w-8 h-8" />,
    color: "text-purple-600",
    gradient: "from-purple-400 to-purple-600",
    features: [
      "1500 Base Votes",
      "400 Bonus Votes",
      "Elite Contest Entry",
      "Complete Analytics Suite",
      "Dedicated Account Manager",
      "Featured Profile Placement",
      "Custom Contest Creation",
      "Exclusive Events Access"
    ]
  }
];

export default function BuyVotes() {
  const { model, user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  // Get active contests to check if model is participating
  const { data: activeContest, isLoading: contestLoading } = useQuery({
    queryKey: ["/api/contests"],
    select: (data) => data.find((contest: any) => contest.status === "active")
  });

  // Purchase vote package mutation - must be before any conditional returns
  // const purchasePackageMutation = useMutation({
  //   mutationFn: async (packageId: string) => {
  //     const response = await apiRequest("/api/vote-packages/purchase", {
  //       method: "POST",
  //       body: JSON.stringify({ packageId }),
  //     });
  //     return response.json();
  //   },
  //   onSuccess: (data) => {
  //     queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
  //     queryClient.invalidateQueries({ queryKey: ["/api/contests"] });
  //     toast({
  //       title: "Purchase Successful!",
  //       description: `${data.packageName} purchased! ${data.votesAdded} votes added to your contest entry "${data.contestTitle}".`,
  //     });
  //     setSelectedPackage(null);
  //   },
  //   onError: (error: any) => {
  //     const errorMessage = error.message || "Failed to purchase vote package. Please try again.";
  //     toast({
  //       title: "Purchase Failed",
  //       description: errorMessage,
  //       variant: "destructive",
  //     });
  //     setSelectedPackage(null);
  //   },
  // });

  const handlePurchase = (packageId: string) => {
    setSelectedPackage(packageId);
    createCheckoutMutation.mutate(packageId);
  };

  const createCheckoutMutation = useMutation({
    mutationFn: async (packageId: string) => {
      const response = await apiRequest("/api/create-checkout-session", {
        method: "POST",
        body: JSON.stringify({ packageId }),
      });

      const data = await response.json();

      if (!data.url) {
        throw new Error("No checkout URL returned");
      }

      return data.url;
    },
    onSuccess: (checkoutUrl) => {
      window.location.href = checkoutUrl;
    },
    onError: (error: any) => {
      const message =
        error?.message || "Something went wrong while creating the checkout session.";
      toast({
        title: "Redirect Failed",
        description: message,
        variant: "destructive",
      });
      setSelectedPackage(null);
    },
  });

  // Redirect non-models or unauthenticated users
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Check for access restrictions
  if (!isAuthenticated || !model) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h1>
          <p className="text-gray-600 mb-6">
            This page is exclusively for registered models. Please create a model profile to access vote packages.
          </p>
          <Button
            onClick={() => window.location.href = "/"}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  // Check if model is participating in active contest
  if (!contestLoading && (!activeContest)) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <DashboardNav />
        <div className="flex-1 p-6">
          <div className="max-w-2xl mx-auto text-center mt-20">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-10 h-10 text-yellow-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">No Active Contest</h1>
            <p className="text-xl text-gray-600 mb-8">
              Vote packages can only be purchased when you're actively participating in an ongoing contest.
            </p>
            <div className="bg-white rounded-lg p-6 border border-gray-200 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">To purchase vote packages:</h3>
              <ol className="text-left text-gray-600 space-y-2">
                <li className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-purple-100 text-purple-600 text-sm font-semibold rounded-full flex items-center justify-center">1</span>
                  Wait for an active contest to begin
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-purple-100 text-purple-600 text-sm font-semibold rounded-full flex items-center justify-center">2</span>
                  Submit your entry to the contest
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-purple-100 text-purple-600 text-sm font-semibold rounded-full flex items-center justify-center">3</span>
                  Get your entry approved by admin
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-purple-100 text-purple-600 text-sm font-semibold rounded-full flex items-center justify-center">4</span>
                  Purchase votes to boost your contest ranking
                </li>
              </ol>
            </div>
            <Button
              onClick={() => window.location.href = "/dashboard/contests"}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              View Contests
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // const handlePurchase = (packageId: string) => {
  //   setSelectedPackage(packageId);
  //   purchasePackageMutation.mutate(packageId);
  // };

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

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar Navigation */}
      <DashboardNav />

      {/* Main Content */}
      <div className="flex-1 p-6">
        <motion.div
          className="max-w-7xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              Vote Packages
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Boost your contest performance with our premium vote packages.
              Get more visibility and increase your chances of winning!
            </p>
          </motion.div>

          {/* Active Contest Info */}
          <motion.div variants={itemVariants} className="mb-8">
            <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Active Contest</h3>
                    <p className="text-2xl font-bold">{activeContest?.title || "Loading..."}</p>
                    <p className="text-sm text-purple-200 mt-1">
                      Votes will be added to your contest entry
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-purple-100 mb-1">Model: {model.stageName}</p>
                    <p className="text-sm text-purple-200">Total Votes: {model.totalVotes || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Vote Packages Grid */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-12"
          >
            {votePackages.map((pkg) => (
              <motion.div
                key={pkg.id}
                className="relative"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-1 text-sm font-semibold">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <Card className={`border-0 shadow-xl h-full ${pkg.popular ? 'ring-2 ring-yellow-400' : ''}`}>
                  <CardHeader className="text-center pb-4">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${pkg.gradient} flex items-center justify-center text-white`}>
                      {pkg.icon}
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900">
                      {pkg.name}
                    </CardTitle>
                    <div className="text-center">
                      <span className="text-4xl font-bold text-gray-900">${pkg.price}</span>
                      <p className="text-gray-500 mt-1">One-time payment</p>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {/* Vote Summary */}
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-3xl font-bold text-gray-900 mb-1">
                        {pkg.totalVotes}
                      </div>
                      <div className="text-sm text-gray-600">
                        {pkg.votes} votes + {pkg.bonus} bonus
                      </div>
                    </div>

                    {/* Features */}
                    <div className="space-y-3">
                      {pkg.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* Purchase Button */}
                    {/* <Button
                      onClick={() => handlePurchase(pkg.id)}
                      disabled={purchasePackageMutation.isPending && selectedPackage === pkg.id}
                      className={`w-full bg-gradient-to-r ${pkg.gradient} hover:opacity-90 text-white font-semibold py-3 text-lg`}
                    >
                      {purchasePackageMutation.isPending && selectedPackage === pkg.id ? (
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Processing...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <ShoppingCart className="w-5 h-5" />
                          Purchase Package
                          <ArrowRight className="w-5 h-5" />
                        </div>
                      )}
                    </Button> */}

                    <Button
                      onClick={() => handlePurchase(pkg.id)}
                      disabled={createCheckoutMutation.isPending && selectedPackage === pkg.id}
                      className={`w-full bg-gradient-to-r ${pkg.gradient} hover:opacity-90 text-white font-semibold py-3 text-lg`}
                    >
                      {createCheckoutMutation.isPending && selectedPackage === pkg.id ? (
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Redirecting...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <ShoppingCart className="w-5 h-5" />
                          Purchase Package
                          <ArrowRight className="w-5 h-5" />
                        </div>
                      )}
                    </Button>

                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Benefits Section */}
          <motion.div variants={itemVariants}>
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-center text-gray-900">
                  Why Buy Vote Packages?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center text-white">
                      <Star className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Increase Visibility</h3>
                    <p className="text-gray-600">More votes mean higher rankings and better visibility in contests.</p>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-400 to-purple-600 flex items-center justify-center text-white">
                      <Crown className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Win More Contests</h3>
                    <p className="text-gray-600">Boost your chances of winning with strategic vote allocation.</p>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-pink-400 to-pink-600 flex items-center justify-center text-white">
                      <Sparkles className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Premium Features</h3>
                    <p className="text-gray-600">Access exclusive features and priority support with higher packages.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}