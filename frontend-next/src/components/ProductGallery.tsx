'use client'

import { motion } from 'framer-motion'
import { Shirt, Tag, Star, Heart, Eye } from 'lucide-react'
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

interface ProductGalleryProps {
  products: Product[]
  onProductSelect: (product: Product) => void
  selectedProduct: Product | null
}

export default function ProductGallery({
  products,
  onProductSelect,
  selectedProduct,
}: ProductGalleryProps) {
  // Show all products from all categories
  const displayProducts = products

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-600">
          Showing {displayProducts.length} of {products.length} items
        </p>
      </div>
      
      <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
        {displayProducts.map((product, index) => (
          <motion.div
            key={product.product_id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className={`group cursor-pointer rounded-xl border-2 transition-all duration-300 hover:shadow-lg ${
              selectedProduct?.product_id === product.product_id
                ? 'border-primary-500 bg-primary-50'
                : 'border-neutral-200 hover:border-primary-300 bg-white'
            }`}
            onClick={() => onProductSelect(product)}
          >
            <div className="p-3">
              <div className="flex items-start gap-3">
                {/* Product Image */}
                <div className="relative flex-shrink-0">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-neutral-100 border">
                    <Image
                      src={product.img}
                      alt={product.name}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-product.png'
                      }}
                    />
                  </div>
                  
                  {/* Discount Badge */}
                  {product.discount > 0 && (
                    <div className="absolute -top-1 -right-1 bg-accent-500 text-white text-xs px-2 py-1 rounded-full">
                      -{product.discount}%
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-neutral-900 line-clamp-1 mb-1">
                    {product.name}
                  </h4>
                  
                  <div className="flex items-center gap-1 mb-2">
                    <Shirt size={12} className="text-neutral-500" />
                    <span className="text-xs text-neutral-600 capitalize">
                      {product.subcategory}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-neutral-900">
                        ₹{product.price}
                      </span>
                      {product.discount > 0 && (
                        <span className="text-xs text-neutral-500 line-through">
                          ₹{Math.round(product.price / (1 - product.discount / 100))}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1">
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
                        <Eye size={14} />
                      </motion.button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-neutral-500">{product.seller}</span>
                    <div className="flex items-center gap-1">
                      <Star size={10} className="text-yellow-400 fill-current" />
                      <span className="text-xs text-neutral-600">4.2</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Try On Button */}
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{
                  opacity: selectedProduct?.product_id === product.product_id ? 1 : 0,
                  height: selectedProduct?.product_id === product.product_id ? 'auto' : 0,
                }}
                className="mt-3 pt-3 border-t border-primary-200"
              >
                <div className="flex items-center justify-center gap-2 text-primary-600">
                  <Shirt size={14} />
                  <span className="text-xs font-semibold">Selected for Try-On</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>
      
      {products.length === 0 && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shirt className="text-neutral-400" size={32} />
          </div>
          <p className="text-neutral-500">No products available</p>
        </div>
      )}
    </div>
  )
}