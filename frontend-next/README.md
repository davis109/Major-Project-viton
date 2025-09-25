# AI VITON - Next.js Frontend

A world-class virtual try-on interface built with Next.js 14, TypeScript, Tailwind CSS, and Framer Motion.

## Features

- **Modern UI/UX**: Premium design with smooth animations and responsive layout
- **Virtual Try-On**: AI-powered clothing visualization with real-time results
- **Smart Recommendations**: Personalized fashion suggestions based on your preferences
- **Interactive Product Gallery**: Browse and select from 200+ fashion items
- **Drag & Drop Upload**: Easy photo upload with visual feedback
- **Real-time Processing**: Live updates during virtual try-on process

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **UI Components**: Custom components with Lucide React icons
- **Notifications**: React Hot Toast
- **Image Handling**: Next.js Image optimization

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm or yarn package manager

### Installation

1. Navigate to the frontend-next directory:
```bash
cd frontend-next
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

Or use the batch file:
```bash
./start_frontend.bat
```

4. Open [http://localhost:3001](http://localhost:3001) in your browser

## Project Structure

```
frontend-next/
├── src/
│   ├── app/                 # Next.js 14 app directory
│   │   ├── globals.css     # Global styles and Tailwind
│   │   ├── layout.tsx      # Root layout with providers
│   │   └── page.tsx        # Home page component
│   └── components/         # Reusable UI components
│       ├── Header.tsx      # Navigation header
│       ├── ImageUpload.tsx # Drag & drop image upload
│       ├── ProductGallery.tsx # Product selection grid
│       ├── VirtualTryOn.tsx   # Try-on result display
│       ├── RecommendationPanel.tsx # AI recommendations
│       └── LoadingSpinner.tsx     # Loading animations
├── public/                 # Static assets
├── package.json           # Dependencies and scripts
├── tailwind.config.js     # Tailwind CSS configuration
├── next.config.js         # Next.js configuration
└── tsconfig.json         # TypeScript configuration
```

## API Integration

The frontend integrates with the FastAPI backend running on port 8001:

- `/api/get_myntra_data` - Fetch product catalog
- `/api/take_user_image` - Upload user photo
- `/api/get_recommendations` - Generate virtual try-on results

## Design System

### Colors
- **Primary**: Blue gradient (#3B82F6 to #1D4ED8)
- **Accent**: Purple gradient (#8B5CF6 to #7C3AED)
- **Neutral**: Gray scale for text and backgrounds

### Typography
- **Font**: Inter (Google Fonts)
- **Weights**: 400 (regular), 600 (semibold), 700 (bold)

### Components
- **Cards**: Rounded corners with subtle shadows
- **Buttons**: Gradient backgrounds with hover effects
- **Animations**: Smooth transitions and micro-interactions

## Features Overview

### 1. Hero Section
- Eye-catching gradient background with pattern
- Clear value propositions with icons
- Smooth scroll animations

### 2. Image Upload
- Drag & drop interface with visual feedback
- File type validation and size limits
- Upload progress and success states

### 3. Virtual Try-On Studio
- Side-by-side comparison view
- Loading animations during processing
- Success indicators and error handling

### 4. Product Gallery
- Grid layout with hover effects
- Product details with pricing
- Selection states and animations

### 5. AI Recommendations
- Personalized suggestions
- Try-on result previews
- Add to cart functionality

## Performance

- **Image Optimization**: Next.js Image component for optimal loading
- **Code Splitting**: Automatic route-based code splitting
- **Lazy Loading**: Components load on demand
- **Animations**: Hardware-accelerated with Framer Motion

## Browser Support

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## Development Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Contributing

1. Follow the existing code style
2. Use TypeScript for all new components
3. Add proper error handling
4. Test on multiple screen sizes
5. Optimize images and assets

## License

This project is part of the AI VITON virtual try-on system.