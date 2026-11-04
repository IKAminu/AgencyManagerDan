import { useEffect, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { waitForMinimumLoadingTime } from '@/lib/loading'

const ALLOWED_EMAILS = new Set([
  'ikaminumail@gmail.com',
  'dandurguairtravels@gmail.com',
])

export type AppMode = 'demo' | 'live'
type AuthStep = 'login' | 'mfa' | 'enroll'

function AuthScreen({ onAuthenticated, onDemo }: { onAuthenticated: (session: Session) => void; onDemo: () => void }) {
  const [step, setStep] = useState<AuthStep>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [factorId, setFactorId] = useState('')
  const [challengeId, setChallengeId] = useState('')
  const [qrCode, setQrCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const beginSecondFactor = async () => {
    const { data: factors, error: factorsError } = await supabase!.auth.mfa.listFactors()
    if (factorsError) throw factorsError

    const verifiedFactor = factors.totp.find((factor) => factor.status === 'verified')
    if (verifiedFactor) {
      const { data: challenge, error: challengeError } = await supabase!.auth.mfa.challenge({ factorId: verifiedFactor.id })
      if (challengeError) throw challengeError
      setFactorId(verifiedFactor.id)
      setChallengeId(challenge.id)
      setStep('mfa')
      return
    }

    const unverifiedFactors = factors.totp.filter((factor) => factor.status !== 'verified')
    for (const factor of unverifiedFactors) {
      const { error: removeError } = await supabase!.auth.mfa.unenroll({ factorId: factor.id })
      if (removeError) throw new Error(`An unfinished authenticator setup could not be reset: ${removeError.message}. Please contact the app administrator.`)
    }

    const { data: enrollment, error: enrollmentError } = await supabase!.auth.mfa.enroll({
      factorType: 'totp',
      friendlyName: 'Dandurgu HQ Authenticator',
      issuer: 'Dandurgu Headquarters',
    })
    if (enrollmentError) throw enrollmentError
    setFactorId(enrollment.id)
    setQrCode(enrollment.totp.qr_code)
    setStep('enroll')
  }

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      const normalizedEmail = email.trim().toLowerCase()
      if (!ALLOWED_EMAILS.has(normalizedEmail)) throw new Error('This email address is not authorised to access Dandurgu Headquarters.')
      const { data, error: loginError } = await supabase!.auth.signInWithPassword({ email: normalizedEmail, password })
      if (loginError) throw loginError
      if (!data.session) throw new Error('Sign-in did not return a valid session.')
      await beginSecondFactor()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign in. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  const handleVerify = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      let activeChallengeId = challengeId
      if (!activeChallengeId) {
        const { data, error: challengeError } = await supabase!.auth.mfa.challenge({ factorId })
        if (challengeError) throw challengeError
        activeChallengeId = data.id
      }
      const { error: verifyError } = await supabase!.auth.mfa.verify({
        factorId,
        challengeId: activeChallengeId,
        code: code.replace(/\s/g, ''),
      })
      if (verifyError) throw verifyError
      const { data, error: sessionError } = await supabase!.auth.getSession()
      if (sessionError) throw sessionError
      if (!data.session) throw new Error('Your session could not be confirmed. Please sign in again.')
      onAuthenticated(data.session)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The verification code was not accepted.')
    } finally {
      setBusy(false)
    }
  }

  const handleBackToLogin = async () => {
    if (factorId && step === 'enroll') {
      const { error: removeError } = await supabase!.auth.mfa.unenroll({ factorId })
      if (removeError) {
        setError(`Could not cancel authenticator setup: ${removeError.message}`)
        return
      }
    }
    await supabase!.auth.signOut()
    setStep('login')
    setPassword('')
    setCode('')
    setFactorId('')
    setChallengeId('')
    setQrCode('')
    setError('')
  }

  return <div className="auth-screen">
    <section className="auth-panel">
      <img src={`${import.meta.env.BASE_URL}brand/logo.png`} alt="Dandurgu logo" className="auth-logo" />
      <p className="auth-eyebrow">DANDURGU AIR TRAVEL & TOURS</p>
      <h1>{step === 'login' ? 'Headquarters sign in' : step === 'enroll' ? 'Secure your account' : 'Two-step verification'}</h1>
      <p className="auth-description">
        {step === 'login' ? 'Sign in with your authorised agency account.' : step === 'enroll' ? 'Connect an authenticator app to your account. This is required before accessing agency records.' : 'Enter the current six-digit code from your authenticator app.'}
      </p>

      {step === 'login' && <form className="auth-form" onSubmit={handleLogin}>
        <label className="field-group">Email address<input className="field" type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} /></label>
        <label className="field-group">Password<input className="field" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} /></label>
        {error && <p className="auth-error" role="alert">{error}</p>}
        <button className="button button-primary auth-submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>}

      {step === 'login' && <button className="button button-secondary auth-demo" type="button" onClick={onDemo}>Sign in as guest · Explore demo</button>}

      {step === 'enroll' && <form className="auth-form" onSubmit={handleVerify}>
        <div className="auth-qr"><img src={qrCode} alt="Authenticator setup QR code" /></div>
        <p className="auth-help">Open Google Authenticator, Microsoft Authenticator, 1Password or another TOTP app. Scan this QR code, then enter the six-digit code it generates.</p>
        <label className="field-group">Authenticator code<input className="field auth-code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9 ]{6,8}" maxLength={8} required value={code} onChange={(event) => setCode(event.target.value)} placeholder="000000" /></label>
        {error && <p className="auth-error" role="alert">{error}</p>}
        <button className="button button-primary auth-submit" disabled={busy || code.replace(/\s/g, '').length < 6}>{busy ? 'Verifying…' : 'Enable two-step verification'}</button>
      </form>}

      {step === 'mfa' && <form className="auth-form" onSubmit={handleVerify}>
        <label className="field-group">Six-digit code<input className="field auth-code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9 ]{6,8}" maxLength={8} required value={code} onChange={(event) => setCode(event.target.value)} placeholder="000000" /></label>
        {error && <p className="auth-error" role="alert">{error}</p>}
        <button className="button button-primary auth-submit" disabled={busy || code.replace(/\s/g, '').length < 6}>{busy ? 'Verifying…' : 'Verify and continue'}</button>
      </form>}

      {step !== 'login' && <button className="auth-back" type="button" onClick={handleBackToLogin}>Cancel and return to sign in</button>}
      <p className="auth-footnote">Access is restricted to authorised Dandurgu accounts.</p>
    </section>
  </div>
}

