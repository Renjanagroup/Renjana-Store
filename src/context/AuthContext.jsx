import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [initializing, setInitializing] = useState(true)

  async function loadProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Gagal memuat profil:', error.message)
      return null
    }
    return data
  }

  useEffect(() => {
    let mounted = true

    async function init() {
      const { data: { session: initialSession } } = await supabase.auth.getSession()
      if (!mounted) return

      setSession(initialSession)

      if (initialSession?.user) {
        const p = await loadProfile(initialSession.user.id)
        if (mounted) setProfile(p)
      }

      if (mounted) setInitializing(false)
    }

    init()

    // Catatan penting: event ini juga terpicu saat tab browser difokuskan lagi
    // (Supabase otomatis mengecek/refresh token). Supaya tidak membuat
    // halaman "reset" tiap kali itu terjadi, kita HANYA memperbarui data di
    // belakang layar di sini, TANPA menyalakan ulang status loading.
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)

      if (newSession?.user) {
        loadProfile(newSession.user.id).then((p) => setProfile(p))
      } else {
        setProfile(null)
      }
    })

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const value = {
    session,
    user: session?.user ?? null,
    profile,
    isAdmin: profile?.role === 'admin',
    // loading cuma true di pemuatan PERTAMA saja, bukan tiap ada perubahan sesi
    loading: initializing,
    signOut: () => supabase.auth.signOut(),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth harus dipakai di dalam AuthProvider')
  return ctx
}
