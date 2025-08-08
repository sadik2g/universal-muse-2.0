import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Gift, Star, Target } from "lucide-react";

interface NoPrizesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NoPrizesModal({ isOpen, onClose }: NoPrizesModalProps) {
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <motion.div
          variants={modalVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="space-y-6"
        >
          <DialogHeader className="text-center space-y-3">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4">
              <Trophy className="w-10 h-10 text-gray-400" />
            </div>
            <DialogTitle className="text-2xl font-bold text-gray-600">
              No Prizes Yet
            </DialogTitle>
            <p className="text-gray-500 text-base">
              You haven't won any contests yet, but keep participating!
            </p>
          </DialogHeader>

          <Card className="border-2 border-gray-200">
            <CardContent className="p-6 space-y-4">
              <div className="text-center space-y-4">
                <div className="flex justify-center space-x-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Target className="w-6 h-6 text-blue-600" />
                    </div>
                    <p className="text-sm text-gray-600">Participate</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Star className="w-6 h-6 text-green-600" />
                    </div>
                    <p className="text-sm text-gray-600">Get Votes</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Gift className="w-6 h-6 text-yellow-600" />
                    </div>
                    <p className="text-sm text-gray-600">Win Prizes</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-700 mb-2">Tips to Win:</h3>
                  <ul className="text-sm text-gray-600 space-y-1 text-left">
                    <li>• Submit high-quality photos</li>
                    <li>• Add engaging titles and descriptions</li>
                    <li>• Participate in active contests</li>
                    <li>• Share your submissions to get more votes</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center">
            <Button 
              onClick={onClose}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-2 rounded-full font-medium shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Keep Competing!
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}