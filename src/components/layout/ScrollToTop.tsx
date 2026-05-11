'use client'
import { useState, useEffect } from 'react'
import { ShoppingCart, ChevronUp } from 'lucide-react'

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
        setIsAnimating(false) // Reset animation if we scroll back to top manually
      }
    }

    window.addEventListener('scroll', toggleVisibility)
    return () => window.removeEventListener('scroll', toggleVisibility)
  }, [])

  const scrollToTop = () => {
    setIsAnimating(true)
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
    
    // Duration of animation should match or be slightly longer than scroll time
    setTimeout(() => {
      setIsAnimating(false)
    }, 1000)
  }

  if (!isVisible) return null

  return (
    <button
      onClick={scrollToTop}
      className={`scroll-to-top fixed bottom-8 right-8 z-50 p-3 rounded-full transition-all duration-300 group overflow-hidden ${
        isAnimating ? 'pointer-events-none' : ''
      }`}
      aria-label="Scroll to top"
    >
      <div className="relative">
        {/* Default Arrow */}
        <div className={`transition-all duration-500 ${isAnimating ? 'opacity-0 -translate-y-10' : 'opacity-100'}`}>
          <ChevronUp size={24} />
        </div>

        {/* Floating Cart Animation */}
        <div 
          className={`absolute inset-0 flex items-center justify-center transition-all duration-700 ease-in-out ${
            isAnimating 
              ? 'opacity-100 translate-y-[-100px] scale-125' 
              : 'opacity-0 translate-y-10'
          }`}
        >
          <ShoppingCart size={24} className="animate-bounce" />
        </div>
      </div>
      
      {/* Visual background ripple/pulse */}
      <span className="absolute inset-0 bg-white/10 scale-0 group-hover:scale-100 rounded-full transition-transform duration-500" />
    </button>
  )
}