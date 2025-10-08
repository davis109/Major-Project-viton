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
  onTryOn?: (product: Product) => Promise<void>
  onTryOnRecommended?: (recommendedItem: any) => Promise<void>
}

export default function VirtualTryOn({
  userImage,
  selectedProduct,
  tryOnResult,
  isLoading,
  onGetRecommendations,
  onTryOn,
  onTryOnRecommended,
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
              <div className="relative w-full h-full">
                <Image
                  src={`http://localhost:8001${selectedProduct.img}`}
                  alt={selectedProduct.name}
                  width={300}
                  height={400}
                  className="w-full h-full object-cover"
                  onError={(e: any) => {
                    // If main image fails, try the extract_images path
                    const extractPath = `/fitted_images/${selectedProduct.extract_images}`
                    if (e.currentTarget.src !== `http://localhost:8001${extractPath}`) {
                      e.currentTarget.src = `http://localhost:8001${extractPath}`
                    } else {
                      // If both fail, show placeholder
                      e.currentTarget.style.display = 'none'
                      e.currentTarget.parentElement.innerHTML = `
                        <div class="w-full h-full flex items-center justify-center bg-neutral-100">
                          <div class="text-center">
                            <div class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <svg class="w-8 h-8 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                              </svg>
                            </div>
                            <p class="text-neutral-600 font-semibold mb-1">Ready to try on</p>
                            <p class="text-sm text-neutral-500">${selectedProduct.name}</p>
                          </div>
                        </div>
                      `
                    }
                  }}
                />
                
                {/* Ready to Try-On Badge */}
                <div className="absolute top-4 right-4 bg-primary-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                  Ready to Try On
                </div>
                
                {/* Try-On Button */}
                <div className="absolute bottom-4 left-4 right-4 space-y-2">
                  {!userImage && (
                    <div className="bg-amber-100 border border-amber-300 text-amber-800 px-3 py-2 rounded-lg text-xs text-center">
                      👆 Upload your photo first to try on this item
                    </div>
                  )}
                  <button
                    onClick={() => onTryOn && onTryOn(selectedProduct)}
                    disabled={!userImage || isLoading}
                    className={`w-full py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 ${
                      userImage && !isLoading
                        ? 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg transform hover:scale-105'
                        : 'bg-neutral-400 text-neutral-200 cursor-not-allowed'
                    }`}
                  >
                    {!userImage 
                      ? '📸 Upload Photo First' 
                      : isLoading 
                      ? '⏳ Creating Virtual Try-On...' 
                      : '✨ Try On This Item'
                    }
                  </button>
                </div>

                {/* Product Name Overlay */}
                <div className="absolute top-4 left-4 right-4 bg-black bg-opacity-60 text-white p-3 rounded-lg">
                  <p className="font-semibold">{selectedProduct.name}</p>
                  <p className="text-xs opacity-90 capitalize">{selectedProduct.subcategory}</p>
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center p-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-red-500 text-2xl">⚠️</span>
                  </div>
                  <p className="text-red-600 font-semibold mb-2">Virtual Try-On Server Required</p>
                  <p className="text-sm text-neutral-600 mb-4">
                    To see how clothes look on YOUR uploaded photo, the backend server needs to be running.
                  </p>
                  <p className="text-xs text-neutral-500">
                    Without the server, you'll see incorrect results using different people's photos.
                  </p>
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
                src={`http://localhost:8001${selectedProduct.img}`}
                alt={selectedProduct.name}
                width={64}
                height={64}
                className="w-full h-full object-cover"
                onError={(e: any) => {
                  const extractPath = `/fitted_images/${selectedProduct.extract_images}`
                  if (e.currentTarget.src !== `http://localhost:8001${extractPath}`) {
                    e.currentTarget.src = `http://localhost:8001${extractPath}`
                  }
                }}
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

      {/* Recommended Items */}
      {tryOnResult?.recommended_images && tryOnResult.recommended_images.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="text-primary-500" size={24} />
            <h3 className="text-xl font-bold text-neutral-900">Recommended for You</h3>
            <div className="h-px bg-neutral-200 flex-1"></div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {tryOnResult.recommended_images.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="group bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
                onClick={() => onTryOnRecommended && onTryOnRecommended(item)}
              >
                <div className="relative aspect-square overflow-hidden">
                  <Image
                    src={`http://localhost:8001${item.original_image}`}
                    alt={item.name}
                    width={200}
                    height={200}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e: any) => {
                      e.currentTarget.style.display = 'none'
                      e.currentTarget.parentElement.innerHTML = `
                        <div class="w-full h-full bg-neutral-100 flex items-center justify-center">
                          <span class="text-neutral-400 text-xs">No Image</span>
                        </div>
                      `
                    }}
                  />
                  
                  {/* Discount Badge */}
                  {item.discount > 0 && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      -{Math.round(item.discount)}%
                    </div>
                  )}

                  {/* Try-On Button Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
                    <div className="bg-primary-600 text-white px-3 py-2 rounded-full text-xs font-medium opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-lg">
                      ✨ Try This On
                    </div>
                  </div>
                </div>

                {/* Product Details */}
                <div className="p-3">
                  <h4 className="font-semibold text-neutral-800 text-sm line-clamp-2 mb-1">{item.name}</h4>
                  <p className="text-xs text-neutral-500 mb-2 capitalize">{item.subcategory}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <span className="text-primary-600 font-bold text-sm">
                        ₹{Math.round(item.price * (1 - item.discount / 100))}
                      </span>
                      {item.discount > 0 && (
                        <span className="text-neutral-400 line-through text-xs">
                          ₹{Math.round(item.price)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center text-yellow-500">
                      <span className="text-xs">⭐ 4.2</span>
                    </div>
                  </div>
                  
                  <p className="text-xs text-neutral-500 mt-1">by {item.seller}</p>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-sm text-neutral-600">
              Click on any item above to try it on virtually! 
              <span className="text-primary-600 font-semibold"> No automatic try-on</span> - only when you click.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  )
}