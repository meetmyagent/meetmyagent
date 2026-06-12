import Link from "next/link";

const CITY_META: Record<string, { state: string; description: string; image: string }> = {
  "Austin": { state: "TX", description: "Hill Country charm meets tech boom", image: "🤠" },
  "Chicago": { state: "IL", description: "World-class neighborhoods, lake views", image: "🌆" },
  "Nashville": { state: "TN", description: "Music city with rapid growth", image: "🎸" },
  "Denver": { state: "CO", description: "Mountain views, outdoor lifestyle", image: "🏔️" },
  "Atlanta": { state: "GA", description: "The South's most dynamic city", image: "🍑" },
  "Seattle": { state: "WA", description: "Tech hub with natural beauty", image: "☕" },
  "Portland": { state: "OR", description: "Keep it weird, keep it local", image: "🌲" },
  "Miami": { state: "FL", description: "Sun, culture, and global energy", image: "🌴" },
  "Charlotte": { state: "NC", description: "Banking capital, rapid growth", image: "🏙️" },
  "Boston": { state: "MA", description: "History, innovation, world-class living", image: "🦞" },
  "Phoenix": { state: "AZ", description: "Sun Belt growth, desert beauty", image: "🌵" },
  "Las Vegas": { state: "NV", description: "More than the Strip — real communities", image: "🎰" },
  "San Diego": { state: "CA", description: "Perfect weather, ocean lifestyle", image: "🌊" },
  "Raleigh": { state: "NC", description: "Research Triangle, fast-growing", image: "🔬" },
  "Tampa": { state: "FL", description: "Gulf Coast living, booming market", image: "⛵" },
};

async function getNeighborhoods() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/neighborhoods?select=city,state,name,slug,vibe,price_range&order=city,name`,
    {
      headers: {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
      },
      cache: "no-store",
    }
  );
  if (!res.ok) return [];
  return res.json();
}

export default async function NeighborhoodsPage() {
  const neighborhoods = await getNeighborhoods();

  const byCity: Record<string, any[]> = {};
  neighborhoods?.forEach((n: any) => {
    if (!byCity[n.city]) byCity[n.city] = [];
    byCity[n.city].push(n);
  });

  const cities = Object.keys(byCity).sort();

  return (
    <div className="min-h-screen bg-[#f7f5f0]">
      <nav className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
        <a href="/" className="text-lg font-medium text-[#1a1918]">meet<span className="text-[#D85A30]">my</span>agent</a>
        <div className="flex items-center gap-4"><a href="/consumer" className="text-sm text-[#6b6a65] hover:text-[#1a1918]">my matches</a><a href="/find" className="text-sm text-[#D85A30] font-medium">find an agent →</a></div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 pb-16">
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#D85A30] mb-3">neighborhood guides</p>
          <h1 className="text-4xl font-medium text-[#1a1918] mb-4">Find your perfect neighborhood</h1>
          <p className="text-[#6b6a65] text-lg leading-relaxed max-w-2xl">Real insights from local agents who know these neighborhoods cold. Select a city to explore.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-16">
          {cities.map(city => {
            const meta = CITY_META[city];
            const count = byCity[city].length;
            return (
              <a key={city} href={"#" + city.toLowerCase().replace(/\s/g, "-")}
                className="bg-white border border-black/[0.08] rounded-2xl p-5 hover:border-[#D85A30]/40 hover:shadow-sm transition-all group">
                <div className="text-3xl mb-3">{meta?.image || "🏙️"}</div>
                <h3 className="text-base font-medium text-[#1a1918] group-hover:text-[#D85A30] transition-colors">{city}</h3>
                <p className="text-xs text-[#9f9e99] mt-0.5">{meta?.state} · {count} neighborhood{count !== 1 ? "s" : ""}</p>
                {meta && <p className="text-xs text-[#6b6a65] mt-2 leading-relaxed">{meta.description}</p>}
              </a>
            );
          })}
        </div>

        {cities.map(city => (
          <div key={city} id={city.toLowerCase().replace(/\s/g, "-")} className="mb-14 scroll-mt-8">
            <div className="flex items-baseline gap-3 mb-5 pb-3 border-b border-black/[0.08]">
              <span className="text-2xl">{CITY_META[city]?.image || "🏙️"}</span>
              <h2 className="text-2xl font-medium text-[#1a1918]">{city}</h2>
              <span className="text-sm text-[#9f9e99]">{CITY_META[city]?.state}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {byCity[city].map((n: any) => (
                <Link key={n.slug} href={"/neighborhoods/" + n.slug}
                  className="bg-white border border-black/[0.08] rounded-2xl p-5 hover:border-[#D85A30]/40 hover:shadow-sm transition-all group">
                  <h3 className="text-base font-medium text-[#1a1918] mb-1 group-hover:text-[#D85A30] transition-colors">{n.name}</h3>
                  <p className="text-xs text-[#6b6a65] leading-relaxed mb-3">{n.vibe}</p>
                  {n.price_range && <p className="text-xs font-medium text-[#D85A30]">{n.price_range}</p>}
                </Link>
              ))}
            </div>
          </div>
        ))}

        <div className="bg-[#1a1918] rounded-2xl p-8 text-center">
          <h2 className="text-white font-medium text-xl mb-2">Ready to find your agent?</h2>
          <p className="text-white/50 text-sm mb-6">Take the 2-min quiz and get matched with an agent who knows your neighborhood.</p>
          <a href="/find" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#D85A30] text-white font-medium text-sm hover:bg-[#993C1D]">
            find my agent match →
          </a>
        </div>
      </div>
      <footer className="max-w-5xl mx-auto px-6 py-8 text-center">
        <p className="text-xs text-[#9f9e99]">built in Austin, TX · questions? <a href="mailto:hello@meetmyagent.app" className="underline hover:text-[#6b6a65] transition-colors">hello@meetmyagent.app</a></p>
      </footer>
    </div>
  );
}
