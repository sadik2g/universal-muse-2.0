import { motion } from "framer-motion";
import ContactForm from "@/components/ui/contact-form";
import { Mail, MessageCircle, Clock, CheckCircle } from "lucide-react";

export default function ContactPage() {
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="space-y-12"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Get in Touch
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Have questions about contests, voting, or need technical support? 
              We're here to help you every step of the way.
            </p>
          </motion.div>

          {/* Info Cards */}
          <motion.div variants={itemVariants}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-xl text-center hover:shadow-2xl transition-all duration-300 border border-white/20">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Mail className="h-7 w-7 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-3 text-lg">General Inquiries</h3>
                <p className="text-gray-600">
                  Questions about contests, voting, or platform features
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-xl text-center hover:shadow-2xl transition-all duration-300 border border-white/20">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <MessageCircle className="h-7 w-7 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-3 text-lg">Technical Support</h3>
                <p className="text-gray-600">
                  Issues with uploads, voting, or account management
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-xl text-center hover:shadow-2xl transition-all duration-300 border border-white/20">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <CheckCircle className="h-7 w-7 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-3 text-lg">Model Applications</h3>
                <p className="text-gray-600">
                  Help with registration, profile setup, or contest submissions
                </p>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div variants={itemVariants}>
            <ContactForm />
          </motion.div>

          {/* Response Time Info */}
          <motion.div variants={itemVariants} className="text-center">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-xl max-w-lg mx-auto border border-white/20">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">Response Time</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                We typically respond to all inquiries within 24 hours during business days. 
                For urgent technical issues, we aim to respond within 4-6 hours.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}