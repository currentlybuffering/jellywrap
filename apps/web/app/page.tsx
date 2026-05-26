import WaitlistForm from './waitlist-form'

const features = [
  ['One-Click Migration', 'Move from Plex to Jellyfin — watch history, ratings, favorites, all matched by TMDB/TVDB/IMDB IDs'],
  ['Better Browser UX', 'Poster walls, continue watching, instant search, detail views with real playback'],
  ['Smart Library Tools', 'Duplicate detection, gap finding, subtitle hunting. Plex doesn\'t do any of this.'],
  ['Watch Together', 'Sync playback with friends. No extra charge, no Plex Pass required.'],
  ['Remote Access Relay', 'WireGuard tunnel to your home server. No port forwarding, no pain.'],
  ['Family Controls', 'Per-user content restrictions and managed profiles. Always included.'],
  ['Hardware Transcoding', 'GPU transcoding, free. Not locked behind a $750 paywall.'],
  ['Live TV & DVR', 'Watch and record live over-the-air broadcasts.'],
  ['Mobile Apps', 'iOS and Android apps with offline downloads.'],
  ['Docker Deploy', 'One command to self-host. Full Docker Compose stack included.'],
  ['Open Source (MIT)', 'Audit it, fork it, ship it. No vendor lock-in, ever.'],
  ['Your Data, Period', 'No tracking, no analytics, no phone home. Your server, your rules.'],
] as const

const comparisons = [
  ['Media streaming', 'Free', 'Free'],
  ['Hardware transcoding', '$750 lifetime', 'Free'],
  ['Live TV & DVR', '$750 lifetime', 'Free'],
  ['Offline downloads', '$750 lifetime', 'Free'],
  ['Mobile apps', '$4.99/mo or $750', 'Free'],
  ['Remote access', 'Plex Relay (paid)', 'JellyWrap Relay (free)'],
  ['Skip intros & credits', '$750 lifetime', 'Free'],
  ['Plex migration tool', 'Doesn\'t exist', 'Built-in'],
  ['Duplicate detection', 'No', 'Yes'],
  ['Watch together', 'No', 'Yes (coming)'],
  ['Source code', 'Closed source', 'Open source (MIT)'],
  ['Data privacy', 'Tracks your history', 'You own everything'],
] as const

const steps = [
  ['1', 'Connect Plex', 'Enter your Plex URL and token'],
  ['2', 'Connect Jellyfin', 'Point to your Jellyfin server'],
  ['3', 'Pick data', 'Watch history, ratings, favorites'],
  ['4', 'Migrate', 'Watch it transfer in real-time'],
  ['5', 'Done', 'Everything intact. Zero data loss.'],
] as const

