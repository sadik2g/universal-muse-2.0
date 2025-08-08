import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Crown, Trophy, Gift, Mail, Star, Send, CheckCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface WinnerCongratulationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  contestId: number;
  contestTitle: string;
  prizeAmount: string;
  prizeCurrency: string;
  winningVotes: number;
  winningPhoto: string;
  winningPhotoTitle: string;
}

export default function WinnerCongratulationsModal({
  isOpen,
  onClose,
  onSuccess,
  contestId,
  contestTitle,
  prizeAmount,
  prizeCurrency,
  winningVotes,
  winningPhoto,
  winningPhotoTitle,
}: WinnerCongratulationsModalProps) {
  const [showConfetti, setShowConfetti] = useState(true);
  const [showPrizeForm, setShowPrizeForm] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const confettiVariants = {
    initial: { scale: 0, rotate: 0, opacity: 0 },
    animate: { 
      scale: 1, 
      rotate: 360, 
      opacity: 1,
      transition: { duration: 0.8, ease: "easeOut" }
    },
    exit: { scale: 0, opacity: 0, transition: { duration: 0.3 } }
  };

  const modalVariants = {
    initial: { scale: 0.8, opacity: 0, y: 50 },
    animate: { 
      scale: 1, 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    },
    exit: { scale: 0.8, opacity: 0, y: 50 }
  };

  // Prize request mutation
  const prizeRequestMutation = useMutation({
    mutationFn: async (data: { contestId: number; requestMessage: string; contactInfo: string }) => {
      return await apiRequest("/api/prize-requests", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      toast({
        title: "Prize Request Submitted!",
        description: "Your prize request has been sent to the admin team. They will contact you soon.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/my-prize-requests"] });
      setShowPrizeForm(false);
      if (onSuccess) {
        onSuccess();
      } else {
        onClose();
      }
    },
    onError: (error: any) => {
      toast({
        title: "Request Failed",
        description: error.message || "Failed to submit prize request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handlePrizeRequest = () => {
    if (!contactInfo.trim()) {
      toast({
        title: "Contact Information Required",
        description: "Please provide your contact information to claim the prize.",
        variant: "destructive",
      });
      return;
    }

    prizeRequestMutation.mutate({
      contestId,
      requestMessage: requestMessage.trim(),
      contactInfo: contactInfo.trim(),
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] mx-auto p-0 bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 overflow-hidden overflow-y-auto">
        <motion.div
          variants={modalVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="relative"
        >
          {/* Confetti Animation */}
          <AnimatePresence>
            {showConfetti && (
              <div className="absolute inset-0 pointer-events-none z-10">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    variants={confettiVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="absolute"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      color: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'][Math.floor(Math.random() * 5)]
                    }}
                  >
                    <Star className="w-4 h-4" />
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>

          <div className="p-4 sm:p-6 lg:p-8">
            <DialogHeader className="text-center mb-4 sm:mb-6">
              <div className="flex justify-center mb-4">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="relative"
                >
                  <Crown className="w-16 h-16 text-yellow-500" />
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-2 -right-2"
                  >
                    <Trophy className="w-8 h-8 text-yellow-600" />
                  </motion.div>
                </motion.div>
              </div>
              
              <DialogTitle className="text-2xl sm:text-3xl font-bold text-center bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                🎉 Congratulations! 🎉
              </DialogTitle>
              <p className="text-base sm:text-lg text-gray-700 mt-2">
                You won the <span className="font-semibold text-yellow-700">{contestTitle}</span>!
              </p>
            </DialogHeader>

            <div className="space-y-4 sm:space-y-6">
              {/* Winning Photo */}
              <Card className="border-2 border-yellow-300 bg-white/80">
                <CardContent className="p-4">
                  <div className="text-center mb-4">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800">Your Winning Photo</h3>
                    <p className="text-sm sm:text-base text-gray-600">"{winningPhotoTitle}"</p>
                  </div>
                  <div className="relative mx-auto max-w-sm sm:max-w-md">
                    <img 
                      src={winningPhoto} 
                      alt={winningPhotoTitle}
                      className="w-full h-48 sm:h-64 object-cover rounded-lg shadow-lg"
                    />
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5, duration: 0.5 }}
                      className="absolute -top-2 -right-2 bg-yellow-500 text-white p-2 rounded-full"
                    >
                      <Crown className="w-4 h-4 sm:w-6 sm:h-6" />
                    </motion.div>
                  </div>
                </CardContent>
              </Card>

              {/* Prize & Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="border-2 border-green-300 bg-green-50/80">
                  <CardContent className="p-3 sm:p-4 text-center">
                    <Gift className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 mx-auto mb-2" />
                    <h3 className="text-sm sm:text-base font-semibold text-green-800">Prize Amount</h3>
                    <p className="text-xl sm:text-2xl font-bold text-green-700">
                      ${prizeAmount} {prizeCurrency}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-2 border-blue-300 bg-blue-50/80">
                  <CardContent className="p-3 sm:p-4 text-center">
                    <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 mx-auto mb-2" />
                    <h3 className="text-sm sm:text-base font-semibold text-blue-800">Winning Votes</h3>
                    <p className="text-xl sm:text-2xl font-bold text-blue-700">
                      {winningVotes.toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Prize Request Section */}
              <Card className="border-2 border-purple-300 bg-purple-50/80">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Gift className="w-6 h-6 text-purple-600" />
                    <h3 className="font-semibold text-purple-800">Claim Your Prize</h3>
                  </div>
                  
                  {!showPrizeForm ? (
                    <>
                      <p className="text-sm sm:text-base text-gray-700 mb-4">
                        Submit a prize request to claim your winnings. Our admin team will contact you with the details.
                      </p>
                      <Button 
                        onClick={() => setShowPrizeForm(true)}
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-2 sm:py-3 text-sm sm:text-base rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Request Prize Payment
                      </Button>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="contactInfo" className="text-sm sm:text-base text-purple-800 font-semibold">
                          Contact Information *
                        </Label>
                        <Input
                          id="contactInfo"
                          value={contactInfo}
                          onChange={(e) => setContactInfo(e.target.value)}
                          placeholder="Your email, phone, or preferred contact method"
                          className="mt-1 text-sm sm:text-base"
                        />
                        <p className="text-xs text-gray-600 mt-1">
                          Provide how you'd like the admin to contact you about your prize.
                        </p>
                      </div>
                      
                      <div>
                        <Label htmlFor="requestMessage" className="text-sm sm:text-base text-purple-800 font-semibold">
                          Additional Message (Optional)
                        </Label>
                        <Textarea
                          id="requestMessage"
                          value={requestMessage}
                          onChange={(e) => setRequestMessage(e.target.value)}
                          placeholder="Any additional information or special requests..."
                          rows={3}
                          className="mt-1 text-sm sm:text-base"
                        />
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button 
                          onClick={handlePrizeRequest}
                          disabled={prizeRequestMutation.isPending}
                          className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-2 sm:py-3 text-sm sm:text-base rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          {prizeRequestMutation.isPending ? (
                            <>Processing...</>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Submit Request
                            </>
                          )}
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => setShowPrizeForm(false)}
                          className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Close Button */}
              {!showPrizeForm && (
                <div className="text-center pt-4">
                  <Button 
                    onClick={onClose}
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Amazing! Thank You!
                  </Button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}