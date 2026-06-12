import { notFound } from "next/navigation";

async function getNeighborhood(slug: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/neighborhoods?slug=eq.${slug}&select=*`,
    {
      headers: {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
      },
      cache: "no-store",
    }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data[0] || null;
}

async function getAgents(neighborhoodName: string) {
  const encoded = encodeURIComponent(`{"${neighborhoodName}"}`);
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/agents?area_tags=cs.${encoded}&name=not.is.null&select=*&limit=6`,
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

export default async function NeighborhoodPage(props: any) {
  const { slug } = await props.params;
  const neighborhood = await getNeighborhood(slug);
  if (!neighborhood) notFound();

  const agents = await getAgents(neighborhood.name);

  return (
    <div className="min-h-screen bg-[#f7f5f0]">
      <nav className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
        <a href="/" className="text-lg font-medium text-[#1a1918]">meet<span className="text-[#D85A30]">my</span>agent</a>
        <a href="/neighborhoods" className="text-sm text-[#6b6a65] hover:text-[#1a1918]">← all neighborhoods</a>
      </nav>

      <div className="max-w-3xl mx-auto px-6 pb-16">
        <div className="bg-[#1a1918] rounded-2xl p-8 mb-6">
          <p className="text-[#D85A30] text-xs font-semibold uppercase tracking-widest mb-3">{neighborhood.city}, {neighborhood.state}</p>
          <h1 className="text-3xl font-medium text-white mb-3">{neighborhood.name}</h1>
          <p className="text-white/50 text-sm leading-relaxed">{neighborhood.vibe}</p>
          {neighborhood.price_range && (
            <div className="mt-4 inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5">
              <span className="text-white/60 text-xs">typical price range</span>
              <span className="text-white text-xs font-medium">{neighborhood.price_range}</span>
            </div>
          )}
        </div>

        <div className="bg-white border border-black/[0.08] rounded-2xl p-6 mb-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-[#9f9e99] mb-4">about this neighborhood</h2>
          <p className="text-sm text-[#6b6a65] leading-relaxed">{neighborhood.description}</p>
        </div>

        {neighborhood.known_for?.length > 0 && (
          <div className="bg-white border border-black/[0.08] rounded-2xl p-6 mb-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-[#9f9e99] mb-4">known for</h2>
            <div className="flex flex-wrap gap-2">
              {neighborhood.known_for.map((tag: string) => (
                <span key={tag} className="px-3 py-1.5 rounded-full text-sm bg-[#FAECE7] border border-[#D85A30] text-[#993C1D] font-medium">{tag}</span>
              ))}
            </div>
          </div>
        )}

        {neighborhood.popular_with?.length > 0 && (
          <div className="bg-white border border-black/[0.08] rounded-2xl p-6 mb-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-[#9f9e99] mb-4">popular with</h2>
            <div className="flex flex-wrap gap-2">
              {neighborhood.popular_with.map((tag: string) => (
                <span key={tag} className="px-3 py-1.5 rounded-full text-sm bg-[#E6F1FB] border border-[#378ADD] text-[#185FA5] font-medium">{tag}</span>
              ))}
            </div>
          </div>
        )}

        {neighborhood.agent_insight && (
          <div className="bg-white border border-black/[0.08] rounded-2xl p-6 mb-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-[#9f9e99] mb-4">agent insight</h2>
            <p className="text-sm text-[#6b6a65] leading-relaxed italic">"{neighborhood.agent_insight}"</p>
          </div>
        )}

        {agents && agents.length > 0 && (
          <div className="bg-white border border-black/[0.08] rounded-2xl p-6 mb-6">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-[#9f9e99] mb-5">agents who know {neighborhood.name}</h2>
            <div className="flex flex-col gap-4">
              {agents.map((agent: any) => (
                <div key={agent.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-[#FAECE7] text-[#993C1D] flex items-center justify-center text-sm font-medium flex-shrink-0">
                      {agent.avatar_url
                        ? <img src={agent.avatar_url} alt={agent.name} className="w-full h-full object-cover" />
                        : agent.name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2)
                      }
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#1a1918]">{agent.name}</p>
                      <p className="text-xs text-[#9f9e99]">{agent.years_exp} yrs · {agent.city}</p>
                    </div>
                  </div>
                  <a href={"/agents/" + agent.slug} className="text-xs font-medium text-[#D85A30] hover:text-[#993C1D]">view profile →</a>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-[#D85A30] rounded-2xl p-6 text-center">
          <h2 className="text-white font-medium text-lg mb-2">Looking to buy in {neighborhood.name}?</h2>
          <p className="text-white/70 text-sm mb-5">Take the 2-min quiz and get matched with an agent who knows this area.</p>
          <a href="/find" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-[#993C1D] font-medium text-sm hover:bg-white/90">
            find my agent match →
          </a>
        </div>
      </div>
    </div>
  );
}
