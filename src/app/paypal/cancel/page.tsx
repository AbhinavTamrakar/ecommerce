'use client'
import { useRouter } from 'next/navigation'
import { XCircle } from 'lucide-react'

export default function PayPalCancelPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-cream)]">
      <div className="text-center px-4">
        <XCircle size={48} className="mx-auto text-red-400 mb-4" />
        <h1 className="text-xl font-bold text-gray-900">Payment Cancelled</h1>
        <p className="text-gray-500 mt-2 mb-6">Your PayPal payment was cancelled. Your cart is still saved.</p>
        <button onClick={() => router.push('/cart')} className="btn-primary">
          Back to Cart
        </button>
      </div>
    </div>
  )
}