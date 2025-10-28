'use client'

import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, ShoppingBag, Eye, Sparkles } from 'lucide-react'
import { useApp } from '@/contexts/AppContext'
import { API_BASE_URL } from '@/lib/config'
import toast from 'react-hot-toast'

interface ProductCardProps {
  product: {
    product_id: number
    name: string
    price: number
    img: string
    seller: string
    discount: number
    main_category: string
    subcategory: string
    extract_images?: string
  }
  onTryOn?: (product: any) => void
  index?: number
}

export default function ProductCard({ product, onTryOn, index = 0 }: ProductCardProps) {
  const { addToCart, toggleFavorite, isFavorite } = useApp()
  const [isHovered, setIsHovered] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const favorite = isFavorite(product.product_id)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation()
    addToCart(product)
    toast.success('Added to cart!', {
      icon: '🛍️',
    })
  }

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleFavorite(product)
    
    if (!favorite) {
      toast.success('Added to favorites!', {
        icon: '❤️',
      })
    }
  }

  const handleTryOn = () => {
    if (onTryOn) {
      onTryOn(product)
    }
  }

  const discountedPrice = product.price * (1 - product.discount / 100)

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay: Math.min(index * 0.05, 0.5),
        ease: 'easeOut' 
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -8 }}
      className="group relative bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer"
    >
      {/* Discount Badge */}
      {product.discount > 0 && (
        <motion.div
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          className="absolute top-3 left-3 z-10 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg"
        >
          -{product.discount}%
        </motion.div>
      )}

      {/* Favorite Button */}
      <motion.button
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleToggleFavorite}
        className="absolute top-3 right-3 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors"
      >
        <Heart
          size={20}
          className={`transition-colors ${
            favorite ? 'fill-accent-500 text-accent-500' : 'text-neutral-600'
          }`}
        />
      </motion.button>

      {/* Product Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100">
        <img
          ref={imageRef}
          src={`${API_BASE_URL}${product.img}`}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23f0f0f0" width="400" height="400"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="18" text-anchor="middle" x="200" y="200"%3ENo Image%3C/text%3E%3C/svg%3E'
          }}
        />
        
        {/* Hover Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-end justify-center pb-6 gap-3"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleTryOn}
            className="bg-white text-neutral-900 px-4 py-2 rounded-full font-semibold text-sm shadow-lg hover:bg-primary-50 transition-colors flex items-center gap-2"
          >
            <Sparkles size={16} />
            Try On
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-colors"
          >
            <Eye size={16} />
          </motion.button>
        </motion.div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="font-semibold text-neutral-900 mb-1 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {product.name}
        </h3>
        <p className="text-xs text-neutral-500 mb-2">{product.seller}</p>
        
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-primary-600">
                ₹{discountedPrice.toFixed(2)}
              </span>
              {product.discount > 0 && (
                <span className="text-sm text-neutral-400 line-through">
                  ₹{product.price.toFixed(2)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Add to Cart Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAddToCart}
          className="w-full bg-gradient-to-r from-primary-500 to-accent-500 text-white py-2.5 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <ShoppingBag size={18} />
          Add to Cart
        </motion.button>
      </div>

      {/* Shine Effect */}
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: isHovered ? '100%' : '-100%' }}
        transition={{ duration: 0.6 }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
      />
    </motion.div>
  )
}
