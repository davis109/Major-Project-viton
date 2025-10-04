'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Filter, Grid, List } from 'lucide-react'
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
  const [selectedCategory, setSelectedCategory] = useState<string>('Dress')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const categories = [
    'Dress', 'T-Shirt', 'Blazer', 'Shirt', 'Jeans', 'Pants', 
    'Shorts', 'Skirt', 'Hoodie', 'Jacket', 'Sweater', 'Polo', 'Coat'
  ]

  const fetchProducts = async (category?: string) => {
    setLoading(true)
    try {
      const url = category 
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
  }

  const handleProductSelect = (product: Product) => {
    // Store the selected product in localStorage to pass it to the main page
    localStorage.setItem('selectedProduct', JSON.stringify(product))
    // Navigate to the main page which will handle the try-on
    router.push('/?tryon=true')
    toast.success(`Selected ${product.name} for try-on!`)
  }

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
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-2 rounded-lg border border-neutral-200 hover:bg-neutral-100 transition-colors"
            >
              {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Page Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-neutral-800 mb-2">Fashion Collections</h1>
          <p className="text-neutral-600">Discover our curated collection of {selectedCategory.toLowerCase()}s</p>
        </div>

        {/* Category Filter */}
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

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        )}

        {/* Products Count */}
        {!loading && (
          <div className="mb-6">
            <p className="text-neutral-600">
              Showing <span className="font-semibold">{products.length}</span> {selectedCategory.toLowerCase()}{products.length !== 1 ? 's' : ''} available
            </p>
          </div>
        )}

        {/* Products Grid */}
        {!loading && products.length > 0 && (
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
        {!loading && products.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">👗</div>
            <h3 className="text-xl font-semibold text-neutral-800 mb-2">
              No {selectedCategory.toLowerCase()}s found
            </h3>
            <p className="text-neutral-600">
              Try selecting a different category or check back later.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}