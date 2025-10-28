'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Menu, Search, ShoppingBag, User, Heart, X } from 'lucide-react'
import { useApp } from '@/contexts/AppContext'
import { API_BASE_URL } from '@/lib/config'
import gsap from 'gsap'

export default function Header() {
  const { cartCount, favoritesCount } = useApp()
  const [showCart, setShowCart] = useState(false)
  const [showFavorites, setShowFavorites] = useState(false)
  const logoRef = useRef<HTMLDivElement>(null)
  const navRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // GSAP entrance animation
    const ctx = gsap.context(() => {
      gsap.from(logoRef.current, {
        x: -100,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
      })
      
      gsap.from(navRef.current?.children || [], {
        y: -50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'back.out(1.7)',
        delay: 0.3,
      })
    })

    return () => ctx.revert()
  }, [])

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-neutral-200 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center" ref={logoRef}>
              <motion.a
                href="/"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-3 cursor-pointer"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Sparkles className="text-white" size={24} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">
                    VITON
                  </h1>
                  <p className="text-xs text-neutral-500 -mt-1">Virtual Fashion</p>
                </div>
              </motion.a>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8" ref={navRef}>
              <motion.a
                whileHover={{ y: -2 }}
                href="/"
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
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 text-neutral-600 hover:text-primary-600 transition-colors duration-200"
              >
                <Search size={20} />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowFavorites(true)}
                className="p-2 text-neutral-600 hover:text-accent-600 transition-colors duration-200 relative"
              >
                <Heart size={20} />
                {favoritesCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-accent-500 text-white text-xs rounded-full flex items-center justify-center font-bold"
                  >
                    {favoritesCount}
                  </motion.span>
                )}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCart(true)}
                className="p-2 text-neutral-600 hover:text-primary-600 transition-colors duration-200 relative"
              >
                <ShoppingBag size={20} />
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center font-bold"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 text-neutral-600 hover:text-primary-600 transition-colors duration-200 md:hidden"
              >
                <Menu size={20} />
              </motion.button>
              
              <motion.div
                whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}
                whileTap={{ scale: 0.95 }}
                className="hidden md:flex items-center gap-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white px-4 py-2 rounded-full cursor-pointer shadow-lg"
              >
                <User size={16} />
                <span className="text-sm font-semibold">Profile</span>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Cart Sidebar */}
      <CartSidebar isOpen={showCart} onClose={() => setShowCart(false)} />
      
      {/* Favorites Sidebar */}
      <FavoritesSidebar isOpen={showFavorites} onClose={() => setShowFavorites(false)} />
    </>
  )
}

// Cart Sidebar Component
function CartSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { cart, removeFromCart, updateCartQuantity, cartTotal } = useApp()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full md:w-96 bg-white shadow-2xl z-50 flex flex-col"
          >
            <div className="p-6 border-b border-neutral-200 flex items-center justify-between bg-gradient-to-r from-primary-50 to-accent-50">
              <h2 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
                <ShoppingBag className="text-primary-600" size={24} />
                Shopping Cart
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="mx-auto mb-4 text-neutral-300" size={64} />
                  <p className="text-neutral-500">Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <motion.div
                      key={item.product_id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex gap-4 p-4 bg-neutral-50 rounded-lg"
                    >
                      <img
                        src={`${API_BASE_URL}${item.img}`}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                        }}
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm">{item.name}</h3>
                        <p className="text-xs text-neutral-500">{item.seller}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateCartQuantity(item.product_id, item.quantity - 1)}
                            className="w-6 h-6 rounded-full bg-neutral-200 hover:bg-neutral-300 flex items-center justify-center"
                          >
                            -
                          </button>
                          <span className="text-sm font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => updateCartQuantity(item.product_id, item.quantity + 1)}
                            className="w-6 h-6 rounded-full bg-neutral-200 hover:bg-neutral-300 flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary-600">
                          ₹{(item.price * (1 - item.discount / 100) * item.quantity).toFixed(2)}
                        </p>
                        <button
                          onClick={() => removeFromCart(item.product_id)}
                          className="text-xs text-red-500 hover:text-red-700 mt-2"
                        >
                          Remove
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t border-neutral-200 p-6 bg-neutral-50">
                <div className="flex justify-between mb-4">
                  <span className="font-semibold">Total:</span>
                  <span className="text-2xl font-bold text-primary-600">
                    ₹{cartTotal.toFixed(2)}
                  </span>
                </div>
                <button className="w-full bg-gradient-to-r from-primary-500 to-accent-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all">
                  Checkout
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Favorites Sidebar Component
function FavoritesSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { favorites, toggleFavorite } = useApp()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full md:w-96 bg-white shadow-2xl z-50 flex flex-col"
          >
            <div className="p-6 border-b border-neutral-200 flex items-center justify-between bg-gradient-to-r from-accent-50 to-primary-50">
              <h2 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
                <Heart className="text-accent-600" size={24} />
                Favorites
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {favorites.length === 0 ? (
                <div className="text-center py-12">
                  <Heart className="mx-auto mb-4 text-neutral-300" size={64} />
                  <p className="text-neutral-500">No favorites yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {favorites.map((item) => (
                    <motion.div
                      key={item.product_id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="relative group"
                    >
                      <img
                        src={`${API_BASE_URL}${item.img}`}
                        alt={item.name}
                        className="w-full h-40 object-cover rounded-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                        }}
                      />
                      <button
                        onClick={() => toggleFavorite(item)}
                        className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Heart className="text-accent-500 fill-accent-500" size={16} />
                      </button>
                      <div className="mt-2">
                        <h3 className="text-sm font-semibold truncate">{item.name}</h3>
                        <p className="text-xs text-primary-600 font-bold">
                          ₹{(item.price * (1 - item.discount / 100)).toFixed(2)}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}