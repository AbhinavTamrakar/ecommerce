'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

const BASE = process.env.NEXT_PUBLIC_API_URL || '';

function LoginForm() {
  const router = useRouter()
  const { setAuth } = useAuthStore()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') ?? '/'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch(`${BASE}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Invalid credentials.')

      const payload = data.data || data
      const { token, user } = payload
      
      if (!token || !user) {
        throw new Error('Authentication failed: Missing user or token.')
      }

      setAuth(user, token)
      toast.success(`Welcome back, ${user.name}!`)
      router.push(redirect)
    } catch (err: any) {
      const msg = err?.message || 'Invalid credentials.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 rounded-lg bg-white p-8 space-y-5 animate-fade-up opacity-0 animate-delay-100"
      style={{ animationFillMode: 'forwards' }}
    >
      <div>
        <label className="block text-xs uppercase tracking-wider mb-2 text-[var(--color-muted)]">
          Email
        </label>
        <input
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="input"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label className="block text-xs uppercase tracking-wider mb-2 text-[var(--color-muted)]">
          Password
        </label>
        <input
          type="password"
          required
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="input"
          placeholder="••••••••"
        />
      </div>

      <button
        type="submit"
        className="p-2 rounded-lg btn-primary w-full"
        disabled={loading}
      >
        {loading ? 'Signing in…' : 'Sign In'}
      </button>
    </form>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen pt-24 pb-24 flex items-center justify-center">
      <div className="w-full max-w-md px-6">
        <div
          className="text-center mb-10 animate-fade-up opacity-0"
          style={{ animationFillMode: 'forwards' }}
        >
          <h1
            className="text-4xl font-bold mb-2"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Welcome back
          </h1>
          <p className="text-[var(--color-muted)] text-sm">
            Sign in to your ShakTa account
          </p>
        </div>
        
        <Suspense fallback={<div className="p-8 text-center text-sm text-[var(--color-muted)]">Loading credentials hub...</div>}>
          <LoginForm />
        </Suspense>

        <p
          className="py-3 text-center text-sm text-[var(--color-muted)] mt-6 animate-fade-up opacity-0 animate-delay-200"
          style={{ animationFillMode: 'forwards' }}
        >
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            className="text-[var(--color-charcoal)] underline underline-offset-2 hover:text-[var(--color-accent)] transition-colors"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}