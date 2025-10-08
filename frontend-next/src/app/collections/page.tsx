'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Search, Sparkles, Loader2, Filter, Grid, List } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import toast from 'react-hot-toast'
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

export default function Collections() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [showAISearch, setShowAISearch] = useState(false)

  const categories = [
    'All', 'Dress', 'T-Shirt', 'Blazer', 'Shirt', 'Jeans', 'Pants', 
    'Shorts', 'Skirt', 'Hoodie', 'Jacket', 'Sweater', 'Polo', 'Coat'
  ]

  const fetchProducts = async (category?: string) => {
    setLoading(true)
    try {
      const url = category && category !== 'All'
        ? `http://localhost:8001/get_myntra_data?category=${encodeURIComponent(category)}`
        : 'http://localhost:8001/get_myntra_data'
      
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        console.log(`Fetched ${data.length} ${category || 'all'} items`)
        setProducts(data)
      } else {
        toast.error('Failed to load products')
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Error loading products')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts(selectedCategory)
  }, [selectedCategory])

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    setShowAISearch(false) // Hide AI search when using categories
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a search query')
      return
    }

    setSearching(true)
    setProducts([])
    
    try {
      const response = await fetch('http://localhost:8001/search_products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: searchQuery }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log(`Found ${data.length} products for query: "${searchQuery}"`)
        setProducts(data)
        if (data.length === 0) {
          toast('No products found. Try a different search.', { icon: '🔍' })
        } else {
          toast.success(`Found ${data.length} products matching your search!`)
        }
      } else {
        toast.error('Search failed. Please try again.')
      }
    } catch (error) {
      console.error('Error searching products:', error)
      toast.error('Search error. Please try again.')
    } finally {
      setSearching(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleProductSelect = (product: Product) => {
    // Store the selected product in localStorage to pass it to the main page
    localStorage.setItem('selectedProduct', JSON.stringify(product))
    // Navigate to the main page which will handle the try-on
    router.push('/?tryon=true')
    toast.success(`Selected ${product.name} for try-on!`)
  }

  const exampleQueries = [
    "I want a red dress",
    "Show me blue jeans", 
    "Looking for formal shirts",
    "Need a winter jacket",
    "Black pants for office"
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
      <Header />
      
      <main className="pt-24 pb-12 px-4 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2 text-neutral-600 hover:text-primary-600 transition-colors">
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Home</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowAISearch(!showAISearch)}
              className={`px-4 py-2 rounded-lg border transition-colors flex items-center space-x-2 ${
                showAISearch 
                  ? 'bg-primary-600 text-white border-primary-600' 
                  : 'border-neutral-200 hover:bg-neutral-100'
              }`}
            >
              <Sparkles className="h-4 w-4" />
              <span>AI Search</span>
            </button>
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-2 rounded-lg border border-neutral-200 hover:bg-neutral-100 transition-colors"
            >
              {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Page Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-neutral-800 mb-2">Fashion Collection</h1>
          <p className="text-neutral-600">
            {showAISearch ? 'Search for clothing items using natural language' : `Discover our curated collection of ${selectedCategory.toLowerCase() === 'all' ? 'fashion items' : selectedCategory.toLowerCase()}s`}
          </p>
        </div>

        {/* AI-Powered Search - Collapsible */}
        {showAISearch && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="max-w-2xl mx-auto mb-8"
          >
            <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Sparkles className="h-5 w-5 text-primary-600" />
                <h3 className="text-lg font-semibold text-neutral-800">AI-Powered Fashion Search</h3>
              </div>
              
              <div className="flex gap-3 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="e.g., 'I want a red dress' or 'Show me formal shirts'"
                    className="w-full pl-11 pr-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-neutral-700 placeholder-neutral-400"
                    disabled={searching}
                  />
                </div>
                <button
                  onClick={handleSearch}
                  disabled={searching || !searchQuery.trim()}
                  className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2 font-medium"
                >
                  {searching ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Searching...</span>
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4" />
                      <span>Search</span>
                    </>
                  )}
                </button>
              </div>

              {/* Example Queries */}
              <div className="space-y-2">
                <p className="text-sm text-neutral-600 font-medium">Try these examples:</p>
                <div className="flex flex-wrap gap-2">
                  {exampleQueries.map((query, index) => (
                    <button
                      key={index}
                      onClick={() => setSearchQuery(query)}
                      className="text-sm px-3 py-1 bg-neutral-100 text-neutral-600 rounded-full hover:bg-primary-100 hover:text-primary-700 transition-colors"
                    >
                      "{query}"
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Category Filter - Only show when not using AI search */}
        {!showAISearch && (
          <div className="mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <Filter className="h-4 w-4 text-neutral-600" />
              <span className="text-sm font-medium text-neutral-700">Filter by Category</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedCategory === category
                      ? 'bg-primary-600 text-white shadow-lg scale-105'
                      : 'bg-white text-neutral-700 border border-neutral-200 hover:border-primary-300 hover:text-primary-600'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {(loading || searching) && (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary-600 mx-auto mb-4" />
              <p className="text-neutral-600">
                {searching ? 'Searching through our collection...' : 'Loading products...'}
              </p>
            </div>
          </div>
        )}

        {/* Products Count */}
        {!loading && !searching && (
          <div className="mb-6">
            <p className="text-neutral-600">
              {showAISearch && searchQuery ? (
                products.length > 0 ? (
                  <>Found <span className="font-semibold">{products.length}</span> products matching your search</>
                ) : (
                  <>No products found for "<span className="font-semibold">{searchQuery}</span>"</>
                )
              ) : (
                <>Showing <span className="font-semibold">{products.length}</span> {selectedCategory.toLowerCase() === 'all' ? 'products' : selectedCategory.toLowerCase()}{products.length !== 1 ? 's' : ''} available</>
              )}
            </p>
          </div>
        )}

        {/* Products Grid */}
        {!loading && !searching && products.length > 0 && (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1'
          }`}>
            {products.map((product, index) => (
              <motion.div
                key={product.product_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                onClick={() => handleProductSelect(product)}
                className={`group bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer ${
                  viewMode === 'list' ? 'flex' : ''
                }`}
              >
                {/* Product Image */}
                <div className={`relative ${viewMode === 'list' ? 'w-32 h-32' : 'aspect-square'} overflow-hidden`}>
                  <Image
                    src={`http://localhost:8001${product.img}`}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      target.parentElement!.innerHTML = `
                        <div class="w-full h-full bg-neutral-100 flex items-center justify-center">
                          <span class="text-neutral-400 text-xs">No Image</span>
                        </div>
                      `
                    }}
                  />
                  
                  {/* Discount Badge */}
                  {product.discount > 0 && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      -{Math.round(product.discount)}%
                    </div>
                  )}

                  {/* Try-On Button Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
                    <div className="bg-primary-600 text-white px-4 py-2 rounded-full text-sm font-medium opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-lg">
                      Try On This Item
                    </div>
                  </div>
                </div>

                {/* Product Details */}
                <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                  <h3 className="font-semibold text-neutral-800 mb-2 line-clamp-2">{product.name}</h3>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-neutral-600">{product.seller}</p>
                    <p className="text-xs bg-neutral-100 text-neutral-700 px-2 py-1 rounded-full inline-block">
                      {product.subcategory}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-primary-600">
                          ₹{Math.round(product.price * (1 - product.discount / 100))}
                        </span>
                        {product.discount > 0 && (
                          <span className="text-sm text-neutral-500 line-through">
                            ₹{Math.round(product.price)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center text-yellow-500">
                        <span className="text-xs">⭐ 4.2</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* No Products Found */}
        {!loading && !searching && products.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">
              {showAISearch && searchQuery ? '🔍' : '👗'}
            </div>
            <h3 className="text-xl font-semibold text-neutral-800 mb-2">
              {showAISearch && searchQuery ? 'No products found' : `No ${selectedCategory.toLowerCase() === 'all' ? 'products' : selectedCategory.toLowerCase()}s found`}
            </h3>
            <p className="text-neutral-600 mb-4">
              {showAISearch && searchQuery 
                ? 'Try adjusting your search query or use different keywords.' 
                : 'Try selecting a different category or check back later.'
              }
            </p>
            {showAISearch && searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('')
                  setShowAISearch(false)
                  setSelectedCategory('All')
                }}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Browse All Products
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  )
}