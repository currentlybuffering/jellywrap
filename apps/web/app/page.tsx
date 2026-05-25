import WaitlistForm from './waitlist-form'

const features = [
  ['One-Click Migration', 'Move from Plex to Jellyfin with watch history, ratings, and favorites intact.'],
  ['Better Browser UX', 'Poster walls, continue watching, search, detail views with real playback.'],
  ['Smart Library Tools', 'Duplicate detection, gap finding, subtitle hunting. Plex doesn\'t do this.'],
  ['Watch Together', 'Sync playback with friends and family. No extra charge.'],
  ['Remote Access Relay', 'WireGuard tunnel to your home server. No port forwarding needed.'],
  ['Family Controls', 'Per-user content restrictions and managed profiles. Always included.'],
  ['Hardware Transcoding', 'GPU transcoding, free. Not locked behind a $750 paywall.'],
  ['Live TV & DVR', 'Watch and record live over-the-air broadcasts.'],
  ['Mobile Apps', 'iOS and Android apps with offline downloads.'],
  ['Docker Deploy', 'One command to self-host. Docker Compose included.'],
  ['Open Source', 'MIT license. Audit it, fork it, contribute to it.'],
  ['Your Data', 'No tracking, no analytics, no phone home. Your server, your rules.'],
] as const

const comparisons = [
  ['Media streaming', 'Free', 'Free'],
  ['Hardware transcoding', '$750 lifetime', 'Free'],
  ['Live TV & DVR', '$750 lifetime', 'Free'],
  ['Offline downloads', '$750 lifetime', 'Free'],
  ['Mobile apps', '$4.99/mo or $750', 'Free'],
  ['Remote access', 'Plex Relay (paid)', 'JellyWrap Relay (free)'],
  ['Skip intros & credits', '$750 lifetime', 'Free'],
  ['Multi-user & parental controls', 'Plex Home (free)', 'Free'],
  ['Plex migration tool', 'Doesn\'t exist', 'Built-in'],
  ['Duplicate detection', 'No', 'Yes'],
  ['Gap finding', 'No', 'Yes'],
  ['Watch together', 'No', 'Yes (coming)'],
  ['Source code', 'Closed', 'Open source (MIT)'],
  ['Data privacy', 'Tracks watch history', 'You own everything'],
] as const

