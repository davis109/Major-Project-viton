'use client'

import { motion } from 'framer-motion'
import { Sparkles, Heart, Mail, Phone, MapPin } from 'lucide-react'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-neutral-900 to-neutral-800 text-white">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3 mb-4"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="text-white" size={28} />
              </div>
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                  VITON
                </h3>
                <p className="text-xs text-neutral-400">Virtual Fashion</p>
              </div>
            </motion.div>
            <p className="text-neutral-400 text-sm leading-relaxed">
              Experience the future of fashion with AI-powered virtual try-on technology. 
              See yourself in any outfit instantly.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {['Try On', 'Collections', 'Trends', 'About Us'].map((item) => (
                <li key={item}>
                  <Link
                    href={item === 'Collections' ? '/collections' : '#'}
                    className="text-neutral-400 hover:text-primary-400 transition-colors text-sm"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              {['FAQ', 'How It Works', 'Privacy Policy', 'Terms of Service'].map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="text-neutral-400 hover:text-primary-400 transition-colors text-sm"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-neutral-400 text-sm">
                <Mail size={16} className="text-primary-400" />
                <span>support@viton.com</span>
              </li>
              <li className="flex items-center gap-3 text-neutral-400 text-sm">
                <Phone size={16} className="text-primary-400" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-3 text-neutral-400 text-sm">
                <MapPin size={16} className="text-primary-400" />
                <span>San Francisco, CA</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-neutral-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-neutral-400 text-sm">
              © 2025 VITON. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-neutral-400 text-sm">
              <span>Made with</span>
              <Heart className="text-red-500 fill-red-500" size={16} />
              <span>by the VITON Team</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
