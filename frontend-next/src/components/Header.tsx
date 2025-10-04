'use client'

import { motion } from 'framer-motion'
import { Sparkles, Menu, Search, ShoppingBag, User, Heart } from 'lucide-react'

export default function Header() {
  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-neutral-200"
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-3 cursor-pointer"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">
                  AI VITON
                </h1>
                <p className="text-xs text-neutral-500 -mt-1">Virtual Fashion</p>
              </div>
            </motion.div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <motion.a
              whileHover={{ y: -2 }}
              href="#"
              className="text-neutral-700 hover:text-primary-600 font-semibold transition-colors duration-200"
            >
              Try On
            </motion.a>
            <motion.a
              whileHover={{ y: -2 }}
              href="/collections"
              className="text-neutral-700 hover:text-primary-600 font-semibold transition-colors duration-200"
            >
              Collections
            </motion.a>
            <motion.a
              whileHover={{ y: -2 }}
              href="#"
              className="text-neutral-700 hover:text-primary-600 font-semibold transition-colors duration-200"
            >
              Trends
            </motion.a>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 text-neutral-600 hover:text-primary-600 transition-colors duration-200"
            >
              <Search size={20} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 text-neutral-600 hover:text-primary-600 transition-colors duration-200 relative"
            >
              <Heart size={20} />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent-500 text-white text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 text-neutral-600 hover:text-primary-600 transition-colors duration-200 relative"
            >
              <ShoppingBag size={20} />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center">
                2
              </span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 text-neutral-600 hover:text-primary-600 transition-colors duration-200 md:hidden"
            >
              <Menu size={20} />
            </motion.button>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="hidden md:flex items-center gap-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white px-4 py-2 rounded-full cursor-pointer shadow-lg"
            >
              <User size={16} />
              <span className="font-semibold">Profile</span>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.header>
  )
}