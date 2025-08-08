import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle, Vote, Trophy, Users, Shield, CreditCard } from "lucide-react";
import { fadeInUp, staggerChildren } from "@/lib/animations";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  icon: React.ReactNode;
}

export default function FAQ() {
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("all");

  const faqData: FAQItem[] = [
    {
      id: "voting-1",
      category: "voting",
      icon: <Vote className="text-pink-500" />,
      question: "How does voting work?",
      answer: "Every user can cast free daily votes for their favorite models. Premium vote packages provide additional voting power with special effects and multipliers. All votes are counted fairly and transparently in our ranking system.",
    },
    {
      id: "voting-2",
      category: "voting",
      icon: <Vote className="text-pink-500" />,
      question: "How often can I vote?",
      answer: "Free users can vote once per day per model. Premium vote package holders get additional votes based on their package tier. Vote credits reset daily for free users and are consumed from your package balance for premium users.",
    },
    {
      id: "voting-3",
      category: "voting",
      icon: <Vote className="text-pink-500" />,
      question: "Can I vote for multiple models in the same contest?",
      answer: "Yes! You can vote for as many models as you like within a single contest. Each model gets their own daily vote allocation, so supporting multiple contestants doesn't reduce your impact.",
    },
    {
      id: "contests-1",
      category: "contests",
      icon: <Trophy className="text-amber-500" />,
      question: "How are winners decided?",
      answer: "Winners are determined by total vote count at the end of each contest period. Our algorithm considers vote authenticity, timing, and fair play measures. Results are verified by our team before announcing winners.",
    },
    {
      id: "contests-2",
      category: "contests",
      icon: <Trophy className="text-amber-500" />,
      question: "What types of contests are available?",
      answer: "We host various contest categories including Fashion Week competitions, Portrait contests, Beauty & Glamour showcases, Street Style events, and Editorial Excellence challenges. Each contest has unique themes and prize structures.",
    },
    {
      id: "contests-3",
      category: "contests",
      icon: <Trophy className="text-amber-500" />,
      question: "How do I enter a contest as a model?",
      answer: "Click 'Participate Contest' to register as a model. You'll need to provide basic information, upload professional photos, and agree to our terms. Once approved, you can enter active contests that match your profile.",
    },
    {
      id: "participation-1",
      category: "participation",
      icon: <Users className="text-blue-500" />,
      question: "Can I participate as a model?",
      answer: "Absolutely! Click the 'Participate Contest' button to register as a model. You'll need to provide basic information, upload professional photos, and agree to our terms. Once approved, you can enter active contests.",
    },
    {
      id: "participation-2",
      category: "participation",
      icon: <Users className="text-blue-500" />,
      question: "Are there age restrictions for models?",
      answer: "Models must be at least 18 years old to participate independently. For participants under 18, we require parental consent and additional verification steps to ensure safety and compliance.",
    },
    {
      id: "participation-3",
      category: "participation",
      icon: <Users className="text-blue-500" />,
      question: "What photo requirements do you have?",
      answer: "We require high-quality, professional photos that clearly show the model. Images should be recent (within 6 months), properly lit, and meet our content guidelines. Heavily edited or filtered photos may be rejected.",
    },
    {
      id: "prizes-1",
      category: "prizes",
      icon: <CreditCard className="text-green-500" />,
      question: "What are the prizes?",
      answer: "Prizes vary by contest but typically include cash rewards, modeling contracts, professional photoshoots, and career opportunities with top agencies. Our featured contests offer prizes ranging from $5,000 to $100,000.",
    },
    {
      id: "prizes-2",
      category: "prizes",
      icon: <CreditCard className="text-green-500" />,
      question: "How are prizes distributed?",
      answer: "Winners are contacted within 48 hours of contest end. Cash prizes are distributed via secure payment methods within 7-14 business days. Contracts and professional opportunities are coordinated through our partner network.",
    },
    {
      id: "safety-1",
      category: "safety",
      icon: <Shield className="text-purple-500" />,
      question: "How do you ensure fair play?",
      answer: "We use advanced algorithms to detect fraudulent voting patterns, require email verification for accounts, and monitor for suspicious activity. Our team manually reviews contest results before announcing winners.",
    },
    {
      id: "safety-2",
      category: "safety",
      icon: <Shield className="text-purple-500" />,
      question: "What safety measures are in place for models?",
      answer: "We verify all modeling opportunities through our partner network, provide secure communication channels, never share personal contact information, and offer 24/7 support for any safety concerns.",
    },
  ];

  const categories = [
    { id: "all", label: "All Questions", icon: <HelpCircle /> },
    { id: "voting", label: "Voting", icon: <Vote /> },
    { id: "contests", label: "Contests", icon: <Trophy /> },
    { id: "participation", label: "Participation", icon: <Users /> },
    { id: "prizes", label: "Prizes", icon: <CreditCard /> },
    { id: "safety", label: "Safety", icon: <Shield /> },
  ];

  const filteredFAQ = activeCategory === "all" 
    ? faqData 
    : faqData.filter(item => item.category === activeCategory);

  const toggleItem = (itemId: string) => {
    setActiveItem(activeItem === itemId ? null : itemId);
  };

  return (
    <div className="min-h-screen pt-24 pb-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          variants={fadeInUp}
          initial="initial"
          animate="animate"
        >
          <h1 className="text-4xl md:text-5xl font-black text-gray-800 mb-6">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to know about our platform
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          className="flex flex-wrap justify-center gap-4 mb-12"
          variants={staggerChildren}
          initial="initial"
          animate="animate"
        >
          {categories.map((category) => (
            <motion.button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`flex items-center px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                activeCategory === category.id
                  ? "bg-indigo-500 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100 shadow-md"
              }`}
              variants={fadeInUp}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="mr-2">{category.icon}</span>
              {category.label}
            </motion.button>
          ))}
        </motion.div>

        {/* FAQ Items */}
        <motion.div
          className="max-w-4xl mx-auto"
          variants={staggerChildren}
          initial="initial"
          animate="animate"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {filteredFAQ.map((item, index) => (
                <motion.div
                  key={item.id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden"
                  variants={fadeInUp}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.01 }}
                >
                  <motion.button
                    className="w-full px-8 py-6 text-left hover:bg-gray-50 transition-colors duration-300 focus:outline-none"
                    onClick={() => toggleItem(item.id)}
                    whileHover={{ backgroundColor: "rgba(249, 250, 251, 1)" }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="mr-4">{item.icon}</div>
                        <h3 className="text-xl font-bold text-gray-800">{item.question}</h3>
                      </div>
                      <motion.div
                        animate={{ rotate: activeItem === item.id ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ChevronDown className="text-gray-500" />
                      </motion.div>
                    </div>
                  </motion.button>
                  
                  <AnimatePresence>
                    {activeItem === item.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-8 pb-6 text-gray-600 leading-relaxed">
                          <div className="border-t border-gray-200 pt-6">
                            {item.answer}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Contact CTA */}
        <motion.div
          className="mt-16 text-center"
          variants={fadeInUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-3xl p-12 max-w-3xl mx-auto">
            <motion.div
              className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6"
              whileHover={{ scale: 1.1, rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <HelpCircle className="text-white text-2xl" />
            </motion.div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Still have questions?
            </h3>
            <p className="text-gray-600 mb-8">
              Can't find the answer you're looking for? Our support team is here to help.
            </p>
            <motion.button
              className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-3 rounded-full font-bold text-lg hover:shadow-lg transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Contact Support
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
