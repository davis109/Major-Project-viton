'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Sparkles, Shirt, User, Heart, Star, ShoppingBag, Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import Header from '@/components/Header'
import ImageUpload from '@/components/ImageUpload' 
import ProductGallery from '@/components/ProductGallery'
import VirtualTryOn from '@/components/VirtualTryOn'
import RecommendationPanel from '@/components/RecommendationPanel'
import LoadingSpinner from '@/components/LoadingSpinner'

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

export default function Home() {
  const [userImage, setUserImage] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [tryOnResult, setTryOnResult] = useState<TryOnResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)

  // Fetch products on mount
  const fetchProducts = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:8001/get_myntra_data')
      if (response.ok) {
        const data = await response.json()
        setProducts(data)
      } else {
        toast.error('Failed to load products')
      }
    } catch (error) {
      toast.error('Error loading products')
    } finally {
      setLoadingProducts(false)
    }
  }, [])

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // Handle user image upload
  const handleImageUpload = useCallback(async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('http://localhost:8001/take_user_image', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()
        setUserImage(URL.createObjectURL(file))
        toast.success('Photo uploaded successfully!')
      } else {
        throw new Error('Upload failed')
      }
    } catch (error) {
      toast.error('Failed to upload photo')
    }
  }, [])

  // Handle getting recommendations separately
  const handleGetRecommendations = useCallback(async (product: Product) => {
    if (!product) {
      toast.error('No product selected for recommendations')
      return
    }

    setIsLoading(true)

    try {
      const requestData = {
        main_category: product.main_category,
        target_audience: 'Female', // Default for now
        extract_images: product.extract_images
      }

      const response = await fetch('http://localhost:8001/get_recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      if (response.ok) {
        const result = await response.json()
        // Update only the recommendations part, keep the selected_image
        setTryOnResult(prev => ({
          selected_image: prev?.selected_image || '',
          recommended_images: result.recommended_images || []
        }))
        toast.success('Recommendations loaded!')
      } else {
        throw new Error('Failed to get recommendations')
      }
    } catch (error) {
      toast.error('Failed to get recommendations. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [])
  const handleTryOn = useCallback(async (product: Product) => {
    if (!userImage) {
      toast.error('Please upload your photo first!')
      return
    }

    setSelectedProduct(product)
    setIsLoading(true)

    try {
      const requestData = {
        main_category: product.main_category,
        extract_images: product.extract_images
      }

      const response = await fetch('http://localhost:8001/single_item_tryon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          // Create a simplified result structure for single item try-on
          
          // Validate that the fitted_image path is reasonable
          if (result.fitted_image && typeof result.fitted_image === 'string') {
            setTryOnResult({
              selected_image: result.fitted_image,
              recommended_images: [] // No recommendations for single item try-on
            })
            toast.success('Virtual try-on completed!')
          } else {
            throw new Error('Invalid image path received from server')
          }
        } else {
          throw new Error(result.error || 'Try-on failed')
        }
      } else {
        throw new Error('Try-on failed')
      }
    } catch (error) {
      toast.error('Virtual try-on failed. Please try again.')
      // Reset try-on result on error to prevent crashes
      setTryOnResult(null)
    } finally {
      setIsLoading(false)
    }
  }, [userImage])

  return (
    <div className="min-h-screen">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-accent-50">
        <div className="absolute inset-0 bg-pattern opacity-30"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-20">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                <Sparkles size={16} />
                AI-Powered Virtual Try-On
              </div>
              <h1 className="text-6xl font-bold text-neutral-900 mb-6 text-shadow">
                Experience Fashion
                <span className="bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent block">
                  Like Never Before
                </span>
              </h1>
              <p className="text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
                Upload your photo and instantly see how any outfit looks on you with our advanced AI technology. 
                Discover your perfect style with personalized recommendations.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
            >
              <div className="flex items-center gap-2 text-neutral-700">
                <Zap className="text-primary-500" size={20} />
                <span className="font-semibold">Instant Results</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-700">
                <Heart className="text-accent-500" size={20} />
                <span className="font-semibold">Personalized</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-700">
                <Star className="text-yellow-500" size={20} />
                <span className="font-semibold">Premium Quality</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Image Upload & Try-On Result */}
          <div className="lg:col-span-8">
            <div className="space-y-6">
              {/* Image Upload Section */}
              {!userImage && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="card p-8"
                >
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="text-primary-600" size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-neutral-900 mb-2">Upload Your Photo</h2>
                    <p className="text-neutral-600">Get started by uploading a clear photo of yourself</p>
                  </div>
                  <ImageUpload onImageUpload={handleImageUpload} />
                </motion.div>
              )}

              {/* Virtual Try-On Result */}
              {userImage && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card overflow-hidden"
                >
                  <div className="p-6 border-b border-neutral-200 bg-gradient-to-r from-primary-50 to-accent-50">
                    <h2 className="text-2xl font-bold text-neutral-900 flex items-center gap-3">
                      <Shirt className="text-primary-600" size={28} />
                      Virtual Try-On Studio
                    </h2>
                  </div>
                  
                  <VirtualTryOn
                    userImage={userImage}
                    selectedProduct={selectedProduct}
                    tryOnResult={tryOnResult}
                    isLoading={isLoading}
                    onGetRecommendations={handleGetRecommendations}
                  />
                </motion.div>
              )}
            </div>
          </div>

          {/* Right Column - Products & Recommendations */}
          <div className="lg:col-span-4">
            <div className="space-y-6">
              {/* Product Gallery */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="card"
              >
                <div className="p-6 border-b border-neutral-200 bg-gradient-to-r from-neutral-50 to-neutral-100">
                  <h3 className="text-xl font-bold text-neutral-900 flex items-center gap-3">
                    <ShoppingBag className="text-accent-500" size={24} />
                    Fashion Collection
                  </h3>
                </div>
                
                <div className="p-6">
                  {loadingProducts ? (
                    <div className="space-y-4">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="shimmer-effect h-20 rounded-lg"></div>
                      ))}
                    </div>
                  ) : (
                    <ProductGallery
                      products={products}
                      onProductSelect={handleTryOn}
                      selectedProduct={selectedProduct}
                    />
                  )}
                </div>
              </motion.div>

              {/* Recommendations - Only show if there are actual recommendations */}
              {tryOnResult && tryOnResult.recommended_images && tryOnResult.recommended_images.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="card"
                >
                  <div className="p-6 border-b border-neutral-200 bg-gradient-to-r from-primary-50 to-accent-50">
                    <h3 className="text-xl font-bold text-neutral-900 flex items-center gap-3">
                      <Sparkles className="text-primary-600" size={24} />
                      Recommended for You
                    </h3>
                  </div>
                  
                  <RecommendationPanel recommendations={tryOnResult?.recommended_images || []} />
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && <LoadingSpinner />}
      </AnimatePresence>
    </div>
  )
}