'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Sparkles, Shirt, User, Heart, Star, Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ImageUpload from '@/components/ImageUpload' 
import VirtualTryOn from '@/components/VirtualTryOn'
import LoadingSpinner from '@/components/LoadingSpinner'
import { API_BASE_URL } from '@/lib/config'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

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
  const [showClothingUpload, setShowClothingUpload] = useState(false)
  const [clothingImage, setClothingImage] = useState<File | null>(null)
  const [clothingCategory, setClothingCategory] = useState<'upperware' | 'lowerware' | 'dress'>('upperware')
  const [clothingPreview, setClothingPreview] = useState<string | null>(null)

  const heroRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // GSAP animations for hero section
    const ctx = gsap.context(() => {
      // Animate title with split text effect
      gsap.from(titleRef.current, {
        y: 100,
        opacity: 0,
        duration: 1.2,
        ease: 'power4.out',
      })

      // Animate features
      gsap.from(featuresRef.current?.children || [], {
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: 'back.out(1.7)',
        delay: 0.5,
      })

      // Background animation
      gsap.to(heroRef.current, {
        backgroundPosition: '200% 0%',
        duration: 20,
        repeat: -1,
        yoyo: true,
        ease: 'none',
      })
    })

    return () => ctx.revert()
  }, [])

  // Check for selected product from collections page
  useEffect(() => {
    const selectedProductData = localStorage.getItem('selectedProduct')
    if (selectedProductData) {
      try {
        const product = JSON.parse(selectedProductData)
        setSelectedProduct(product)
        localStorage.removeItem('selectedProduct') // Clean up
        
        // Auto-scroll to the try-on section
        setTimeout(() => {
          const tryOnSection = document.getElementById('try-on-section')
          if (tryOnSection) {
            tryOnSection.scrollIntoView({ behavior: 'smooth' })
          }
        }, 500)
        
        toast.success(`${product.name} selected for virtual try-on!`)
      } catch (error) {
        console.error('Error parsing selected product:', error)
      }
    }
  }, [])

  // Handle user image upload
  const handleImageUpload = useCallback(async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch(`${API_BASE_URL}/take_user_image`, {
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

      const response = await fetch(`${API_BASE_URL}/get_recommendations`, {
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

      const response = await fetch(`${API_BASE_URL}/single_item_tryon`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          // Validate that the fitted_image path is reasonable
          if (result.fitted_image && typeof result.fitted_image === 'string') {
            setTryOnResult({
              selected_image: result.fitted_image,
              recommended_images: [] // Will be populated separately when user requests
            })
            toast.success('Virtual try-on completed!')
            
            // After successful try-on, automatically get recommendations (but don't try them on)
            handleGetRecommendations(product)
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
      console.error('Virtual try-on failed:', error)
      toast.error('Virtual try-on failed. Please try again.')
      setTryOnResult(null)
    } finally {
      setIsLoading(false)
    }
  }, [userImage, handleGetRecommendations])

  // Handle trying on recommended items
  const handleTryOnRecommended = useCallback(async (recommendedItem: any) => {
    if (!userImage) {
      toast.error('Please upload your photo first!')
      return
    }

    setIsLoading(true)

    try {
      const requestData = {
        main_category: recommendedItem.main_category || selectedProduct?.main_category,
        extract_images: recommendedItem.extract_images
      }

      const response = await fetch(`${API_BASE_URL}/single_item_tryon`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          if (result.fitted_image && typeof result.fitted_image === 'string') {
            // Update the try-on result with the new recommended item
            setTryOnResult(prev => ({
              selected_image: result.fitted_image,
              recommended_images: prev?.recommended_images || []
            }))
            toast.success(`Trying on ${recommendedItem.name}!`)
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
      console.error('Recommended item try-on failed:', error)
      toast.error('Try-on failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [userImage, selectedProduct])

  // Handle clothing item upload
  const handleClothingImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setClothingImage(file)
      setClothingPreview(URL.createObjectURL(file))
    }
  }

  // Handle custom clothing try-on with Segmind API
  const handleCustomClothingTryOn = async () => {
    if (!userImage) {
      toast.error('Please upload your photo first!')
      return
    }
    
    if (!clothingImage) {
      toast.error('Please upload a clothing item!')
      return
    }

    setIsLoading(true)

    try {
      // Map category to Segmind format
      let segmindCategory = ''
      if (clothingCategory === 'upperware') {
        segmindCategory = 'Upper body'
      } else if (clothingCategory === 'lowerware') {
        segmindCategory = 'Lower body'
      } else if (clothingCategory === 'dress') {
        segmindCategory = 'Dress'
      }

      // Upload clothing image to backend
      const formData = new FormData()
      formData.append('file', clothingImage)
      formData.append('category', segmindCategory)

      const response = await fetch(`${API_BASE_URL}/custom_clothing_tryon`, {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setTryOnResult({
            selected_image: result.fitted_image,
            recommended_images: []
          })
          toast.success('Virtual try-on completed with your custom clothing!')
        } else {
          throw new Error(result.error || 'Try-on failed')
        }
      } else {
        throw new Error('Try-on failed')
      }
    } catch (error) {
      console.error('Custom clothing try-on failed:', error)
      toast.error('Virtual try-on failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section ref={heroRef} className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-accent-50" style={{ backgroundSize: '200% 200%' }}>
        <div className="absolute inset-0 bg-pattern opacity-30"></div>
        
        {/* Floating shapes */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-primary-200 rounded-full blur-3xl opacity-50 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-accent-200 rounded-full blur-3xl opacity-50 animate-pulse delay-1000"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-24 md:py-32">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-100 to-accent-100 text-primary-700 px-6 py-3 rounded-full text-sm font-semibold mb-8 shadow-lg">
                <Sparkles size={18} />
                AI-Powered Virtual Try-On
              </div>
              <h1 ref={titleRef} className="text-5xl md:text-7xl font-bold text-neutral-900 mb-6 leading-tight">
                Experience Fashion
                <span className="bg-gradient-to-r from-primary-600 via-purple-600 to-accent-500 bg-clip-text text-transparent block mt-2">
                  Like Never Before
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
                Upload your photo and instantly see how any outfit looks on you with our advanced AI technology. 
                <span className="font-semibold text-primary-600"> Discover your perfect style</span> with personalized recommendations.
              </p>
            </motion.div>

            <motion.div
              ref={featuresRef}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12"
            >
              <motion.div 
                whileHover={{ scale: 1.05, y: -5 }}
                className="flex items-center gap-3 bg-white px-6 py-3 rounded-2xl shadow-lg"
              >
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <Zap className="text-primary-600" size={22} />
                </div>
                <span className="font-semibold text-neutral-700">Instant Results</span>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.05, y: -5 }}
                className="flex items-center gap-3 bg-white px-6 py-3 rounded-2xl shadow-lg"
              >
                <div className="w-10 h-10 bg-accent-100 rounded-full flex items-center justify-center">
                  <Heart className="text-accent-600" size={22} />
                </div>
                <span className="font-semibold text-neutral-700">Personalized</span>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.05, y: -5 }}
                className="flex items-center gap-3 bg-white px-6 py-3 rounded-2xl shadow-lg"
              >
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Star className="text-yellow-600" size={22} />
                </div>
                <span className="font-semibold text-neutral-700">Premium Quality</span>
              </motion.div>
            </motion.div>

            {/* CTA Button */}
            <motion.a
              href="/collections"
              whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-primary-600 to-accent-500 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-2xl hover:shadow-primary-500/50 transition-all"
            >
              <Sparkles size={24} />
              Browse Collections
            </motion.a>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Main Content */}
          <div>
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
                  id="try-on-section"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card overflow-hidden"
                >
                  <div className="p-6 border-b border-neutral-200 bg-gradient-to-r from-primary-50 to-accent-50">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent flex items-center gap-3">
                        <Shirt className="text-primary-600" size={28} />
                        VITON Try-On Studio
                      </h2>
                      
                      {/* Toggle Button for Custom Clothing Upload */}
                      <button
                        onClick={() => setShowClothingUpload(!showClothingUpload)}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 ${
                          showClothingUpload
                            ? 'bg-primary-600 text-white hover:bg-primary-700'
                            : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
                        }`}
                      >
                        <Upload size={20} />
                        {showClothingUpload ? 'Hide' : 'Upload'} Custom Clothing
                      </button>
                    </div>

                    {/* Custom Clothing Upload Section */}
                    {showClothingUpload && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 p-4 bg-white rounded-lg border-2 border-dashed border-primary-300"
                      >
                        <h3 className="text-lg font-semibold mb-3 text-neutral-800">Try Your Own Clothing</h3>
                        
                        <div className="space-y-4">
                          {/* Category Dropdown */}
                          <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                              Clothing Category
                            </label>
                            <select
                              value={clothingCategory}
                              onChange={(e) => setClothingCategory(e.target.value as 'upperware' | 'lowerware' | 'dress')}
                              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            >
                              <option value="upperware">Upper Wear (Shirts, T-shirts, Tops)</option>
                              <option value="lowerware">Lower Wear (Pants, Jeans, Skirts)</option>
                              <option value="dress">Dress (Full body outfits)</option>
                            </select>
                          </div>

                          {/* File Upload */}
                          <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                              Upload Clothing Image
                            </label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleClothingImageChange}
                              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                          </div>

                          {/* Preview */}
                          {clothingPreview && (
                            <div className="mt-3">
                              <p className="text-sm font-medium text-neutral-700 mb-2">Preview:</p>
                              <img
                                src={clothingPreview}
                                alt="Clothing preview"
                                className="w-32 h-32 object-cover rounded-lg border-2 border-primary-200"
                              />
                            </div>
                          )}

                          {/* Try On Button */}
                          <button
                            onClick={handleCustomClothingTryOn}
                            disabled={!clothingImage || isLoading}
                            className="w-full bg-gradient-to-r from-primary-600 to-accent-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            <Sparkles size={20} />
                            Try On Custom Clothing
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                  
                  <VirtualTryOn
                    userImage={userImage}
                    selectedProduct={selectedProduct}
                    tryOnResult={tryOnResult}
                    isLoading={isLoading}
                    onGetRecommendations={handleGetRecommendations}
                    onTryOn={handleTryOn}
                    onTryOnRecommended={handleTryOnRecommended}
                  />
                </motion.div>
              )}
            </div>
          </div>


        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && <LoadingSpinner />}
      </AnimatePresence>
    </div>
  )
}