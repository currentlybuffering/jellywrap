import WaitlistForm from './waitlist-form'
import PlatformInstall from './platform-install'
import { ArrowRight, Shield, Zap, Users, Tv, HardDrive, Globe, Check, Apple, Monitor, Terminal } from 'lucide-react'

const comparisons = [
  ['Media streaming', 'Free', 'Free'],
  ['Hardware transcoding', '$750 lifetime', 'Free'],
  ['Live TV & DVR', '$750 lifetime', 'Free'],
  ['Offline downloads', '$750 lifetime', 'Free'],
  ['Mobile apps', '$4.99/mo or $750', 'Free'],
  ['Remote access', 'Plex Relay (paid)', 'JellyWrap Relay (free)'],
  ['Skip intros & credits', '$750 lifetime', 'Free'],
  ['Plex migration tool', "Doesn't exist", 'Built-in'],
  ['Duplicate detection', 'No', 'Yes'],
  ['Watch together', 'No', 'Yes'],
  ['Source code', 'Closed source', 'Open source (MIT)'],
  ['Data privacy', 'Tracks your history', 'You own everything'],
] as const

const heroFeatures = [
  {
    icon: ArrowRight,
    title: 'One-Click Plex Migration',
    desc: 'Watch history, ratings, favorites — matched by TMDB/IMDB IDs. Zero data loss, zero effort.',
  },
  {
    icon: Shield,
    title: 'Your Data, Your Server',
    desc: 'No tracking, no analytics, no phone home. Self-host on your hardware or let us run it.',
  },
  {
    icon: Zap,
    title: 'Everything Free, Self-Hosted',
    desc: 'Transcoding, Live TV, mobile apps, remote access — no $750 paywall. Ever.',
  },
] as const

const plans = [
  {
    name: 'Self-Hosted',
    price: '$0',
    period: 'forever',
    desc: 'Run it on your own hardware. Every feature, no limits.',
    features: ['Full migration tool', 'Media browser with playback', 'WireGuard relay', 'Smart library tools', 'Docker Compose deploy', 'Community support'],
    cta: 'View on GitHub',
    ctaHref: 'https://github.com/currentlybuffering/jellywrap',
    highlight: false,
  },
  {
    name: 'Cloud',
    price: '$5',
    period: '/mo',
    desc: 'We handle the server. You connect your Jellyfin and go.',
    features: ['Managed migration', 'Managed relay', 'Auto-updates', 'SSL included', 'Email support', 'All features'],
    cta: 'Join Waitlist',
    ctaHref: '#waitlist',
    highlight: true,
  },
  {
    name: 'Cloud+',
    price: '$10',
    period: '/mo',
    desc: 'Fully managed — we run Jellyfin too. Zero setup required.',
    features: ['Everything in Cloud', 'Managed Jellyfin server', '50GB storage included', 'Priority support', 'Automatic backups', 'Custom domain'],
    cta: 'Join Waitlist',
    ctaHref: '#waitlist',
    highlight: false,
  },
] as const

