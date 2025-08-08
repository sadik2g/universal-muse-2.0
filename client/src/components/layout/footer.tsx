import { motion } from "framer-motion";
import { Link } from "wouter";
import { Crown, Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import { fadeInUp, staggerChildren } from "@/lib/animations";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-16">
      <div className="container mx-auto px-6">
        <motion.div
          className="grid lg:grid-cols-4 md:grid-cols-2 gap-8"
          variants={staggerChildren}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          <motion.div variants={fadeInUp}>
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-xl flex items-center justify-center">
                <img
                  src="https://res.cloudinary.com/dgt3nggmy/image/upload/v1754488156/Media_m8h1rd.jpg"
                  alt="Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-2xl font-bold text-white">Universal Muse</span>
            </div>
            <p className="text-gray-400 leading-relaxed mb-6">
              The world's premier platform for model contests, connecting talent with opportunities and celebrating beauty in all its forms.
            </p>
            <div className="flex space-x-4">
              {[Facebook, Instagram, Twitter, Youtube].map((Icon, index) => (
                <motion.a
                  key={index}
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors duration-300"
                  whileHover={{ scale: 1.2 }}
                  transition={{ duration: 0.2 }}
                >
                  <Icon size={24} />
                </motion.a>
              ))}
            </div>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <h4 className="text-white font-bold text-lg mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {[
                { href: "/", label: "Home" },
                { href: "/contests", label: "Active Contests" },
                { href: "/leaderboard", label: "Leaderboard" },
                { href: "/about", label: "About Us" },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>
                    <motion.a
                      className="hover:text-white transition-colors duration-300 cursor-pointer"
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      {item.label}
                    </motion.a>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <h4 className="text-white font-bold text-lg mb-6">Support</h4>
            <ul className="space-y-3">
              {[
                { href: "/faq", label: "FAQ" },
                { href: "/contact", label: "Contact Us" },
                { href: "#", label: "Help Center" },
                { href: "#", label: "Report Issue" },
                { href: "#", label: "Community Guidelines" },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>
                    <motion.a
                      className="hover:text-white transition-colors duration-300 cursor-pointer"
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      {item.label}
                    </motion.a>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <h4 className="text-white font-bold text-lg mb-6">Legal</h4>
            <ul className="space-y-3">
              {[
                "Privacy Policy",
                "Terms of Service",
                "Contest Rules",
                "Cookie Policy",
                "DMCA"
              ].map((item) => (
                <li key={item}>
                  <motion.a
                    href="#"
                    className="hover:text-white transition-colors duration-300"
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    {item}
                  </motion.a>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>

        <motion.div
          className="border-t border-gray-800 mt-12 pt-8 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <p className="text-gray-400">
            &copy; 2024 Universal Muse. All rights reserved. Made with ❤️ for the modeling community.
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