const plans = [
  {
    name: 'Self-Hosted',
    price: '$0',
    period: 'forever',
    desc: 'Run it on your own hardware. Every feature, no limits.',
    features: ['Full migration tool', 'Media browser', 'WireGuard relay', 'Smart library tools', 'Docker Compose deploy', 'Community support'],
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

const stats = [
  ['100%', 'Open Source'],
  ['$0', 'Self-Hosted'],
  ['3-tier', 'Matching'],
  ['0', 'Data Collected'],
] as const

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden">
      {/* ===== HERO ===== */}
      <section className="relative min-h-[90vh] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-vault-950 via-vault-900 to-vault-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gold/8 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-gold/5 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.04]" />

        <div className="absolute top-20 right-[10%] w-72 h-72 bg-gold/5 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-20 left-[5%] w-96 h-96 bg-gold/3 rounded-full blur-[150px] animate-pulse-glow delay-1000" />
        <div className="absolute top-[40%] left-[50%] w-48 h-48 bg-gold/4 rounded-full blur-[80px] animate-float-slow" />

        <div className="relative max-w-6xl mx-auto px-6 py-32">
          <div className="animate-fade-in-up">
            <div className="flex items-center gap-3 mb-8">
              <span className="px-3 py-1.5 text-xs font-mono uppercase tracking-widest bg-red-500/10 text-red-400 border border-red-500/20 rounded-full animate-pulse-glow">
                Plex Lifetime &rarr; $750 on July 1
              </span>
              <span className="px-3 py-1.5 text-xs font-mono uppercase tracking-widest bg-gold/10 text-gold border border-gold/20 rounded-full">
                Open Source
              </span>
            </div>
          </div>

          <h1 className="font-display text-5xl sm:text-7xl md:text-8xl font-black tracking-tight leading-[0.95] mb-8 animate-fade-in-up delay-200">
            Your media.<br />
            Your server.<br />
            <span className="bg-gradient-to-r from-gold via-gold-bright to-gold bg-clip-text text-transparent">
              Free forever.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mb-4 leading-relaxed animate-fade-in-up delay-300">
            JellyWrap wraps Jellyfin with a migration tool, better UX, and smart library
            features. Self-host for free, or let us run the server. Your media stays yours.
          </p>
          <p className="text-sm text-zinc-500 max-w-xl mb-10 animate-fade-in-up delay-400">
            Built on <a href="https://jellyfin.org" className="text-zinc-400 underline underline-offset-2 hover:text-gold transition-colors">Jellyfin</a> &mdash;
            the open-source media server. JellyWrap adds the polish Plex charges $750 for.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-16 animate-fade-in-up delay-500">
            <a href="#waitlist" className="btn-gold text-center text-lg px-8 py-4">
              Get Early Access
            </a>
            <a href="https://github.com/currentlybuffering/jellywrap" className="btn-outline text-center" target="_blank" rel="noopener">
              View on GitHub &rarr;
            </a>
          </div>

          <div className="glass rounded-xl p-5 max-w-xl font-mono text-sm animate-fade-in-up delay-700">
            <div className="text-zinc-500 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Self-host in 30 seconds
            </div>
            <div className="text-zinc-300 space-y-1">
              <div><span className="text-gold">$</span> git clone https://github.com/currentlybuffering/jellywrap.git</div>
              <div><span className="text-gold">$</span> cd jellywrap <span className="text-zinc-600">&amp;&amp;</span> docker compose up --build</div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== STATS BAR ===== */}
      <section className="relative border-y border-vault-700/50">
        <div className="absolute inset-0 bg-gradient-to-r from-vault-950 via-vault-900 to-vault-950" />
        <div className="relative max-w-6xl mx-auto px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map(([val, label], i) => (
              <div key={label} className={`animate-fade-in-up delay-${(i + 1) * 100}`}>
                <div className="text-3xl md:text-4xl font-black font-mono bg-gradient-to-b from-gold to-gold-dim bg-clip-text text-transparent">
                  {val}
                </div>
                <div className="text-sm text-zinc-500 mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="font-display text-4xl md:text-5xl font-black mb-4">
            What Plex paywalls &mdash; <span className="bg-gradient-to-r from-gold to-gold-bright bg-clip-text text-transparent">free and open</span>
          </h2>
          <p className="text-zinc-500 max-w-xl mx-auto leading-relaxed">
            Jellyfin with a polished layer on top: migration from Plex,
            smarter library tools, social features, and a browser UX that
            doesn&apos;t feel like it was designed in 2015.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(([title, desc], i) => (
            <div
              key={title}
              className={`card-glow animate-fade-in-up delay-${Math.min(i * 100, 700)}`}
            >
              <div className="flex items-center gap-2.5 mb-3">
                <span className="w-2 h-2 rounded-full bg-gold shadow-[0_0_8px_rgba(232,197,71,0.4)]" />
                <h3 className="font-semibold text-sm">{title}</h3>
              </div>
              <p className="text-sm text-zinc-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== COMPARISON ===== */}
      <section id="compare" className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-vault-950 via-vault-900/50 to-vault-950" />
        <div className="relative max-w-4xl mx-auto px-6 py-24">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="font-display text-4xl md:text-5xl font-black mb-4">
              Side-by-side
            </h2>
            <p className="text-zinc-500">Every feature. No paywalls. No compromises.</p>
          </div>
          <div className="glass rounded-2xl overflow-hidden animate-scale-in">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left py-4 px-6 text-zinc-500 font-medium">Feature</th>
                  <th className="text-center py-4 px-6 text-zinc-500 font-medium">Plex</th>
                  <th className="text-center py-4 px-6 font-medium">
                    <span className="bg-gradient-to-r from-gold to-gold-bright bg-clip-text text-transparent">JellyWrap</span>
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
        </div>
      </section>

      {/* ===== MIGRATION ===== */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="font-display text-4xl md:text-5xl font-black mb-4">
            Leaving Plex? <span className="bg-gradient-to-r from-gold to-gold-bright bg-clip-text text-transparent">We make it easy.</span>
          </h2>
          <p className="text-zinc-500 max-w-xl mx-auto leading-relaxed">
            3-tier matching by TMDB/TVDB/IMDB IDs, title+year, or fuzzy title.
            Watch history, ratings, playlists &mdash; everything transfers.
          </p>
        </div>
        <div className="grid sm:grid-cols-5 gap-6 max-w-3xl mx-auto">
          {steps.map(([num, title, desc], i) => (
            <div
              key={num}
              className={`text-center animate-fade-in-up delay-${(i + 1) * 100}`}
            >
              <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(232,197,71,0.1)]">
                <span className="text-gold font-bold font-mono text-lg">{num}</span>
              </div>
              <div className="font-semibold text-sm mb-1.5">{title}</div>
              <div className="text-xs text-zinc-500 leading-relaxed">{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section id="pricing" className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-vault-950 via-vault-900/30 to-vault-950" />
        <div className="relative max-w-6xl mx-auto px-6 py-24">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="font-display text-4xl md:text-5xl font-black mb-4">
              Self-hosted or cloud &mdash; <span className="bg-gradient-to-r from-gold to-gold-bright bg-clip-text text-transparent">you pick</span>
            </h2>
            <p className="text-zinc-500 max-w-xl mx-auto leading-relaxed">
              Self-hosted gets every feature for free. Cloud is for people who
              don&apos;t want to run their own server. No feature paywalls either way.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
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
                    <span className="text-4xl font-black font-mono bg-gradient-to-b from-gold to-gold-dim bg-clip-text text-transparent">
                      {plan.price}
                    </span>
                    <span className="text-zinc-500 text-sm">{plan.period}</span>
                  </div>
                  <p className="text-sm text-zinc-500 mt-3 leading-relaxed">{plan.desc}</p>
                </div>
                <ul className="space-y-2.5 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-zinc-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 shrink-0 shadow-[0_0_6px_rgba(232,197,71,0.4)]" />
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
        <div className="relative max-w-xl mx-auto px-6 py-28 text-center">
          <div className="animate-fade-in-up">
            <h2 className="font-display text-4xl md:text-5xl font-black mb-4">
              Get early access
            </h2>
            <p className="text-zinc-500 mb-10 leading-relaxed">
              We&apos;re launching soon. Drop your email and be the first to break free from Plex.
            </p>
            <WaitlistForm />
            <p className="text-xs text-zinc-600 mt-6">
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
      <footer className="border-t border-vault-700/50 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-600">
          <div className="font-display font-bold text-base bg-gradient-to-r from-gold to-gold-dim bg-clip-text text-transparent">
            JellyWrap
          </div>
          <div className="flex items-center gap-6">
            <a href="https://github.com/currentlybuffering/jellywrap" className="hover:text-zinc-400 transition-colors" target="_blank" rel="noopener">GitHub</a>
            <a href="https://jellywrap.net/migrate" className="hover:text-zinc-400 transition-colors">Migrate</a>
            <a href="https://jellywrap.net/media" className="hover:text-zinc-400 transition-colors">Media</a>
            <a href="https://jellywrap.net/library" className="hover:text-zinc-400 transition-colors">Smart Library</a>
            <a href="https://jellywrap.net/#pricing" className="hover:text-zinc-400 transition-colors">Pricing</a>
          </div>
          <div>Open source under MIT. Not affiliated with Plex or Jellyfin.</div>
        </div>
      </footer>
    </main>
  )
}
