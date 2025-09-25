'use client'

import { useCallback } from 'react'
import { motion } from 'framer-motion'
import { Upload, Camera, Image as ImageIcon } from 'lucide-react'

interface ImageUploadProps {
  onImageUpload: (file: File) => void
}

export default function ImageUpload({ onImageUpload }: ImageUploadProps) {
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      const files = Array.from(e.dataTransfer.files)
      const imageFile = files.find(file => file.type.startsWith('image/'))
      if (imageFile) {
        onImageUpload(imageFile)
      }
    },
    [onImageUpload]
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        onImageUpload(file)
      }
    },
    [onImageUpload]
  )

  const preventDefaults = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="relative"
    >
      <div
        onDrop={handleDrop}
        onDragOver={preventDefaults}
        onDragEnter={preventDefaults}
        onDragLeave={preventDefaults}
        className="border-2 border-dashed border-neutral-300 rounded-2xl p-12 text-center hover:border-primary-400 hover:bg-primary-50 transition-all duration-300 cursor-pointer group"
      >
        <div className="space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-accent-100 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
            <Upload className="text-primary-600" size={32} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              Drag & drop your photo here
            </h3>
            <p className="text-neutral-600 mb-4">
              Or click to browse your files
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-neutral-500">
              <div className="flex items-center gap-1">
                <Camera size={16} />
                <span>JPG, PNG</span>
              </div>
              <div className="flex items-center gap-1">
                <ImageIcon size={16} />
                <span>Max 10MB</span>
              </div>
            </div>
          </div>
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
      
      <div className="mt-6 grid grid-cols-3 gap-3">
        {/* Sample images hint */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="aspect-square bg-gradient-to-br from-primary-50 to-accent-50 rounded-lg flex items-center justify-center border border-primary-200"
        >
          <span className="text-xs text-primary-600 font-semibold">Full Body</span>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="aspect-square bg-gradient-to-br from-accent-50 to-primary-50 rounded-lg flex items-center justify-center border border-accent-200"
        >
          <span className="text-xs text-accent-600 font-semibold">Front View</span>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="aspect-square bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-lg flex items-center justify-center border border-neutral-200"
        >
          <span className="text-xs text-neutral-600 font-semibold">Clear Light</span>
        </motion.div>
      </div>
      
      <p className="text-xs text-neutral-500 text-center mt-4">
        For best results, use a full-body photo with good lighting and minimal background
      </p>
    </motion.div>
  )
}