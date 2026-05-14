'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { useCartStore } from '@/store/cartStore'
import toast from 'react-hot-toast'
import { CheckCircle, Loader } from 'lucide-react'

const API = 'http://194.146.12.71:8008'

export default function PayPalSuccessPage() {
  const router = useRouter()
  const { clearCart } = useCartStore()
  const [status, setStatus] = useState<'capturing' | 'success' | 'error'>('capturing')

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const paypalOrderId = urlParams.get('token') // PayPal returns token param
    const orderId = sessionStorage.getItem('paypal_order_id')

    if (!paypalOrderId || !orderId) {
      setStatus('error')
      return
    }

    const token = useAuthStore.getState().token ||
      JSON.parse(localStorage.getItem('auth') || '{}')?.state?.token

    fetch(`${API}/api/paypal/capture-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        order_id: Number(orderId),
        paypal_order_id: paypalOrderId,
      }),
    })
      .then(r => r.json())
      .then(data => {
        if (data?.status === 'success' || data?.data) {
          setStatus('success')
          clearCart()
          sessionStorage.removeItem('paypal_order_id')
          sessionStorage.removeItem('paypal_paypal_order_id')
          toast.success('Payment successful!')
          setTimeout(() => router.push('/account'), 2000)
        } else {
          throw new Error(data?.message || 'Capture failed')
        }
      })
      .catch(err => {
        console.error(err)
        setStatus('error')
        toast.error('Payment capture failed.')
      })
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-cream)]">
      <div className="text-center px-4">
        {status === 'capturing' && (
          <>
            <Loader size={48} className="mx-auto text-orange-500 animate-spin mb-4" />
            <h1 className="text-xl font-bold text-gray-900">Processing your payment...</h1>
            <p className="text-gray-500 mt-2">Please wait while we confirm your PayPal payment.</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
            <h1 className="text-xl font-bold text-gray-900">Payment Successful!</h1>
            <p className="text-gray-500 mt-2">Redirecting to your orders...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <p className="text-red-500 text-lg font-bold mb-2">Payment Failed</p>
            <p className="text-gray-500 mb-4">Something went wrong with your PayPal payment.</p>
            <button onClick={() => router.push('/cart')}
              className="btn-primary">
              Back to Cart
            </button>
          </>
        )}
      </div>
    </div>
  )
}