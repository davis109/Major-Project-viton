'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface CartItem {
  product_id: number
  name: string
  price: number
  img: string
  seller: string
  discount: number
  quantity: number
  subcategory: string
}

interface FavoriteItem {
  product_id: number
  name: string
  price: number
  img: string
  seller: string
  discount: number
  subcategory: string
}

interface AppContextType {
  cart: CartItem[]
  favorites: FavoriteItem[]
  addToCart: (product: any) => void
  removeFromCart: (productId: number) => void
  updateCartQuantity: (productId: number, quantity: number) => void
  toggleFavorite: (product: any) => void
  isFavorite: (productId: number) => boolean
  clearCart: () => void
  cartTotal: number
  cartCount: number
  favoritesCount: number
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [favorites, setFavorites] = useState<FavoriteItem[]>([])

  // Load from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('viton_cart')
    const savedFavorites = localStorage.getItem('viton_favorites')
    
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart))
      } catch (e) {
        console.error('Error loading cart:', e)
      }
    }
    
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites))
      } catch (e) {
        console.error('Error loading favorites:', e)
      }
    }
  }, [])

  // Save to localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem('viton_cart', JSON.stringify(cart))
  }, [cart])

  // Save to localStorage whenever favorites change
  useEffect(() => {
    localStorage.setItem('viton_favorites', JSON.stringify(favorites))
  }, [favorites])

  const addToCart = (product: any) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.product_id === product.product_id)
      
      if (existingItem) {
        return prev.map(item =>
          item.product_id === product.product_id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.product_id !== productId))
  }

  const updateCartQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }
    
    setCart(prev =>
      prev.map(item =>
        item.product_id === productId ? { ...item, quantity } : item
      )
    )
  }

  const toggleFavorite = (product: any) => {
    setFavorites(prev => {
      const exists = prev.find(item => item.product_id === product.product_id)
      
      if (exists) {
        return prev.filter(item => item.product_id !== product.product_id)
      }
      
      return [...prev, product]
    })
  }

  const isFavorite = (productId: number) => {
    return favorites.some(item => item.product_id === productId)
  }

  const clearCart = () => {
    setCart([])
  }

  const cartTotal = cart.reduce((total, item) => {
    const discountedPrice = item.price * (1 - item.discount / 100)
    return total + discountedPrice * item.quantity
  }, 0)

  const cartCount = cart.reduce((count, item) => count + item.quantity, 0)
  const favoritesCount = favorites.length

  return (
    <AppContext.Provider
      value={{
        cart,
        favorites,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        toggleFavorite,
        isFavorite,
        clearCart,
        cartTotal,
        cartCount,
        favoritesCount,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
