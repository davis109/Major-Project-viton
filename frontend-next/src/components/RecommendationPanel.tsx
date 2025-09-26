'use client'

import { motion } from 'framer-motion'
import { Star, Heart, ShoppingBag, ExternalLink } from 'lucide-react'
import Image from 'next/image'

interface Recommendation {
  name: string
  subcategory: string
  fitted_image: string
  original_image: string
  seller: string
  price: number
  discount: number
}

interface RecommendationPanelProps {
  recommendations: Recommendation[]
}

export default function RecommendationPanel({ recommendations }: RecommendationPanelProps) {
  return (
    <div className="p-6">
      <div className="space-y-4">
        {recommendations.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="text-neutral-400" size={32} />
            </div>
            <p className="text-neutral-500">No recommendations yet</p>
            <p className="text-sm text-neutral-400 mt-1">Try on an item to get personalized suggestions</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {recommendations.slice(0, 6).map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="group bg-white rounded-xl border border-neutral-200 hover:border-primary-300 hover:shadow-lg transition-all duration-300 overflow-hidden"
              >
                <div className="flex">
                  {/* Fitted Image */}
                  <div className="w-24 h-32 flex-shrink-0 bg-neutral-100 relative overflow-hidden">
                <Image
                  src={`http://localhost:8001${item.fitted_image}`}
                  alt={`${item.name} fitted`}
                  width={96}
                  height={128}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e: any) => {
                    // Try to fallback to original image
                    const fallbackSrc = `http://localhost:8001${item.original_image}`
                    if (e.currentTarget.src !== fallbackSrc) {
                      e.currentTarget.src = fallbackSrc
                    } else {
                      e.currentTarget.src = '/placeholder-fitted.png'
                    }
                  }}
                />                    {/* Discount Badge */}
                    {item.discount > 0 && (
                      <div className="absolute top-2 left-2 bg-accent-500 text-white text-xs px-2 py-1 rounded-full">
                        -{item.discount}%
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1 min-w-0 pr-2">
                        <h4 className="font-semibold text-neutral-900 text-sm line-clamp-2 mb-1">
                          {item.name}
                        </h4>
                        <p className="text-xs text-neutral-600 capitalize mb-1">
                          {item.subcategory}
                        </p>
                        <p className="text-xs text-neutral-500">{item.seller}</p>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex flex-col items-end gap-1">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-1 text-neutral-400 hover:text-accent-500 transition-colors duration-200"
                        >
                          <Heart size={14} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-1 text-neutral-400 hover:text-primary-500 transition-colors duration-200"
                        >
                          <ExternalLink size={14} />
                        </motion.button>
                      </div>
                    </div>

                    {/* Price and Rating */}
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-neutral-900">
                          ₹{item.price}
                        </span>
                        {item.discount > 0 && (
                          <span className="text-xs text-neutral-500 line-through">
                            ₹{Math.round(item.price / (1 - item.discount / 100))}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Star size={12} className="text-yellow-400 fill-current" />
                        <span className="text-xs text-neutral-600">4.3</span>
                      </div>
                    </div>

                    {/* Add to Cart Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full mt-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white text-xs font-semibold py-2 px-3 rounded-lg hover:from-primary-600 hover:to-accent-600 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <ShoppingBag size={12} />
                      Add to Cart
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* View All Button */}
        {recommendations.length > 6 && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full mt-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold py-3 px-4 rounded-xl transition-colors duration-300"
          >
            View All {recommendations.length} Recommendations
          </motion.button>
        )}
      </div>

      {/* Trust Indicators */}
      <div className="mt-6 pt-4 border-t border-neutral-200">
        <div className="flex items-center justify-center gap-6 text-xs text-neutral-500">
          <div className="flex items-center gap-1">
            <Star className="text-yellow-400 fill-current" size={12} />
            <span>AI Curated</span>
          </div>
          <div className="flex items-center gap-1">
            <Heart className="text-accent-400" size={12} />
            <span>Personalized</span>
          </div>
          <div className="flex items-center gap-1">
            <ShoppingBag className="text-primary-400" size={12} />
            <span>Trending</span>
          </div>
        </div>
      </div>
    </div>
  )
}