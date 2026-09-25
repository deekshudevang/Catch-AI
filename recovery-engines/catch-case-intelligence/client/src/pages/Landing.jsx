import { useEffect, useRef, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import {
  Shield, Zap, FileText, Clock, Activity, Brain,
  ArrowRight, ChevronDown, Globe, Lock, Star,
  Check, Search, Upload, MessageSquare, MoveRight
} from 'lucide-react'

/* ══════════════════════════════════════════════
   PARTICLE CANVAS
══════════════════════════════════════════════ */
function ParticleCanvas() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId
    let w = canvas.width = canvas.offsetWidth
    let h = canvas.height = canvas.offsetHeight
    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.4 + 0.4, a: Math.random() * 0.5 + 0.1,
    }))
    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(99,102,241,${p.a})`
        ctx.fill()
      })
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d < 110) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(99,102,241,${(1 - d / 110) * 0.1})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }
      animId = requestAnimationFrame(draw)
    }
    draw()
    const onResize = () => { w = canvas.width = canvas.offsetWidth; h = canvas.height = canvas.offsetHeight }
    window.addEventListener('resize', onResize)
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', onResize) }
  }, [])
  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />
}

/* ══════════════════════════════════════════════
   MACBOOK 3D COMPONENT (exact reference impl)
══════════════════════════════════════════════ */
function MacBook3D() {
  const keyClass = 'macbook-key mb-anim-keys'
  const keyBase = {
    width: 6, height: 6, background: '#444', float: 'left',
    margin: 1, borderRadius: 2, boxShadow: '0 -2px 0 #222',
  }
  const KEY_COUNT = 58
  const FKEY_COUNT = 16

  return (
    <div className="macbook-container" style={{
      width: 150, height: 96, position: 'absolute',
      left: '50%', top: '50%',
      marginTop: -85, marginLeft: -78,
    }}>
      <div className="macbook-inner mb-anim-rotate" style={{
        zIndex: 20, position: 'absolute', width: 150, height: 96, left: 0, top: 0,
      }}>

        {/* ── Screen ── */}
        <div className="macbook-screen mb-anim-lid-screen" style={{
          width: 150, height: 96, position: 'absolute', left: 0, bottom: 0,
          borderRadius: 7, background: '#ddd',
          backgroundImage: 'linear-gradient(45deg,rgba(0,0,0,0.34) 0%,rgba(0,0,0,0) 100%)',
          backgroundPosition: 'left bottom', backgroundSize: '300px 300px',
          boxShadow: 'inset 0 3px 7px rgba(255,255,255,0.5)',
        }}>
          <div className="macbook-screen-face-one" style={{
            width: 150, height: 96, position: 'absolute', left: 0, bottom: 0,
            borderRadius: 7, background: '#d3d3d3',
            backgroundImage: 'linear-gradient(45deg,rgba(0,0,0,0.24) 0%,rgba(0,0,0,0) 100%)',
          }}>
            {/* Camera */}
            <div style={{ width: 3, height: 3, borderRadius: '50%', background: 'black', position: 'absolute', left: '50%', top: 4, marginLeft: -1.5 }} />

            {/* Screen display */}
            <div style={{
              width: 130, height: 74, margin: 10, background: '#000',
              backgroundSize: '100% 100%', borderRadius: 1, position: 'relative',
              boxShadow: 'inset 0 0 2px rgba(0,0,0,1)',
            }}>
              <div className="mb-anim-screen-shade" style={{
                position: 'absolute', left: 0, top: 0, width: 130, height: 74,
                backgroundImage: 'linear-gradient(-135deg,rgba(255,255,255,0) 0%,rgba(255,255,255,0.1) 47%,rgba(255,255,255,0) 48%)',
                backgroundSize: '300px 200px', backgroundPosition: '0px 0px',
              }} />

              {/* "ForensicAI" shiny text ON the screen */}
              <ShinyScreenText />
            </div>

            {/* MacBook Air label */}
            <span style={{ position: 'absolute', top: 85, left: 57, fontSize: 6, color: '#666' }}>MacBook Air</span>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="macbook-body mb-anim-lid-macbody" style={{
          width: 150, height: 96, position: 'absolute', left: 0, bottom: 0,
          borderRadius: 7, background: '#cbcbcb',
          backgroundImage: 'linear-gradient(45deg,rgba(0,0,0,0.24) 0%,rgba(0,0,0,0) 100%)',
        }}>
          <div className="macbook-body-face-one mb-anim-lid-keyboard-area" style={{
            width: 150, height: 96, position: 'absolute', left: 0, bottom: 0,
            borderRadius: 7, background: '#dfdfdf',
            backgroundImage: 'linear-gradient(30deg,rgba(0,0,0,0.24) 0%,rgba(0,0,0,0) 100%)',
          }}>
            {/* Trackpad */}
            <div style={{
              width: 40, height: 31, position: 'absolute', left: '50%', top: '50%',
              borderRadius: 4, marginTop: -44, marginLeft: -18, background: '#cdcdcd',
              backgroundImage: 'linear-gradient(30deg,rgba(0,0,0,0.24) 0%,rgba(0,0,0,0) 100%)',
              boxShadow: 'inset 0 0 3px #888',
            }} />

            {/* Keyboard */}
            <div className="macbook-keyboard" style={{
              width: 130, height: 45, position: 'absolute', left: 7, top: 41,
              borderRadius: 4, background: '#cdcdcd',
              backgroundImage: 'linear-gradient(30deg,rgba(0,0,0,0.24) 0%,rgba(0,0,0,0) 100%)',
              boxShadow: 'inset 0 0 3px #777', paddingLeft: 2, overflow: 'hidden',
            }}>
              {Array.from({ length: KEY_COUNT }).map((_, i) => (
                <div key={`k-${i}`} className={keyClass} style={keyBase} />
              ))}
              <div className={keyClass} style={{ ...keyBase, width: 45 }} />
              {Array.from({ length: FKEY_COUNT }).map((_, i) => (
                <div key={`f-${i}`} className={keyClass} style={{ ...keyBase, height: 3 }} />
              ))}
            </div>
          </div>

          {/* Corner screws */}
          {[{ left: 20, top: 20 }, { right: 20, top: 20 }, { right: 20, bottom: 20 }, { left: 20, bottom: 20 }].map((s, i) => (
            <div key={i} style={{ width: 5, height: 5, background: '#333', borderRadius: '50%', position: 'absolute', ...s }} />
          ))}
        </div>
      </div>

      {/* ── Shadow ── */}
      <div className="macbook-shadow mb-anim-shadow" style={{
        position: 'absolute', width: 60, height: 0, left: 40, top: 160,
        boxShadow: '0 0 60px 40px rgba(0,0,0,0.3)',
      }} />
    </div>
  )
}

/* ── Shiny animated text on MacBook screen ── */
function ShinyScreenText() {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
      <motion.div
        style={{
          fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: 14,
          letterSpacing: '-0.04em', lineHeight: 1,
          background: 'linear-gradient(90deg, #6366f1, #a78bfa, #f1f0fa, #a78bfa, #6366f1)',
          backgroundSize: '200% auto',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}
        animate={{ backgroundPosition: ['0% 0%', '100% 0%'] }}
        transition={{ duration: 2.5, repeat: Infinity, repeatType: 'reverse', ease: 'linear' }}
      >
        ForensicAI
      </motion.div>
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 4.5, color: 'rgba(99,102,241,0.6)', letterSpacing: '0.04em' }}>
        v2.0 · Intelligence Platform
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════
   ANIMATED HERO — rotating words
══════════════════════════════════════════════ */
function AnimatedHero() {
  const [titleNumber, setTitleNumber] = useState(0)
  const titles = useMemo(() => ['smarter', 'faster', 'accurately', 'precisely', 'fearlessly'], [])

  useEffect(() => {
    const id = setTimeout(() => {
      setTitleNumber(n => (n === titles.length - 1 ? 0 : n + 1))
    }, 2000)
    return () => clearTimeout(id)
  }, [titleNumber, titles])

  return (
    <div style={{ textAlign: 'center', marginBottom: 36 }}>
      <h1 style={{
        fontFamily: 'var(--font-display)', fontWeight: 800,
        fontSize: 'clamp(2rem, 5vw, 3.6rem)', letterSpacing: '-0.05em',
        lineHeight: 1.1, color: 'var(--text-primary)', marginBottom: 0,
      }}>
        <span style={{ display: 'block', background: 'linear-gradient(135deg, #f1f0fa 30%, var(--accent-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          Investigate cases
        </span>
        <span style={{ position: 'relative', display: 'flex', width: '100%', justifyContent: 'center', overflow: 'hidden', height: 'clamp(2.4rem,6vw,4.6rem)', alignItems: 'center' }}>
          &nbsp;
          {titles.map((title, index) => (
            <motion.span
              key={index}
              style={{
                position: 'absolute', fontWeight: 800, fontFamily: 'var(--font-display)',
                background: 'var(--gradient-primary)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}
              initial={{ opacity: 0, y: -50 }}
              transition={{ type: 'spring', stiffness: 60 }}
              animate={
                titleNumber === index
                  ? { y: 0, opacity: 1 }
                  : { y: titleNumber > index ? -80 : 80, opacity: 0 }
              }
            >
              {title}
            </motion.span>
          ))}
        </span>
      </h1>
    </div>
  )
}

/* ══════════════════════════════════════════════
   FEATURE CARD
══════════════════════════════════════════════ */
function FeatureCard({ icon: Icon, title, desc, accent, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4 }}
      style={{
        background: 'var(--bg-card)', border: '1px solid var(--border-primary)',
        borderRadius: 'var(--radius-xl)', padding: '28px 24px',
        position: 'relative', overflow: 'hidden', transition: 'box-shadow 0.25s, border-color 0.25s',
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 16px 40px ${accent}20`; e.currentTarget.style.borderColor = `${accent}40` }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'var(--border-primary)' }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${accent}, transparent)`, opacity: 0.7 }} />
      <div style={{ width: 44, height: 44, borderRadius: 11, background: `${accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, color: accent }}>
        <Icon size={21} />
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>{desc}</div>
    </motion.div>
  )
}