const trustBadges = [
  ['MIT License', '100% open source'],
  ['Self-Hosted', '$0, every feature'],
  ['Built on Jellyfin', 'Battle-tested core'],
  ['Zero Telemetry', 'No tracking, ever'],
  ['Cross-Platform', 'Mac, Windows, Linux'],
] as const

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden">
      {/* ===== HERO ===== */}
      <section className="relative min-h-[85vh] sm:min-h-[92vh] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-vault-950 via-vault-900 to-vault-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gold/8 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-gold/5 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]" />

        <div className="absolute top-20 right-[10%] w-72 h-72 bg-gold/5 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-20 left-[5%] w-96 h-96 bg-gold/3 rounded-full blur-[150px] animate-pulse-glow delay-1000" />

        <div className="relative max-w-6xl mx-auto px-5 sm:px-6 pt-24 sm:pt-28 pb-16 sm:pb-20">
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 mb-6 sm:mb-8 text-xs sm:text-sm bg-red-500/10 text-red-400 border border-red-500/20 rounded-full">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-red-400 animate-pulse" />
              Plex Lifetime jumping to $750 on July 1
            </div>
          </div>

          <h1 className="font-display text-[2.5rem] leading-[1.05] sm:text-6xl sm:leading-[0.95] md:text-[5.5rem] md:leading-[0.92] font-black tracking-tight sm:tracking-tighter mb-5 sm:mb-6 max-w-4xl animate-fade-in-up delay-200">
            Stop paying for your{' '}
            <span className="bg-gradient-to-r from-gold via-gold-bright to-gold bg-clip-text text-transparent">
              own media.
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-zinc-400 max-w-2xl mb-3 sm:mb-4 leading-relaxed animate-fade-in-up delay-300">
            JellyWrap wraps Jellyfin with one-click Plex migration, a polished browser UX,
            and smart library tools. Self-host for free, or let us run the server.
          </p>
          <p className="text-xs sm:text-sm text-zinc-500 max-w-xl mb-8 sm:mb-10 animate-fade-in-up delay-400">
            Built on{' '}
            <a href="https://jellyfin.org" className="text-zinc-400 underline underline-offset-2 hover:text-gold transition-colors">
              Jellyfin
            </a>{' '}
            — the open-source media server. JellyWrap adds everything Plex charges $750 for. Free and open source.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-10 sm:mb-12 animate-fade-in-up delay-500">
            <a href="/getting-started" className="btn-gold text-center text-base sm:text-lg px-7 sm:px-8 py-3.5 sm:py-4">
              Get Started Free
            </a>
            <a href="/migrate" className="btn-outline text-center px-6 py-3.5 sm:py-4">
              Migrate from Plex
            </a>
          </div>

          <div className="glass rounded-xl p-4 sm:p-5 max-w-lg animate-fade-in-up delay-700">
            <div className="text-zinc-500 mb-3 flex items-center gap-2 text-xs sm:text-sm">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-400 animate-pulse" />
              Self-host in 2 minutes — auto-detected for your OS
            </div>
            <PlatformInstall />
          </div>
        </div>
      </section>

      {/* ===== TRUST STRIP ===== */}
      <section className="relative border-y border-vault-700/50">
        <div className="absolute inset-0 bg-gradient-to-r from-vault-950 via-vault-900 to-vault-950" />
        <div className="relative max-w-6xl mx-auto px-5 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-4 sm:gap-8">
            {trustBadges.map(([title, sub]) => (
              <div key={title} className="text-center min-w-[100px]">
                <div className="text-xs sm:text-sm font-semibold text-zinc-300">{title}</div>
                <div className="text-[10px] sm:text-xs text-zinc-500 mt-0.5">{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PLATFORMS ===== */}
      <section className="max-w-6xl mx-auto px-5 sm:px-6 py-12 sm:py-16">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
          {[
            { icon: Apple, label: 'macOS', sub: 'Docker Desktop or Homebrew' },
            { icon: Monitor, label: 'Windows', sub: 'Docker Desktop or WSL2' },
            { icon: Terminal, label: 'Linux', sub: 'Docker or native install' },
          ].map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex items-center gap-3 px-5 sm:px-6 py-3.5 sm:py-4 rounded-xl border border-vault-700/50 bg-vault-900/50 w-full sm:w-auto">
              <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-gold shrink-0" />
              <div>
                <div className="font-semibold text-sm">{label}</div>
                <div className="text-xs text-zinc-500">{sub}</div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-zinc-600 mt-4">
          Runs anywhere Docker does. Desktop apps for Mac and Windows coming soon.
        </p>
      </section>

      {/* ===== PROBLEM / SOLUTION ===== */}
      <section className="max-w-6xl mx-auto px-5 sm:px-6 py-16 sm:py-24">
        <div className="text-center mb-12 sm:mb-16 animate-fade-in-up">
          <p className="text-gold text-xs sm:text-sm font-mono uppercase tracking-widest mb-3 sm:mb-4">The problem</p>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-3 sm:mb-4">
            Plex is holding your media hostage
          </h2>
          <p className="text-sm sm:text-base text-zinc-500 max-w-2xl mx-auto leading-relaxed">
            Hardware transcoding? $750. Mobile apps? $750. Live TV? $750. Remote access? Pay more.
            Your watch history? Tracked and sold. Source code? Closed. Exit plan? None.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-8 mb-12 sm:mb-16">
          {heroFeatures.map(({ icon: Icon, title, desc }, i) => (
            <div key={title} className={`animate-fade-in-up delay-${(i + 1) * 200}`}>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center mb-4 sm:mb-5 shadow-[0_0_20px_rgba(232,197,71,0.1)]">
                <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-gold" />
              </div>
              <h3 className="font-semibold text-base sm:text-lg mb-1.5 sm:mb-2">{title}</h3>
              <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        <div className="glass rounded-2xl p-6 sm:p-8 md:p-12 max-w-3xl mx-auto text-center animate-scale-in">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Tv className="w-4 h-4 sm:w-5 sm:h-5 text-gold" />
            <HardDrive className="w-4 h-4 sm:w-5 sm:h-5 text-gold" />
            <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-gold" />
            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-gold" />
          </div>
          <h3 className="font-display text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3">
            Everything Plex paywalls — <span className="text-gold">free and open</span>
          </h3>
          <p className="text-sm sm:text-base text-zinc-500 leading-relaxed mb-5 sm:mb-6">
            Transcoding, Live TV, mobile apps, remote relay, skip intros, Watch Together,
            smart library tools, family controls. All included. All open source. All yours.
          </p>
          <a href="#compare" className="btn-outline inline-block">
            See the full comparison
          </a>
        </div>
      </section>

      {/* ===== COMPARISON ===== */}
      <section id="compare" className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-vault-950 via-vault-900/50 to-vault-950" />
        <div className="relative max-w-4xl mx-auto px-5 sm:px-6 py-16 sm:py-24">
          <div className="text-center mb-12 sm:mb-16 animate-fade-in-up">
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-3 sm:mb-4">
              Side-by-side
            </h2>
            <p className="text-sm sm:text-base text-zinc-500">Every feature. No paywalls. No compromises.</p>
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block glass rounded-2xl overflow-hidden animate-scale-in">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left py-4 px-6 text-zinc-500 font-medium">Feature</th>
                  <th className="text-center py-4 px-6 text-zinc-500 font-medium">Plex</th>
                  <th className="text-center py-4 px-6 font-medium">
                    <span className="bg-gradient-to-r from-gold to-gold-bright bg-clip-text text-transparent">
                      JellyWrap
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisons.map(([feat, plex, sv]) => (
                  <tr key={feat} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-6 text-zinc-300">{feat}</td>
                    <td className="py-3.5 px-6 text-center text-zinc-600">{plex}</td>
                    <td className="py-3.5 px-6 text-center text-gold font-semibold">{sv}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="sm:hidden space-y-3 animate-scale-in">
            {comparisons.map(([feat, plex, sv]) => (
              <div key={feat} className="glass rounded-xl p-4">
                <div className="font-semibold text-sm text-zinc-300 mb-2">{feat}</div>
                <div className="flex justify-between text-xs">
                  <div className="text-zinc-600">Plex: {plex}</div>
                  <div className="text-gold font-semibold">JellyWrap: {sv}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== MIGRATION ===== */}
      <section className="max-w-6xl mx-auto px-5 sm:px-6 py-16 sm:py-24">
        <div className="grid md:grid-cols-2 gap-10 sm:gap-16 items-center">
          <div className="animate-fade-in-up">
            <p className="text-gold text-xs sm:text-sm font-mono uppercase tracking-widest mb-3 sm:mb-4">Migration</p>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-3 sm:mb-4">
              Leaving Plex?{' '}
              <span className="bg-gradient-to-r from-gold to-gold-bright bg-clip-text text-transparent">
                Three clicks.
              </span>
            </h2>
            <p className="text-sm sm:text-base text-zinc-500 leading-relaxed mb-6 sm:mb-8">
              3-tier matching by TMDB/TVDB/IMDB IDs, title+year, or fuzzy title.
              Watch history, ratings, playlists — everything transfers.
            </p>
            <a href="/migrate" className="btn-gold inline-flex items-center gap-2">
              Start migration
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="space-y-5 sm:space-y-6">
            {[
              { num: '1', title: 'Connect both servers', desc: 'Enter your Plex URL/token and Jellyfin URL' },
              { num: '2', title: 'Pick what moves', desc: 'Watch history, ratings, favorites, playlists' },
              { num: '3', title: 'Done', desc: 'Real-time transfer. Zero data loss.' },
            ].map(({ num, title, desc }) => (
              <div key={num} className="flex gap-4 sm:gap-5 animate-fade-in-up">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(232,197,71,0.1)]">
                  <span className="text-gold font-bold font-mono text-base sm:text-lg">{num}</span>
                </div>
                <div>
                  <div className="font-semibold text-sm sm:text-base mb-0.5 sm:mb-1">{title}</div>
                  <div className="text-xs sm:text-sm text-zinc-500 leading-relaxed">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section id="pricing" className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-vault-950 via-vault-900/30 to-vault-950" />
        <div className="relative max-w-6xl mx-auto px-5 sm:px-6 py-16 sm:py-24">
          <div className="text-center mb-12 sm:mb-16 animate-fade-in-up">
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-3 sm:mb-4">
              Self-hosted or cloud —{' '}
              <span className="bg-gradient-to-r from-gold to-gold-bright bg-clip-text text-transparent">
                you pick
              </span>
            </h2>
            <p className="text-sm sm:text-base text-zinc-500 max-w-xl mx-auto leading-relaxed">
              Self-hosted gets every feature for free. Cloud is for people who
              don&apos;t want to run their own server. No feature paywalls either way.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6 max-w-4xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`card-glow flex flex-col animate-scale-in ${
                  plan.highlight
                    ? 'border-gold/30 ring-1 ring-gold/20 shadow-[0_0_40px_rgba(232,197,71,0.08)]'
                    : ''
                }`}
              >
                {plan.highlight && (
                  <div className="px-3 py-1 text-xs font-mono text-gold bg-gold/10 rounded-full self-start mb-4">
                    POPULAR
                  </div>
                )}
                <div className="mb-5">
                  <h3 className="font-semibold text-lg">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-3xl sm:text-4xl font-black font-mono bg-gradient-to-b from-gold to-gold-dim bg-clip-text text-transparent">
                      {plan.price}
                    </span>
                    <span className="text-zinc-500 text-sm">{plan.period}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-500 mt-3 leading-relaxed">{plan.desc}</p>
                </div>
                <ul className="space-y-2 sm:space-y-2.5 mb-6 sm:mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-400">
                      <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gold mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href={plan.ctaHref}
                  className={plan.highlight ? 'btn-gold text-center' : 'btn-outline text-center'}
                  {...(plan.ctaHref.startsWith('http') ? { target: '_blank', rel: 'noopener' } : {})}
                >
                  {plan.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== WAITLIST ===== */}
      <section id="waitlist" className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-vault-950 to-vault-900" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gold/3 rounded-full blur-[200px]" />
        <div className="relative max-w-xl mx-auto px-5 sm:px-6 py-20 sm:py-28 text-center">
          <div className="animate-fade-in-up">
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-3 sm:mb-4">
              Get early access
            </h2>
            <p className="text-sm sm:text-base text-zinc-500 mb-8 sm:mb-10 leading-relaxed">
              We&apos;re launching soon. Drop your email and be the first to break free from Plex.
            </p>
            <WaitlistForm />
            <p className="text-xs text-zinc-600 mt-5 sm:mt-6">
              Or self-host today:{' '}
              <a
                href="https://github.com/currentlybuffering/jellywrap"
                className="text-zinc-400 underline underline-offset-2 hover:text-gold transition-colors"
                target="_blank"
                rel="noopener"
              >
                github.com/currentlybuffering/jellywrap
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-vault-700/50 py-8 sm:py-10">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-600">
          <div className="font-display font-bold text-base bg-gradient-to-r from-gold to-gold-dim bg-clip-text text-transparent">
            JellyWrap
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            <a href="https://github.com/currentlybuffering/jellywrap" className="hover:text-zinc-400 transition-colors" target="_blank" rel="noopener">GitHub</a>
            <a href="/getting-started" className="hover:text-zinc-400 transition-colors">Getting Started</a>
            <a href="/migrate" className="hover:text-zinc-400 transition-colors">Migrate</a>
            <a href="/#compare" className="hover:text-zinc-400 transition-colors">Compare</a>
            <a href="/#pricing" className="hover:text-zinc-400 transition-colors">Pricing</a>
          </div>
          <div>Open source under MIT. Not affiliated with Plex or Jellyfin.</div>
        </div>
      </footer>
    </main>
  )
}
