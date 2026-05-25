import WaitlistForm from './waitlist-form'

const features = [
  ['Hardware Transcoding', 'Use your GPU to transcode in real-time. No paywall.'],
  ['Live TV & DVR', 'Watch and record live over-the-air broadcasts.'],
  ['Offline Downloads', 'Sync media to your phone for offline playback.'],
  ['Skip Intros', 'Auto-skip TV show intros and credits.'],
  ['Multi-User Access', 'Family accounts with parental controls. Always included.'],
  ['Remote Access', 'Watch your library from anywhere. No port forwarding needed.'],
  ['Mobile Apps', 'iOS and Android apps, no Plex Pass required.'],
  ['Metadata & Art', 'Rich posters, descriptions, and ratings from TMDB.'],
  ['Docker Deploy', 'One command to deploy. Docker Compose included.'],
] as const

const comparisons = [
  ['Media streaming', 'Free', 'Free'],
  ['Hardware transcoding', '$750 lifetime', 'Free'],
  ['Live TV & DVR', '$750 lifetime', 'Free'],
  ['Offline downloads', '$750 lifetime', 'Free'],
  ['Mobile apps', '$4.99/mo or $750', 'Free'],
  ['Remote access', 'Plex Relay (paid)', 'Vault Relay (free tier)'],
  ['Skip intros & credits', '$750 lifetime', 'Free'],
  ['Multi-user & parental controls', 'Plex Home (free)', 'Free'],
  ['Metadata & artwork', 'Free (limited)', 'Free (TMDB + TVDB)'],
  ['Podcast support', 'Built-in', 'Coming soon'],
  ['Source code', 'Closed', 'Open source (MIT)'],
  ['Data privacy', 'Tracks watch history', 'You own everything'],
] as const

const steps = [
  ['1', 'Connect Plex', 'Enter your Plex URL and token'],
  ['2', 'Connect Jellyfin', 'Point to your JellyWrap server'],
  ['3', 'Pick data', 'Choose what to migrate'],
  ['4', 'Migrate', 'Watch it transfer in real-time'],
  ['5', 'Done', 'Your library, history, and ratings — intact'],
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
              Plex Lifetime → $750 on July 1
            </span>
          </div>
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.05] mb-6">
            Your media.<br />
            Your server.<br />
            <span className="text-gold">Free forever.</span>
          </h1>
          <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mb-10 leading-relaxed">
            JellyWrap is the open-source alternative to Plex. Self-hosted, private,
            and actually yours. No subscription. No price hikes. No lock-in.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <a href="#waitlist" className="btn-gold text-center">
              Get Early Access
            </a>
            <a href="#compare" className="btn-outline text-center">
              See the Comparison
            </a>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 max-w-xl">
            <div className="bg-vault-800 border border-vault-600 rounded-xl p-5">
              <div className="text-xs uppercase tracking-widest text-zinc-500 mb-2">Plex Lifetime</div>
              <div className="text-3xl font-black font-mono text-red-400">$750</div>
              <div className="text-xs text-zinc-500 mt-1">Was $120 in 2024</div>
            </div>
            <div className="bg-vault-800 border border-gold/30 rounded-xl p-5">
              <div className="text-xs uppercase tracking-widest text-zinc-500 mb-2">JellyWrap</div>
              <div className="text-3xl font-black font-mono text-gold">$0</div>
              <div className="text-xs text-zinc-500 mt-1">Free forever. Open source.</div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="font-display text-3xl font-bold mb-12 text-center">
          Everything Plex paywalls — <span className="text-gold">free and open</span>
        </h2>
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
          Our migration tool imports your watch history, ratings, playlists, and library structure from Plex into Jellyfin. One click. No data loss.
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

      <section id="waitlist" className="max-w-xl mx-auto px-6 py-20 text-center">
        <h2 className="font-display text-3xl font-bold mb-4">
          Get early access
        </h2>
        <p className="text-zinc-500 mb-8">
          We&apos;re launching soon. Drop your email and be the first to migrate.
        </p>
        <WaitlistForm />
      </section>

      <footer className="border-t border-vault-700 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-600">
          <div className="font-display font-bold text-sm text-zinc-400">
		JellyWrap
          </div>
          <div>Open source under MIT. Not affiliated with Plex or Jellyfin.</div>
        </div>
      </footer>
    </main>
  )
}