/* ══════════════════════════════════════════════
   MAIN LANDING PAGE
══════════════════════════════════════════════ */
export default function LandingPage() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true })
  }, [isAuthenticated, navigate])

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const features = [
    { icon: Shield, title: 'Chain of Custody', desc: 'Cryptographic SHA-256 hashing and immutable audit trails protect every piece of evidence.', accent: '#6366f1', delay: 0 },
    { icon: Brain, title: 'AI Report Generation', desc: 'GPT-4 powered synthesis drafts forensic narratives, timelines, and executive summaries in seconds.', accent: '#a78bfa', delay: 0.08 },
    { icon: Clock, title: 'Timeline Reconstruction', desc: 'Correlate logs, disk images, and PCAP captures into a unified chronological timeline.', accent: '#f59e0b', delay: 0.16 },
    { icon: Activity, title: 'Anomaly Detection', desc: 'ML Isolation Forest surfaces suspicious behavioral patterns across thousands of events instantly.', accent: '#10b981', delay: 0.24 },
    { icon: Globe, title: 'Threat Intelligence', desc: 'Live IOC matching against threat feeds. Link artifacts to known adversary TTPs instantly.', accent: '#f43f5e', delay: 0.32 },
    { icon: MessageSquare, title: 'Case RAG Chat', desc: 'Ask questions about your case in plain English — the AI retrieves from all uploaded evidence.', accent: '#38bdf8', delay: 0.4 },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', overflowX: 'hidden' }}>

      {/* ── NAV ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 48px', height: 64,
        background: scrolled ? 'rgba(6,6,8,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border-primary)' : '1px solid transparent',
        transition: 'all 0.3s ease',
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(99,102,241,0.4)' }}>
            <Shield size={17} color="white" />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.05rem', letterSpacing: '-0.03em', background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            ForensicAI
          </span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link to="/login" style={{ padding: '8px 18px', borderRadius: 8, fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
          >Sign In</Link>
          <Link to="/login" style={{ padding: '9px 22px', borderRadius: 8, fontSize: '0.84rem', fontWeight: 700, background: 'var(--gradient-primary)', color: 'white', textDecoration: 'none', boxShadow: '0 4px 16px rgba(99,102,241,0.35)', transition: 'box-shadow 0.2s, transform 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 24px rgba(99,102,241,0.55)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(99,102,241,0.35)'; e.currentTarget.style.transform = 'none' }}
          >Get Started</Link>
        </div>
      </nav>

      {/* ══════════════════════════════════════════════
          HERO — MacBook 3D + shiny text + rotating words
      ══════════════════════════════════════════════ */}
      <section style={{
        position: 'relative', minHeight: '100vh',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', paddingTop: 64,
      }}>
        <ParticleCanvas />

        {/* Gradient overlays */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(99,102,241,0.07) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', top: '10%', left: '5%', width: 340, height: 340, borderRadius: '50%', background: 'rgba(99,102,241,0.07)', filter: 'blur(90px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '15%', right: '8%', width: 280, height: 280, borderRadius: '50%', background: 'rgba(167,139,250,0.05)', filter: 'blur(90px)', pointerEvents: 'none' }} />

        {/* Grid */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'linear-gradient(rgba(99,102,241,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.035) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 900, margin: '0 auto', padding: '0 24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

          {/* Badge */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 32, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 100, padding: '6px 16px 6px 10px' }}>
            <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Zap size={11} color="white" /></span>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--accent-secondary)', letterSpacing: '0.02em' }}>AI-Powered Digital Forensics Platform</span>
          </motion.div>

          {/* ── 3D MacBook ── */}
          <motion.div initial={{ opacity: 0, scale: 0.88 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}>
            <div style={{ position: 'relative', width: 300, height: 240, marginBottom: 32 }}>
              <MacBook3D />
            </div>
          </motion.div>

          {/* ── Rotating words hero ── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.6 }} style={{ width: '100%' }}>
            <AnimatedHero />
          </motion.div>

          {/* Sub-description */}
          <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.8 }}
            style={{ fontSize: 'clamp(0.9rem, 1.8vw, 1.05rem)', color: 'var(--text-secondary)', lineHeight: 1.75, maxWidth: 580, margin: '0 auto 36px', textAlign: 'center' }}>
            AI-assisted evidence analysis, automated forensic reporting, chain-of-custody compliance, and real-time threat intelligence — all in one premium platform.
          </motion.p>

          {/* CTAs */}
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.95 }}
            style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 40 }}>
            <Link to="/login"
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '13px 30px', borderRadius: 10, fontSize: '0.94rem', fontWeight: 700, background: 'var(--gradient-primary)', color: 'white', textDecoration: 'none', boxShadow: '0 6px 28px rgba(99,102,241,0.4)', fontFamily: 'var(--font-display)', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 40px rgba(99,102,241,0.6)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 6px 28px rgba(99,102,241,0.4)' }}>
              Start Investigating <MoveRight size={17} />
            </Link>
            <a href="#features"
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '13px 26px', borderRadius: 10, fontSize: '0.94rem', fontWeight: 600, background: 'rgba(255,255,255,0.04)', color: 'var(--text-primary)', textDecoration: 'none', border: '1px solid var(--border-primary)', fontFamily: 'var(--font-display)', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.08)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.25)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'var(--border-primary)' }}>
              See Features <ChevronDown size={17} />
            </a>
          </motion.div>

          {/* Trust pills */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 1.1 }}
            style={{ display: 'flex', gap: 22, justifyContent: 'center', flexWrap: 'wrap' }}>
            {['SHA-256 Hashing', 'AES-256 Encrypted', 'GDPR Compliant', 'Open Source'].map(t => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                <Check size={12} style={{ color: 'var(--accent-success)' }} /> {t}
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll hint */}
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}
          style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', color: 'var(--text-muted)', zIndex: 2 }}>
          <ChevronDown size={22} />
        </motion.div>
      </section>

      {/* ── STATS ── */}
      <section style={{ padding: '64px 48px', borderTop: '1px solid var(--border-primary)', borderBottom: '1px solid var(--border-primary)', background: 'rgba(99,102,241,0.02)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 32 }}>
          {[['10K+', 'Cases Investigated'], ['99.9%', 'Evidence Integrity'], ['< 2s', 'AI Parse Time'], ['50+', 'Evidence Formats'], ['SOC 2', 'Compliance Ready']].map(([v, l]) => (
            <motion.div key={l} initial={{ opacity: 0, scale: 0.85 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', fontWeight: 800, letterSpacing: '-0.05em', background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', lineHeight: 1, marginBottom: 6 }}>{v}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{l}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: '96px 48px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 14, padding: '5px 14px', borderRadius: 100, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', fontSize: '0.72rem', fontWeight: 600, color: 'var(--accent-secondary)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              <Star size={10} /> Platform Features
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--text-primary)', marginBottom: 14 }}>Everything you need to investigate faster</h2>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', maxWidth: 520, margin: '0 auto', lineHeight: 1.75 }}>Built for cybersecurity professionals, incident responders, and forensic analysts.</p>
          </motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            {features.map(f => <FeatureCard key={f.title} {...f} />)}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: '80px 48px', background: 'rgba(6,6,8,0.8)', borderTop: '1px solid var(--border-primary)', borderBottom: '1px solid var(--border-primary)' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--text-primary)', marginBottom: 10 }}>From evidence to report in minutes</h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>Not hours. Not days.</p>
          </motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 28 }}>
            {[
              { icon: Upload, label: 'Upload Evidence', desc: 'Drag & drop logs, disk images, PCAP files. Instant SHA-256 hashing.', color: '#6366f1' },
              { icon: Search, label: 'AI Parses & Correlates', desc: 'Automated parsing, timeline extraction, IOC matching, anomaly detection.', color: '#a78bfa' },
              { icon: FileText, label: 'Generate Report', desc: 'One-click AI report generation. Review, edit, export to PDF.', color: '#f59e0b' },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }} style={{ textAlign: 'center', padding: '28px 16px' }}>
                <div style={{ width: 54, height: 54, borderRadius: '50%', margin: '0 auto 16px', background: `linear-gradient(135deg, ${s.color}, ${s.color}cc)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 24px ${s.color}35`, position: 'relative' }}>
                  <s.icon size={23} color="white" />
                  <span style={{ position: 'absolute', top: -8, right: -8, width: 22, height: 22, borderRadius: '50%', background: 'var(--bg-primary)', border: `2px solid ${s.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.62rem', fontWeight: 800, color: s.color }}>{i + 1}</span>
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.98rem', color: 'var(--text-primary)', marginBottom: 8 }}>{s.label}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>{s.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '96px 48px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '10%', left: '20%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(99,102,241,0.08)', filter: 'blur(80px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '15%', width: 250, height: 250, borderRadius: '50%', background: 'rgba(167,139,250,0.06)', filter: 'blur(80px)', pointerEvents: 'none' }} />
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ position: 'relative', zIndex: 2, maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4.5vw, 3rem)', fontWeight: 800, letterSpacing: '-0.05em', background: 'linear-gradient(135deg, #f1f0fa, var(--accent-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', lineHeight: 1.1, marginBottom: 20 }}>
            Ready to investigate smarter?
          </h2>
          <p style={{ fontSize: '0.94rem', color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: 36 }}>Join forensic investigators using ForensicAI to close cases faster with AI-assisted analysis and automated reporting.</p>
          <Link to="/login"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 9, padding: '14px 34px', borderRadius: 12, fontSize: '0.98rem', fontWeight: 700, background: 'var(--gradient-primary)', color: 'white', textDecoration: 'none', boxShadow: '0 8px 36px rgba(99,102,241,0.45)', fontFamily: 'var(--font-display)', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 14px 50px rgba(99,102,241,0.65)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 36px rgba(99,102,241,0.45)' }}>
            Create Free Account <ArrowRight size={18} />
          </Link>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid var(--border-primary)', padding: '28px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={13} color="white" />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.88rem', fontWeight: 700, background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>ForensicAI</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.76rem', marginLeft: 4 }}>© 2025</span>
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          {[['Privacy', '/legal'], ['Terms', '/legal'], ['GitHub', 'https://github.com/cybersecurity26/ForensicAI']].map(([label, href]) => (
            <a key={label} href={href} style={{ fontSize: '0.76rem', color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
            >{label}</a>
          ))}
        </div>
      </footer>
    </div>
  )
}
