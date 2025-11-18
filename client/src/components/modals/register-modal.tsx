import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { X, Upload, Star, Sparkles, Heart, Award, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerModelSchema, type RegisterModel } from "@shared/schema";
import { z } from "zod";
import { useLocation } from "wouter";

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin?: () => void;
}

// Form schema with all required fields
const formSchema = registerModelSchema;

export default function RegisterModal({ isOpen, onClose, onSwitchToLogin }: RegisterModalProps) {
  const [step, setStep] = useState(1);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<RegisterModel>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      stageName: "",
      bio: "",
      instagramHandle: "",
      location: "",
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterModel) => {
      const response = await apiRequest("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Welcome to Universal Muse! 🎉",
        description: `Registration successful! Welcome ${data.model.name}`,
        duration: 5000,
      });
      reset();
      onClose();
      setStep(1);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      
      // Redirect to dashboard
      setLocation("/dashboard");
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: "An error occurred during registration. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RegisterModel) => {
    registerMutation.mutate(data);
  };

  const nextStep = () => {
    if (step < 2) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleClose = () => {
    if (!registerMutation.isPending) {
      onClose();
      setStep(1);
      reset();
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.5,
        ease: "easeOut",
        staggerChildren: 0.1 
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8,
      transition: { duration: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };

  const stepVariants = {
    hidden: { x: 50, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: { duration: 0.4, ease: "easeOut" }
    },
    exit: { 
      x: -50, 
      opacity: 0,
      transition: { duration: 0.3 }
    }
  };

  const floatingIcons = [
    { icon: Star, delay: 0, duration: 3 },
    { icon: Heart, delay: 1, duration: 4 },
    { icon: Award, delay: 2, duration: 3.5 },
    { icon: Sparkles, delay: 0.5, duration: 4.5 },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={handleClose}>
          <DialogContent className="max-w-2xl p-0 bg-gradient-to-br from-white via-purple-50 to-pink-50 border-0 shadow-2xl overflow-hidden">
            <motion.div 
              className="relative"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* Floating background icons */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {floatingIcons.map((item, index) => (
                  <motion.div
                    key={index}
                    className="absolute text-purple-200/30"
                    initial={{ 
                      x: Math.random() * 100 + "%", 
                      y: Math.random() * 100 + "%",
                      scale: 0.5,
                      rotate: 0 
                    }}
                    animate={{ 
                      y: [null, "-20px", "20px"],
                      rotate: [0, 10, -10, 0],
                      scale: [0.5, 0.7, 0.5]
                    }}
                    transition={{
                      duration: item.duration,
                      repeat: Infinity,
                      repeatType: "reverse",
                      delay: item.delay,
                      ease: "easeInOut"
                    }}
                  >
                    <item.icon size={32} />
                  </motion.div>
                ))}
              </div>

              {/* Header */}
              <motion.div 
                className="relative p-8 bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 text-white"
                variants={itemVariants}
              >
                {/* <button
                  onClick={handleClose}
                  disabled={registerMutation.isPending}
                  className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors disabled:opacity-50"
                >
                  <X size={20} />
                </button> */}

                <motion.div 
                  className="text-center"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <h2 className="text-3xl font-bold mb-2">Join Universal Muse</h2>
                  <p className="text-purple-100">Start your modeling journey today</p>
                </motion.div>

                {/* Step indicator */}
                <motion.div 
                  className="flex justify-center mt-6 space-x-2"
                  variants={itemVariants}
                >
                  {[1, 2].map((stepNum) => (
                    <motion.div
                      key={stepNum}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        stepNum <= step 
                          ? "bg-white shadow-lg" 
                          : "bg-white/30"
                      }`}
                      whileHover={{ scale: 1.2 }}
                      animate={{ 
                        scale: stepNum === step ? 1.2 : 1,
                        boxShadow: stepNum === step ? "0 0 15px rgba(255,255,255,0.8)" : "none"
                      }}
                    />
                  ))}
                </motion.div>
              </motion.div>

              {/* Form content */}
              <div className="p-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <AnimatePresence mode="wait">
                    {step === 1 && (
                      <motion.div
                        key="step1"
                        variants={stepVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="space-y-6"
                      >
                        <motion.div variants={itemVariants}>
                          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                            Basic Information
                          </h3>
                        </motion.div>

                        <motion.div variants={itemVariants} className="space-y-4">
                          <div>
                            <Label htmlFor="name" className="text-gray-700 font-medium">
                              Full Name *
                            </Label>
                            <Input
                              id="name"
                              {...register("name")}
                              placeholder="Enter your full name"
                              className="mt-2 border-2 border-purple-100 focus:border-purple-400 rounded-lg"
                            />
                            {errors.name && (
                              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="email" className="text-gray-700 font-medium">
                              Email Address *
                            </Label>
                            <Input
                              id="email"
                              type="email"
                              {...register("email")}
                              placeholder="your@email.com"
                              className="mt-2 border-2 border-purple-100 focus:border-purple-400 rounded-lg"
                            />
                            {errors.email && (
                              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="stageName" className="text-gray-700 font-medium">
                              Stage Name (Optional)
                            </Label>
                            <Input
                              id="stageName"
                              {...register("stageName")}
                              placeholder="Your professional name"
                              className="mt-2 border-2 border-purple-100 focus:border-purple-400 rounded-lg"
                            />
                          </div>
                        </motion.div>
                      </motion.div>
                    )}

                    {step === 2 && (
                      <motion.div
                        key="step2"
                        variants={stepVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="space-y-6"
                      >
                        <motion.div variants={itemVariants}>
                          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                            Security & Profile
                          </h3>
                        </motion.div>

                        <motion.div variants={itemVariants} className="space-y-4">
                          <div>
                            <Label htmlFor="password" className="text-gray-700 font-medium">
                              Password *
                            </Label>
                            <Input
                              id="password"
                              type="password"
                              {...register("password")}
                              placeholder="Create a secure password"
                              className="mt-2 border-2 border-purple-100 focus:border-purple-400 rounded-lg"
                            />
                            {errors.password && (
                              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
                              Confirm Password *
                            </Label>
                            <Input
                              id="confirmPassword"
                              type="password"
                              {...register("confirmPassword")}
                              placeholder="Confirm your password"
                              className="mt-2 border-2 border-purple-100 focus:border-purple-400 rounded-lg"
                            />
                            {errors.confirmPassword && (
                              <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="location" className="text-gray-700 font-medium">
                              Location (Optional)
                            </Label>
                            <Input
                              id="location"
                              {...register("location")}
                              placeholder="City, Country"
                              className="mt-2 border-2 border-purple-100 focus:border-purple-400 rounded-lg"
                            />
                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Navigation buttons */}
                  <motion.div 
                    className="flex justify-between pt-6"
                    variants={itemVariants}
                  >
                    {step > 1 ? (
                      <Button
                        type="button"
                        onClick={prevStep}
                        variant="outline"
                        disabled={registerMutation.isPending}
                        className="px-6 py-2 border-2 border-purple-200 hover:border-purple-400 text-purple-700"
                      >
                        Previous
                      </Button>
                    ) : <div />}

                    {step < 2 ? (
                      <Button
                        type="button"
                        onClick={nextStep}
                        disabled={registerMutation.isPending}
                        className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                      >
                        Next
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        disabled={registerMutation.isPending}
                        className="px-8 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                      >
                        {registerMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating Account...
                          </>
                        ) : (
                          "Complete Registration"
                        )}
                      </Button>
                    )}
                  </motion.div>
                </form>
                
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    Already have an account?{" "}
                    <button
                      onClick={() => {
                        handleClose();
                        onSwitchToLogin?.();
                      }}
                      className="text-indigo-600 hover:text-indigo-500 font-medium transition-colors"
                    >
                      Sign in here
                    </button>
                  </p>
                </div>
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}