export function AuthGate({ children }: { children: (mode: AppMode) => ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [ready, setReady] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)
  const [mode, setMode] = useState<AppMode | null>(null)
  const [authError, setAuthError] = useState('')

  useEffect(() => {
    let alive = true
    const checkSession = async (current: Session | null) => {
      if (!alive) return
      try {
        if (!current || !ALLOWED_EMAILS.has((current.user.email || '').toLowerCase())) {
          if (current) {
            const { error } = await supabase!.auth.signOut()
            if (error) throw error
          }
          await waitForMinimumLoadingTime()
          if (alive) { setSession(null); setAuthenticated(false); setMode((previous) => previous === 'demo' ? 'demo' : null); setAuthError(''); setReady(true) }
          return
        }
        const { data, error } = await supabase!.auth.mfa.getAuthenticatorAssuranceLevel()
        if (error) throw error
        await waitForMinimumLoadingTime()
        if (alive) {
          setSession(current)
          setAuthenticated(data.currentLevel === 'aal2')
          setMode(data.currentLevel === 'aal2' ? 'live' : null)
          setAuthError('')
          setReady(true)
        }
      } catch (error) {
        await waitForMinimumLoadingTime()
        if (alive) {
          setSession(null)
          setAuthenticated(false)
          setMode(null)
          setAuthError(error instanceof Error ? error.message : 'The sign-in service could not be reached. Check your connection and try again.')
          setReady(true)
        }
      }
    }
    supabase!.auth.getSession().then(({ data, error }) => {
      if (error) throw error
      return checkSession(data.session)
    }).catch((error: unknown) => {
      if (!alive) return
      setAuthError(error instanceof Error ? error.message : 'The sign-in service could not be reached. Check your connection and try again.')
      setReady(true)
    })
    const { data: listener } = supabase!.auth.onAuthStateChange((_event, current) => {
      void checkSession(current)
    })
    return () => { alive = false; listener.subscription.unsubscribe() }
  }, [])

  if (!supabase) return <div className="auth-screen"><section className="auth-panel"><h1>Configuration required</h1><p>Supabase connection settings are missing. Contact the app administrator.</p></section></div>
  if (!ready) return <div className="auth-loading"><img src={`${import.meta.env.BASE_URL}brand/logo.png`} alt="" /><span>Preparing secure workspace</span><i /></div>
  if (authError) return <div className="auth-screen"><section className="auth-panel"><h1>Could not verify your session</h1><p className="auth-description" role="alert">{authError}</p><button className="button button-primary auth-submit" type="button" onClick={() => window.location.reload()}>Try again</button></section></div>
  if (mode === 'demo') return <>{children('demo')}</>
  if (!session || !authenticated) return <AuthScreen onDemo={async () => { const { error } = await supabase!.auth.signOut(); if (error) throw error; setSession(null); setAuthenticated(false); setMode('demo') }} onAuthenticated={(nextSession) => { setSession(nextSession); setAuthenticated(true); setMode('live') }} />
  return <>{mode === 'live' ? children('live') : null}</>
}
