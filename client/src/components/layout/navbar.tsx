import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Crown, Menu, X, Gift, Trophy } from "lucide-react";
import RegisterModal from "@/components/modals/register-modal";
import LoginModal from "@/components/modals/login-modal";
import WinnerCongratulationsModal from "@/components/modals/winner-congratulations-modal";
import NoPrizesModal from "@/components/modals/no-prizes-modal";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";

export default function Navbar() {
  const [location] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showCongratulationsModal, setShowCongratulationsModal] = useState(false);
  const [selectedWinning, setSelectedWinning] = useState<any>(null);
  const { user } = useAuth();

  // Fetch winnings for authenticated models
  const { data: winnings, isLoading: winningsLoading } = useQuery({
    queryKey: ["/api/my-winnings"],
    enabled: !!user && user.userType === 'model',
    staleTime: 30 * 1000, // 30 seconds
    refetchOnMount: true,
    refetchOnWindowFocus: false
  });

  const hasWinnings = winnings && Array.isArray(winnings) && winnings.length > 0;

  const handlePrizeClick = () => {
    if (hasWinnings && winnings[0]) {
      // Get the first winning (you could modify this to show a list if multiple)
      setSelectedWinning(winnings[0]);
      setShowCongratulationsModal(true);
    } else {
      // No winnings - show encouragement modal (optional)
      setShowCongratulationsModal(true);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Dynamic nav items based on user type and winnings
  type NavItem = {
    href: string;
    label: string;
    special?: boolean;
  };

  const getNavItems = (): NavItem[] => {
    const baseItems: NavItem[] = [
      { href: "/", label: "Home" },
      { href: "/contests", label: "Contests" },
      { href: "/leaderboard", label: "Leaderboard" },
    ];

    // Add prizes section for all models
    if (user && user.userType === 'model') {
      baseItems.push({ href: "#", label: "My Prizes", special: true });
    }

    baseItems.push(
      { href: "/about", label: "About" },
      { href: "/faq", label: "FAQ" },
      { href: "/contact", label: "Contact" }
    );

    return baseItems;
  };

  const navItems = getNavItems();

  return (
    <>
      <motion.nav
        className={`fixed w-full top-0 z-50 transition-all duration-300 ${isScrolled ? "navbar-blur border-b border-gray-200" : "bg-transparent"
          }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 md:py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            {/* <Link href="/">
              <motion.div
                className="flex items-center space-x-2 md:space-x-3 cursor-pointer flex-shrink-0"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Crown className="text-white text-sm md:text-lg" />
                </div>
                <span className="text-lg md:text-xl lg:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent whitespace-nowrap">
                  Universal Muse
                </span>
              </motion.div>
            </Link> */}

            <Link href="/">
              <motion.div
                className="flex items-center space-x-2 md:space-x-3 cursor-pointer flex-shrink-0"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl overflow-hidden shadow-lg">
                  <img
                    src="https://res.cloudinary.com/dgt3nggmy/image/upload/v1754488156/Media_m8h1rd.jpg"
                    alt="Logo"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-lg md:text-xl lg:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent whitespace-nowrap">
                  Universal Muse
                </span>
              </motion.div>
            </Link>


            {/* Desktop Navigation Links - Responsive Spacing */}
            <div className="hidden lg:flex items-center space-x-3 xl:space-x-6 flex-1 justify-center">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
                >
                  {item.special ? (
                    <span
                      onClick={handlePrizeClick}
                      className={`relative font-medium text-sm xl:text-base transition-all duration-300 cursor-pointer group whitespace-nowrap ${hasWinnings ? 'text-yellow-600 hover:text-yellow-700' : 'text-gray-600 hover:text-gray-700'
                        } flex items-center`}
                    >
                      <Gift className="w-4 h-4 mr-1" />
                      {item.label}
                      {hasWinnings && (
                        <Badge className="ml-1 h-4 w-4 rounded-full p-0 flex items-center justify-center bg-red-500 text-white text-xs animate-pulse">
                          {"!"}
                        </Badge>
                      )}
                      {/* Hover indicator */}
                      <div className={`absolute -bottom-1 left-0 right-0 h-0.5 ${hasWinnings ? 'bg-yellow-400' : 'bg-gray-400'} rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-300`} />
                    </span>
                  ) : (
                    <Link href={item.href}>
                      <span className={`relative font-medium text-sm xl:text-base transition-all duration-300 cursor-pointer group whitespace-nowrap ${location === item.href
                        ? "text-indigo-600"
                        : "text-gray-700 hover:text-indigo-600"
                        }`}>
                        {item.label}
                        {/* Active indicator */}
                        {location === item.href && (
                          <motion.div
                            layoutId="activeIndicator"
                            className="absolute -bottom-1 left-0 right-0 h-0.5 bg-indigo-600 rounded-full"
                            initial={false}
                          />
                        )}
                        {/* Hover indicator */}
                        <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-indigo-400 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                      </span>
                    </Link>
                  )}
                </motion.div>
              ))}
            </div>

            <div className="flex items-center space-x-2 flex-shrink-0">
              {/* Desktop Auth Buttons - Responsive */}
              {!user && (
                <div className="hidden md:flex items-center space-x-2">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant="outline"
                      onClick={() => setIsLoginOpen(true)}
                      className="border-indigo-300 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-400 px-3 lg:px-4 py-2 rounded-full font-medium transition-all duration-300 text-sm shadow-sm whitespace-nowrap"
                    >
                      Sign In
                    </Button>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      onClick={() => setIsRegisterOpen(true)}
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-3 lg:px-4 py-2 rounded-full font-medium shadow-lg hover:shadow-xl transition-all duration-300 text-sm whitespace-nowrap"
                    >
                      <span className="hidden xl:inline">Participate Contest</span>
                      <span className="xl:hidden">Join Contest</span>
                    </Button>
                  </motion.div>
                </div>
              )}

              {/* Mobile Menu */}
              <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden p-2 ml-2">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px] sm:w-[350px]">
                  <div className="flex flex-col space-y-6 mt-8">
                    {/* Mobile Navigation Links */}
                    <div className="space-y-4 mb-6">
                      {navItems.map((item) => (
                        <div key={item.href}>
                          {item.special ? (
                            <motion.div
                              className={`block text-lg font-medium transition-colors duration-300 cursor-pointer py-2 px-4 rounded-lg ${hasWinnings
                                ? 'text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50'
                                : 'text-gray-600 hover:text-gray-700 hover:bg-gray-50'
                                } flex items-center`}
                              onClick={() => {
                                handlePrizeClick();
                                setIsMobileOpen(false);
                              }}
                              whileHover={{ x: 4 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Trophy className="w-5 h-5 mr-2" />
                              {item.label}
                              {hasWinnings && (
                                <Badge className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-red-500 text-white text-sm animate-pulse">
                                  {"!"}
                                </Badge>
                              )}
                            </motion.div>
                          ) : (
                            <Link href={item.href}>
                              <motion.div
                                className={`block text-lg font-medium transition-colors duration-300 cursor-pointer py-2 px-4 rounded-lg ${location === item.href
                                  ? "text-indigo-600 bg-indigo-50"
                                  : "text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                                  }`}
                                onClick={() => setIsMobileOpen(false)}
                                whileHover={{ x: 4 }}
                                transition={{ duration: 0.2 }}
                              >
                                {item.label}
                              </motion.div>
                            </Link>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Mobile Auth */}
                    {!user && (
                      <div className="space-y-3">
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            variant="outline"
                            onClick={() => {
                              setIsLoginOpen(true);
                              setIsMobileOpen(false);
                            }}
                            className="w-full border-indigo-200 text-indigo-600 hover:bg-indigo-50 px-6 py-3 rounded-full font-semibold text-base"
                          >
                            Sign In
                          </Button>
                        </motion.div>

                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            onClick={() => {
                              setIsRegisterOpen(true);
                              setIsMobileOpen(false);
                            }}
                            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-full font-semibold text-base"
                          >
                            Participate Contest
                          </Button>
                        </motion.div>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </motion.nav>

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSwitchToRegister={() => {
          setIsLoginOpen(false);
          setIsRegisterOpen(true);
        }}
      />
      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSwitchToLogin={() => {
          setIsRegisterOpen(false);
          setIsLoginOpen(true);
        }}
      />

      {/* Prize Modals */}
      {hasWinnings && selectedWinning ? (
        <WinnerCongratulationsModal
          isOpen={showCongratulationsModal}
          onClose={() => {
            setShowCongratulationsModal(false);
            setSelectedWinning(null);
          }}
          contestId={selectedWinning.contestId}
          contestTitle={selectedWinning.contestTitle}
          prizeAmount={selectedWinning.prizeAmount}
          prizeCurrency={selectedWinning.prizeCurrency}
          winningVotes={selectedWinning.winningVotes}
          winningPhoto={selectedWinning.winningPhoto}
          winningPhotoTitle={selectedWinning.winningPhotoTitle}
        />
      ) : (
        <NoPrizesModal
          isOpen={showCongratulationsModal && !hasWinnings}
          onClose={() => {
            setShowCongratulationsModal(false);
            setSelectedWinning(null);
          }}
        />
      )}
    </>
  );
}
