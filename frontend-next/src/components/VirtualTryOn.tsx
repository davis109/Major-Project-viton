'use client'

import { motion } from 'framer-motion'
import { Sparkles, Loader2, RefreshCw } from 'lucide-react'
import Image from 'next/image'

interface Product {
  name: string
  product_id: number
  price: number
  img: string
  seller: string
  discount: number
  main_category: string
  subcategory: string
  extract_images: string
}

interface TryOnResult {
  selected_image: string
  recommended_images: Array<{
    name: string
    subcategory: string
    fitted_image: string
    original_image: string
    seller: string
    price: number
    discount: number
  }>
}

interface VirtualTryOnProps {
  userImage: string | null
  selectedProduct: Product | null
  tryOnResult: TryOnResult | null
  isLoading: boolean
  onGetRecommendations?: (product: Product) => Promise<void>
}

export default function VirtualTryOn({
  userImage,
  selectedProduct,
  tryOnResult,
  isLoading,
  onGetRecommendations,
}: VirtualTryOnProps) {
  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Image */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
            <span>Your Photo</span>
            <motion.button
              whileHover={{ rotate: 180 }}
              className="p-1 text-neutral-400 hover:text-primary-500"
            >
              <RefreshCw size={16} />
            </motion.button>
          </h3>
          
          <div className="aspect-[3/4] bg-neutral-100 rounded-xl overflow-hidden border-2 border-neutral-200">
            {userImage ? (
              <Image
                src={userImage}
                alt="User photo"
                width={300}
                height={400}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-neutral-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="text-neutral-400" size={32} />
                  </div>
                  <p className="text-neutral-500">Upload your photo to get started</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Try-On Result */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
            <Sparkles className="text-primary-500" size={20} />
            Try-On Result
          </h3>
          
          <div className="aspect-[3/4] bg-gradient-to-br from-neutral-100 to-neutral-50 rounded-xl overflow-hidden border-2 border-dashed border-neutral-300 relative">
            {isLoading && (
              <div className="absolute inset-0 bg-white/90 flex items-center justify-center z-10">
                <div className="text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full mx-auto mb-4"
                  />
                  <p className="text-primary-600 font-semibold">Creating your virtual try-on...</p>
                  <p className="text-sm text-neutral-500 mt-1">This may take a few seconds</p>
                </div>
              </div>
            )}

            {tryOnResult?.selected_image ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative w-full h-full"
              >
                <Image
                  src={`http://localhost:8001${tryOnResult.selected_image}`}
                  alt="Virtual try-on result"
                  width={300}
                  height={400}
                  className="w-full h-full object-cover"
                  onError={(e: any) => {
                    console.error('Error loading try-on result image:', tryOnResult.selected_image)
                    e.currentTarget.src = '/placeholder-result.png'
                  }}
                />
                
                {/* Success Badge */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg"
                >
                  ✓ Perfect Fit!
                </motion.div>
                
                {/* Get Recommendations Button */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="absolute bottom-4 left-4 right-4 bg-primary-500 hover:bg-primary-600 text-white py-2 px-4 rounded-lg font-semibold text-sm transition-colors duration-200"
                  onClick={() => {
                    if (selectedProduct && onGetRecommendations) {
                      onGetRecommendations(selectedProduct)
                    }
                  }}
                >
                  Get Similar Recommendations
                </motion.button>
              </motion.div>
            ) : !isLoading && selectedProduct ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="text-primary-500" size={32} />
                  </div>
                  <p className="text-neutral-600 font-semibold mb-2">Ready to try on</p>
                  <p className="text-sm text-neutral-500">{selectedProduct.name}</p>
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-neutral-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="text-neutral-400" size={32} />
                  </div>
                  <p className="text-neutral-500">Select an item to see how it looks on you</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Selected Product Info */}
      {selectedProduct && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-gradient-to-r from-primary-50 to-accent-50 rounded-xl border border-primary-200"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white rounded-lg overflow-hidden border">
              <Image
                src={selectedProduct.img}
                alt={selectedProduct.name}
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-neutral-900">{selectedProduct.name}</h4>
              <p className="text-sm text-neutral-600 capitalize">{selectedProduct.subcategory}</p>
              <p className="text-lg font-bold text-primary-600">₹{selectedProduct.price}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-neutral-500">by {selectedProduct.seller}</p>
              {selectedProduct.discount > 0 && (
                <p className="text-sm font-semibold text-accent-600">
                  {selectedProduct.discount}% OFF
                </p>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}