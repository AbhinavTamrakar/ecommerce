'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

const BASE = process.env.NEXT_PUBLIC_API_URL || '';

export default function RegisterPage() {
  const router = useRouter()
  const { setAuth } = useAuthStore()
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (form.password !== form.password_confirmation) {
      toast.error("Passwords don't match.")
      return
    }
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${BASE}/api/register`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
          password_confirmation: form.password_confirmation,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Registration failed.')

      // Your API might return: { message, user, token, token_type } OR { data: { user, token } }
      const payload = data.data || data
      const { token, user } = payload

      if (!token || !user) {
        throw new Error('Registration failed: Missing user or token in response.')
      }

      setAuth(user, token)

      toast.success(`Account created! Welcome, ${user.name}!`)
      router.push('/')
    } catch (err: any) {
      const msg = err?.message || 'Registration failed.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

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
            Create account
          </h1>
          <p className="text-[var(--color-muted)] text-sm">
            Join ShakTa and start shopping
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-4 rounded-lg bg-white p-8 space-y-5 animate-fade-up opacity-0 animate-delay-100"
          style={{ animationFillMode: 'forwards' }}
        >
          <div>
            <label className="block text-xs uppercase tracking-wider mb-2 text-[var(--color-muted)]">
              Full Name
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input"
              placeholder="John Doe"
            />
          </div>

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
              Phone Number
            </label>
            <input
              type="tel"
              required
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="input"
              placeholder="+977 98XXXXXXXX"
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
              placeholder="Min. 8 characters"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider mb-2 text-[var(--color-muted)]">
              Confirm Password
            </label>
            <input
              type="password"
              required
              value={form.password_confirmation}
              onChange={(e) =>
                setForm({ ...form, password_confirmation: e.target.value })
              }
              className="input"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="btn-primary w-full p-2 rounded-lg"
            disabled={loading}
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p
          className="py-3 text-center text-sm text-[var(--color-muted)] mt-6 animate-fade-up opacity-0 animate-delay-200"
          style={{ animationFillMode: 'forwards' }}
        >
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-[var(--color-charcoal)] underline underline-offset-2 hover:text-[var(--color-accent)] transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}