const steps = [
  ['1', 'Connect Plex', 'Enter your Plex URL and token'],
  ['2', 'Connect Jellyfin', 'Point to your Jellyfin server'],
  ['3', 'Pick data', 'Choose what to migrate'],
  ['4', 'Migrate', 'Watch it transfer in real-time'],
  ['5', 'Done', 'Library, history, ratings — intact'],
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

export default function Home() {
  return (
    <main className="min-h-screen">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gold/10 via-vault-950 to-vault-950" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]" />
        <div className="relative max-w-6xl mx-auto px-6 pt-24 pb-20">
          <div className="flex items-center gap-2 mb-6">
            <span className="px-3 py-1 text-xs font-mono uppercase tracking-widest bg-red-500/10 text-red-400 border border-red-500/20 rounded-full">
              Plex Lifetime &rarr; $750 on July 1
            </span>
          </div>
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.05] mb-6">
            Plex, but free.<br />
            Jellyfin, but <span className="text-gold">easy.</span>
          </h1>
          <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mb-4 leading-relaxed">
            JellyWrap wraps Jellyfin with a migration tool, better UX, and smart library
            features. Self-host for free, or let us run the server. Your media stays yours.
          </p>
          <p className="text-sm text-zinc-500 max-w-xl mb-10">
            Built on <a href="https://jellyfin.org" className="text-zinc-400 underline underline-offset-2 hover:text-gold transition">Jellyfin</a> — the
            open-source media server. JellyWrap adds the polish Plex charges $750 for.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <a href="#waitlist" className="btn-gold text-center">
              Get Early Access
            </a>
            <a href="https://github.com/currentlybuffering/jellywrap" className="btn-outline text-center" target="_blank" rel="noopener">
              View on GitHub
            </a>
          </div>

          <div className="bg-vault-900/80 border border-vault-700 rounded-xl p-6 max-w-xl font-mono text-sm">
            <div className="text-zinc-500 mb-2"># Self-host in one command</div>
            <div className="text-zinc-300">
              <span className="text-gold">$</span> git clone https://github.com/currentlybuffering/jellywrap.git<br />
              <span className="text-gold">$</span> cd jellywrap && docker compose up --build
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="font-display text-3xl font-bold mb-4 text-center">
          What Plex paywalls &mdash; <span className="text-gold">free and open</span>
        </h2>
        <p className="text-zinc-500 text-center mb-12 max-w-xl mx-auto">
          JellyWrap is Jellyfin with a polished layer on top: migration from Plex,
          smarter library tools, social features, and a browser UX that doesn&apos;t
          feel like it was designed in 2015.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(([title, desc]) => (
            <div key={title} className="card group">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-gold" />
                <h3 className="font-semibold text-sm">{title}</h3>
              </div>
              <p className="text-sm text-zinc-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="compare" className="max-w-4xl mx-auto px-6 py-20">
        <h2 className="font-display text-3xl font-bold mb-12 text-center">
          Side-by-side
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-vault-600">
                <th className="text-left py-3 px-4 text-zinc-500 font-medium">Feature</th>
                <th className="text-center py-3 px-4 text-zinc-500 font-medium">Plex</th>
                <th className="text-center py-3 px-4 font-medium text-gold">JellyWrap</th>
              </tr>
            </thead>
            <tbody>
              {comparisons.map(([feat, plex, sv]) => (
                <tr key={feat} className="border-b border-vault-700/50">
                  <td className="py-3 px-4 text-zinc-300">{feat}</td>
                  <td className="py-3 px-4 text-center text-zinc-500">{plex}</td>
                  <td className="py-3 px-4 text-center text-gold font-semibold">{sv}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="font-display text-3xl font-bold mb-4 text-center">
          Leaving Plex? <span className="text-gold">We make it easy.</span>
        </h2>
        <p className="text-zinc-500 text-center mb-12 max-w-xl mx-auto">
          Our migration tool imports your watch history, ratings, playlists, and library
          structure from Plex into Jellyfin. 3-tier matching by TMDB/TVDB/IMDB IDs, title+year,
          or fuzzy title. One click. No data loss.
        </p>
        <div className="grid sm:grid-cols-5 gap-4 max-w-3xl mx-auto">
          {steps.map(([num, title, desc]) => (
            <div key={num} className="text-center">
              <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto mb-3">
                <span className="text-gold font-bold font-mono">{num}</span>
              </div>
              <div className="font-semibold text-sm mb-1">{title}</div>
              <div className="text-xs text-zinc-500">{desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="font-display text-3xl font-bold mb-4 text-center">
          Self-hosted or cloud &mdash; <span className="text-gold">you pick</span>
        </h2>
        <p className="text-zinc-500 text-center mb-12 max-w-xl mx-auto">
          Self-hosted gets every feature for free. Cloud is for people who
          don&apos;t want to run their own server. No feature paywalls either way.
        </p>
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`card flex flex-col ${plan.highlight ? 'border-gold/40 ring-1 ring-gold/20' : ''}`}
            >
              <div className="mb-4">
                <h3 className="font-semibold text-lg">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-3xl font-black font-mono text-gold">{plan.price}</span>
                  <span className="text-zinc-500 text-sm">{plan.period}</span>
                </div>
                <p className="text-sm text-zinc-500 mt-2">{plan.desc}</p>
              </div>
              <ul className="space-y-2 mb-6 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-zinc-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
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
      </section>

      <section id="waitlist" className="max-w-xl mx-auto px-6 py-20 text-center">
        <h2 className="font-display text-3xl font-bold mb-4">
          Get early access
        </h2>
        <p className="text-zinc-500 mb-8">
          We&apos;re launching soon. Drop your email and be the first to migrate.
        </p>
        <WaitlistForm />
        <p className="text-xs text-zinc-600 mt-4">
          Self-host today: <a href="https://github.com/currentlybuffering/jellywrap" className="text-zinc-400 underline underline-offset-2 hover:text-gold transition">github.com/currentlybuffering/jellywrap</a>
        </p>
      </section>

      <footer className="border-t border-vault-700 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-600">
          <div className="font-display font-bold text-sm text-zinc-400">
            JellyWrap
          </div>
          <div className="flex items-center gap-4">
            <a href="https://github.com/currentlybuffering/jellywrap" className="hover:text-zinc-400 transition" target="_blank" rel="noopener">GitHub</a>
            <a href="https://jellywrap.net/migrate" className="hover:text-zinc-400 transition">Migrate</a>
            <a href="https://jellywrap.net/media" className="hover:text-zinc-400 transition">Media</a>
          </div>
          <div>Open source under MIT. Not affiliated with Plex or Jellyfin.</div>
        </div>
      </footer>
    </main>
  )
}
