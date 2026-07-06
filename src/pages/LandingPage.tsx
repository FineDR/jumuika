import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { motion, useInView, useMotionValue, useSpring, useScroll, useTransform, type Variants } from 'framer-motion';
import { LogoIcon } from '../components/ui/Logo';
import {
  ArrowRight, Calendar, Layers, Users,
  TrendingUp, Sparkles, CheckCircle, Star, Globe, Sun, Moon,
  Zap, BarChart2, Clock, Lock, ChevronRight, Play
} from 'lucide-react';
import { Button } from '../components/ui/Button';

// ─── Animation Variants ───────────────────────────────────────────────────────
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] } }
};
const stagger: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.05 } }
};
const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } }
};

// ─── Animated Counter ─────────────────────────────────────────────────────────
function AnimatedNumber({ target, suffix = '', duration = 1.5 }: { target: number; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { duration: duration * 1000, bounce: 0 });
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    if (isInView) motionVal.set(target);
  }, [isInView, motionVal, target]);

  useEffect(() => {
    return spring.on('change', v => setDisplay(Math.round(v).toString()));
  }, [spring]);

  return <span ref={ref}>{display}{suffix}</span>;
}

export const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const isSwahili = i18n.language === 'sw';
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { scrollY } = useScroll();
  // Navbar becomes slightly more opaque and adds shadow on scroll
  const navShadow = useTransform(scrollY, [0, 80], ['none', '0 10px 30px -10px rgba(0,0,0,0.1)']);

  const toggleLanguage = () => i18n.changeLanguage(isSwahili ? 'en' : 'sw');
  const handleLaunch = () => navigate(user ? '/dashboard' : '/auth');
  const closeMobileNav = () => setMobileNavOpen(false);

  const features = [
    { icon: Users,      num: '01', title: t('landing.features.registry.title'),   description: t('landing.features.registry.desc'),   accent: '#14b8a6', bg: 'from-teal-500/15 to-teal-500/0' },
    { icon: Calendar,   num: '02', title: t('landing.features.schedules.title'),  description: t('landing.features.schedules.desc'),  accent: '#3b82f6', bg: 'from-blue-500/15 to-blue-500/0' },
    { icon: Layers,     num: '03', title: t('landing.features.waterfall.title'),  description: t('landing.features.waterfall.desc'),  accent: '#8b5cf6', bg: 'from-violet-500/15 to-violet-500/0' },
    { icon: TrendingUp, num: '04', title: t('landing.features.dashboards.title'), description: t('landing.features.dashboards.desc'), accent: '#10b981', bg: 'from-emerald-500/15 to-emerald-500/0' }
  ];

  const stats = [
    { value: 100, suffix: '%', label: t('landing.stats.accuracy') },
    { value: 0,   suffix: 'ms', label: t('landing.stats.sync') },
    { value: 50,  suffix: '+',  label: t('landing.stats.events') },
  ];

  const testimonials = [
    { quote: 'Jumuika completely transformed how we track contributions for our harambee. No more spreadsheets!', name: 'James Kamau', role: 'Community Treasurer', initials: 'JK', color: 'from-teal-400 to-cyan-400' },
    { quote: 'Setting up installment plans and tracking who has paid is now effortless. Highly recommend.', name: 'Wanjiru Njeri', role: 'Event Coordinator', initials: 'WN', color: 'from-violet-400 to-blue-400' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-secondary/30">

      {/* ── Ambient blobs ───────────────────────────── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
        <motion.div animate={{ scale: [1, 1.08, 1], opacity: [0.6, 1, 0.6] }} transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-72 -right-48 w-[700px] h-[700px] bg-secondary/10 rounded-full blur-[140px]" />
        <motion.div animate={{ scale: [1, 1.12, 1], opacity: [0.5, 0.9, 0.5] }} transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
          className="absolute top-[40rem] -left-48 w-[600px] h-[600px] bg-info/8 rounded-full blur-[120px]" />
        <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 6 }}
          className="absolute bottom-0 right-[5%] w-[500px] h-[500px] bg-violet-500/8 rounded-full blur-[100px]" />
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-grid-pattern opacity-100" />
        <div className="absolute inset-0 bg-radial-fade" />
      </div>

      {/* ── NAVBAR ─────────────────────────────────── */}
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{ boxShadow: navShadow }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-50 w-full backdrop-blur-2xl bg-background/80 border-b border-border/40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <button onClick={() => { navigate('/'); closeMobileNav(); }} className="flex items-center gap-2.5 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary rounded-lg group">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl shadow-lg shadow-secondary/30 group-hover:shadow-secondary/50 transition-shadow">
                <LogoIcon className="w-8 h-8" />
              </div>
              <span className="font-heading text-xl font-extrabold tracking-wide text-foreground">{t('app_name')}</span>
            </button>

            {/* Desktop nav */}
            <div className="hidden sm:flex items-center gap-2">
              <button onClick={toggleLanguage} className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg border border-border bg-surface/50 hover:bg-surface hover:border-secondary text-foreground text-xs font-bold transition-all hover:text-secondary focus:outline-none">
                <Globe className="w-3.5 h-3.5" />
                <span className="uppercase tracking-widest">{isSwahili ? 'EN' : 'SW'}</span>
              </button>
              <button onClick={toggleTheme} className="flex items-center justify-center w-9 h-9 rounded-lg border border-border bg-surface/50 hover:bg-surface hover:border-secondary text-foreground hover:text-secondary transition-all focus:outline-none">
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <div className="w-px h-5 bg-border mx-1" />
              {user ? (
                <Button onClick={() => navigate('/dashboard')} variant="primary" size="sm" className="gap-2 group">
                  {t('landing.launch_dashboard')} <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              ) : (
                <>
                  <Link to="/auth" className="text-sm font-semibold text-muted hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-foreground/5">{t('landing.sign_in')}</Link>
                  <Button onClick={() => navigate('/auth')} variant="primary" size="sm" className="gap-2 group">
                    {t('landing.start_free')} <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                </>
              )}
            </div>

            {/* Mobile nav icons */}
            <div className="flex sm:hidden items-center gap-2">
              <button onClick={toggleLanguage} className="flex items-center gap-1 px-2 py-1.5 rounded-lg border border-border bg-surface/60 hover:border-secondary text-xs font-bold text-foreground hover:text-secondary transition-all focus:outline-none">
                <Globe className="w-3 h-3" /><span>{isSwahili ? 'EN' : 'SW'}</span>
              </button>
              <button onClick={toggleTheme} className="flex items-center justify-center w-9 h-9 rounded-lg border border-border bg-surface/60 hover:border-secondary text-foreground hover:text-secondary transition-all focus:outline-none">
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button onClick={() => setMobileNavOpen(o => !o)} aria-label={mobileNavOpen ? 'Close' : 'Menu'}
                className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-foreground/5 hover:bg-secondary/10 border border-border hover:border-secondary/50 text-foreground hover:text-secondary transition-all focus:outline-none">
                <span className="flex flex-col gap-[5px] w-4">
                  <span className={`block h-[2px] bg-current rounded-full transition-all duration-300 origin-center ${mobileNavOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
                  <span className={`block h-[2px] bg-current rounded-full transition-all duration-300 ${mobileNavOpen ? 'opacity-0 scale-x-0' : ''}`} />
                  <span className={`block h-[2px] bg-current rounded-full transition-all duration-300 origin-center ${mobileNavOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileNavOpen && (
          <div className="sm:hidden border-t border-border/50 bg-surface/95 backdrop-blur-xl animate-drop-in">
            <div className="px-4 py-4 flex flex-col gap-3 max-w-7xl mx-auto">
              {user ? (
                <Button onClick={() => { navigate('/dashboard'); closeMobileNav(); }} variant="primary" size="md" className="w-full gap-2 justify-center">
                  {t('landing.launch_dashboard')} <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <>
                  <Link to="/auth" onClick={closeMobileNav} className="w-full text-center py-3 rounded-xl border border-border text-sm font-semibold hover:bg-foreground/5 transition-colors">{t('landing.sign_in')}</Link>
                  <Button onClick={() => { navigate('/auth'); closeMobileNav(); }} variant="primary" size="md" className="w-full gap-2 justify-center">
                    {t('landing.cta.button_guest')} <ArrowRight className="w-4 h-4" />
                  </Button>
                </>
              )}
              <button onClick={() => { document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); closeMobileNav(); }}
                className="w-full py-2.5 text-sm font-medium text-muted hover:text-foreground transition-colors text-center">
                {t('landing.explore_features')}
              </button>
            </div>
          </div>
        )}
      </motion.header>

      <main className="relative z-10 pt-16">

        {/* ── HERO ───────────────────────────────────── */}
        <section className="relative px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16 lg:pt-20 pb-0">
          <motion.div variants={stagger} initial="hidden" animate="visible"
            className="max-w-6xl mx-auto flex flex-col items-center text-center gap-6 sm:gap-8">

            {/* Badge */}
            <motion.div variants={scaleIn}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/25 text-xs sm:text-sm font-semibold text-secondary animate-pulse-glow">
              <Zap className="w-3.5 h-3.5 fill-secondary" />
              <span>{t('landing.badge')}</span>
            </motion.div>

            {/* Headline */}
            <motion.h1 variants={fadeUp}
              className="font-heading text-[2.6rem] sm:text-5xl md:text-6xl lg:text-[5rem] font-extrabold tracking-tight leading-[1.08] max-w-4xl">
              {t('landing.headline_1')}{' '}
              <span className="text-gradient-teal">{t('landing.headline_2')}</span>
            </motion.h1>

            {/* Subtext */}
            <motion.p variants={fadeUp} className="max-w-2xl text-base sm:text-lg lg:text-xl text-muted leading-relaxed">
              {t('landing.subtext')}
            </motion.p>

            {/* CTAs */}
            <motion.div variants={fadeUp} className="flex flex-col xs:flex-row items-stretch xs:items-center gap-3 w-full xs:w-auto">
              <Button onClick={handleLaunch} variant="primary" size="lg"
                className="gap-2.5 group shadow-2xl shadow-secondary/25 hover:shadow-secondary/40 hover:-translate-y-0.5 text-base px-7">
                <span>{user ? t('landing.launch_dashboard') : t('landing.start_free')}</span>
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
              {!user && (
                <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-border bg-surface/60 hover:bg-surface hover:border-secondary/50 text-sm font-semibold text-foreground hover:text-secondary transition-all">
                  <Play className="w-4 h-4" />
                  <span>{t('landing.explore_features')}</span>
                </button>
              )}
            </motion.div>

            {/* Trust row */}
            <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-muted font-medium">
              {['No credit card', 'Free forever', 'Mobile ready'].map((item, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-success shrink-0" />
                  {item}
                </span>
              ))}
            </motion.div>

            {/* ── Hero Visual: Dashboard Mockup ───── */}
            <motion.div
              variants={{ hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] } } }}
              className="w-full max-w-4xl mt-4 sm:mt-8 relative"
            >
              {/* Glow behind card */}
              <div className="absolute -inset-4 bg-gradient-to-r from-secondary/20 via-info/20 to-violet-500/20 rounded-3xl blur-3xl opacity-60" />

              {/* Main dashboard card */}
              <div className="relative rounded-2xl border border-border/60 bg-surface/90 backdrop-blur-xl shadow-2xl overflow-hidden">
                {/* Card header bar */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-background/40">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-danger/70" />
                    <div className="w-3 h-3 rounded-full bg-warning/70" />
                    <div className="w-3 h-3 rounded-full bg-success/70" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-background/60 border border-border/40 text-xs text-muted font-mono">
                      <Lock className="w-2.5 h-2.5 text-success" />
                      locoo.twendedigital.tech
                    </div>
                  </div>
                </div>

                {/* Dashboard content mockup */}
                <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  {/* Stat cards */}
                  {[
                    { label: 'Total Collected', value: 'TZS 2.4M', change: '+12%', color: 'text-success', icon: TrendingUp },
                    { label: 'Active Contributors', value: '142', change: '+3 this week', color: 'text-secondary', icon: Users },
                    { label: 'Upcoming Dues', value: 'TZS 380K', change: '8 this month', color: 'text-warning', icon: Clock },
                  ].map((s, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
                      className="flex flex-col gap-2 p-4 rounded-xl bg-background/60 border border-border/40 hover:border-secondary/40 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted font-medium">{s.label}</span>
                        <s.icon className={`w-4 h-4 ${s.color}`} />
                      </div>
                      <span className="font-heading text-xl font-bold text-foreground">{s.value}</span>
                      <span className={`text-xs font-semibold ${s.color}`}>{s.change}</span>
                    </motion.div>
                  ))}

                  {/* Progress bars mockup */}
                  <div className="sm:col-span-2 flex flex-col gap-3 p-4 rounded-xl bg-background/60 border border-border/40">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-foreground">Collection Progress</span>
                      <span className="text-xs text-muted">Oct 2024</span>
                    </div>
                    {[
                      { name: 'Harambee Event', pct: 78, color: 'bg-secondary' },
                      { name: 'Wedding Fund', pct: 55, color: 'bg-info' },
                      { name: 'Education Drive', pct: 92, color: 'bg-success' },
                    ].map((b, i) => (
                      <div key={i} className="flex flex-col gap-1">
                        <div className="flex justify-between text-xs text-muted">
                          <span>{b.name}</span><span>{b.pct}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-border/50 overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full ${b.color}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${b.pct}%` }}
                            transition={{ delay: 0.7 + i * 0.15, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Recent payments */}
                  <div className="flex flex-col gap-3 p-4 rounded-xl bg-background/60 border border-border/40">
                    <span className="text-sm font-semibold text-foreground">Recent Payments</span>
                    {[
                      { name: 'A. Mwangi', amt: '5,000', time: '2m ago' },
                      { name: 'F. Ochieng', amt: '10,000', time: '1h ago' },
                      { name: 'M. Waweru', amt: '2,500', time: '3h ago' },
                    ].map((p, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-secondary/40 to-info/40 flex items-center justify-center font-bold text-secondary text-[10px]">
                            {p.name[0]}
                          </div>
                          <span className="text-foreground font-medium">{p.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-success font-semibold">+{p.amt}</div>
                          <div className="text-muted">{p.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shimmer overlay bar at top */}
                <div className="absolute top-0 left-0 right-0 h-[2px] animate-shimmer" />
              </div>

              {/* Floating badges */}
              <motion.div
                animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="hidden sm:flex absolute -top-5 -left-6 items-center gap-2 px-3 py-2 rounded-xl bg-surface border border-secondary/40 shadow-xl shadow-secondary/20 text-xs font-semibold text-secondary"
              >
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                Live sync active
              </motion.div>
              <motion.div
                animate={{ y: [0, -6, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
                className="hidden sm:flex absolute -bottom-5 -right-6 items-center gap-2 px-3 py-2 rounded-xl bg-surface border border-info/40 shadow-xl shadow-info/20 text-xs font-semibold text-info"
              >
                <BarChart2 className="w-3.5 h-3.5" />
                Real-time analytics
              </motion.div>
            </motion.div>
          </motion.div>
        </section>

        {/* ── STATS BAR ──────────────────────────────── */}
        <section className="relative px-4 sm:px-6 lg:px-8 py-12 sm:py-20 mt-10 sm:mt-16">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-3 gap-4 sm:gap-8 p-6 sm:p-8 rounded-2xl bg-surface/60 border border-border/50 backdrop-blur-md">
              {stats.map((s, i) => (
                <div key={i} className="flex flex-col items-center text-center gap-1">
                  <span className="font-heading text-2xl sm:text-4xl font-extrabold text-gradient-teal">
                    <AnimatedNumber target={s.value} suffix={s.suffix} />
                  </span>
                  <span className="text-xs sm:text-sm text-muted font-medium">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURES ───────────────────────────────── */}
        <section id="features" className="relative px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-t border-border/30">
          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
            className="max-w-7xl mx-auto">

            <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-20">
              <motion.div variants={scaleIn} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-xs font-semibold text-secondary mb-4">
                <Sparkles className="w-3 h-3 fill-secondary" />
                {t('landing.features.badge')}
              </motion.div>
              <motion.h2 variants={fadeUp} className="font-heading text-2xl sm:text-4xl font-bold text-foreground mb-4">
                {t('landing.features.title')}
              </motion.h2>
              <motion.p variants={fadeUp} className="text-sm sm:text-lg text-muted">
                {t('landing.features.subtitle')}
              </motion.p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
              {features.map((f, i) => {
                const Icon = f.icon;
                return (
                  <motion.div
                    key={i}
                    variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] } } }}
                    className={`group relative flex gap-5 sm:gap-6 p-6 sm:p-7 rounded-2xl border border-border/50 bg-gradient-to-br ${f.bg} bg-surface/40 backdrop-blur-md overflow-hidden cursor-default hover:border-[${f.accent}]/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl`}
                    style={{ '--accent': f.accent } as React.CSSProperties}
                  >
                    {/* Number */}
                    <span className="absolute top-5 right-6 font-heading text-5xl font-extrabold text-foreground/5 select-none">{f.num}</span>

                    {/* Icon */}
                    <div className="shrink-0 flex items-center justify-center w-12 h-12 rounded-2xl border border-border/50 bg-background/60 shadow-lg"
                      style={{ boxShadow: `0 4px 20px ${f.accent}25` }}>
                      <Icon className="w-6 h-6" style={{ color: f.accent }} />
                    </div>

                    {/* Text */}
                    <div className="flex flex-col gap-2 relative">
                      <h3 className="text-lg font-bold text-foreground group-hover:text-secondary transition-colors">{f.title}</h3>
                      <p className="text-sm text-muted leading-relaxed">{f.description}</p>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold mt-1 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: f.accent }}>
                        Learn more <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </section>

        {/* ── TESTIMONIALS ───────────────────────────── */}
        <section className="relative px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-t border-border/30 overflow-hidden">
          {/* Bg accent */}
          <div className="absolute inset-0 bg-gradient-to-b from-secondary/5 via-transparent to-transparent pointer-events-none" />

          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
            className="max-w-5xl mx-auto">

            <div className="text-center mb-12 sm:mb-16">
              <motion.h2 variants={fadeUp} className="font-heading text-2xl sm:text-4xl font-bold text-foreground mb-3">
                {t('landing.testimonials.title')}
              </motion.h2>
              <motion.div variants={fadeUp} className="flex justify-center gap-1 mt-3">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-warning text-warning" />)}
              </motion.div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
              {testimonials.map((t, i) => (
                <motion.div key={i}
                  variants={{ hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.5, delay: i * 0.15 } } }}
                  className="relative flex flex-col gap-5 p-6 sm:p-8 rounded-2xl bg-surface border border-border hover:border-secondary/40 shadow-sm hover:shadow-xl transition-all duration-300"
                >
                  {/* Big quote mark */}
                  <span className="absolute top-5 right-6 text-7xl font-serif leading-none text-secondary/10 select-none">"</span>

                  <p className="text-sm sm:text-base text-foreground/80 leading-relaxed italic relative z-10">"{t.quote}"</p>

                  <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center font-bold text-white text-sm shrink-0`}>
                      {t.initials}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{t.name}</p>
                      <p className="text-xs text-muted">{t.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* ── FINAL CTA ──────────────────────────────── */}
        <section className="relative px-4 sm:px-6 lg:px-8 py-16 sm:py-28 overflow-hidden">
          {/* Dramatic background */}
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/15 via-background to-info/10 pointer-events-none" />
          <div className="absolute inset-0 bg-grid-pattern-light pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-secondary/15 rounded-full blur-[80px] pointer-events-none" />

          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
            className="max-w-3xl mx-auto text-center flex flex-col items-center gap-7 relative">

            {/* Glowing icon */}
            <motion.div variants={scaleIn} className="relative">
              <div className="absolute inset-0 bg-secondary/30 blur-3xl rounded-full scale-[2] animate-pulse-glow" />
              <div className="relative w-20 h-20 flex items-center justify-center">
                <LogoIcon className="w-20 h-20 drop-shadow-2xl" />
              </div>
            </motion.div>

            <motion.div variants={fadeUp} className="space-y-4">
              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground">
                {t('landing.cta.title')}
              </h2>
              <p className="text-base sm:text-lg text-muted max-w-xl mx-auto">
                {t('landing.cta.subtitle')}
              </p>
            </motion.div>

            <motion.ul variants={fadeUp} className="flex flex-row flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-muted font-medium">
              {[0, 1, 2, 3].map(i => (
                <li key={i} className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-success shrink-0" />
                  <span>{t(`landing.cta.perks.${i}`, ['Free to use', 'No credit card', 'Cloud secured', 'Mobile ready'][i])}</span>
                </li>
              ))}
            </motion.ul>

            <motion.div variants={fadeUp} className="flex flex-col xs:flex-row gap-3 w-full xs:w-auto">
              <Button onClick={handleLaunch} variant="primary" size="lg"
                className="gap-3 group shadow-2xl shadow-secondary/30 hover:shadow-secondary/50 hover:-translate-y-0.5 text-base px-8">
                <span>{user ? t('landing.cta.button_user') : t('landing.cta.button_guest')}</span>
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </motion.div>
          </motion.div>
        </section>
      </main>

      {/* ── FOOTER ─────────────────────────────────── */}
      <footer className="border-t border-border/40 bg-surface/20 backdrop-blur-sm py-8 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-muted">
            <div className="flex items-center gap-2 font-medium">
              <div className="flex items-center justify-center w-7 h-7">
                <LogoIcon className="w-6 h-6" />
              </div>
              <span className="font-heading font-bold text-foreground text-base">{t('app_name')}</span>
              <span className="text-border">·</span>
              <span>{t('landing.footer.tagline')}</span>
            </div>
            <p>© {new Date().getFullYear()} Locoo · <a href="/auth" className="hover:text-foreground transition-colors underline underline-offset-2">{t('landing.footer.privacy')}</a></p>
          </div>
        </div>
      </footer>
    </div>
  );
};
