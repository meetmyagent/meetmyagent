import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export default async function EmbedPage(props: any) {
  const { slug } = await props.params;
  const supabase = await createClient();

  const { data: agent } = await supabase
    .from("agents")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!agent) notFound();

  const { data: reviews } = await supabase
    .from("reviews")
    .select("*")
    .eq("agent_id", agent.id)
    .not("completed_at", "is", null)
    .order("completed_at", { ascending: false })
    .limit(5);

  const completedReviews = reviews || [];
  const avgRating = completedReviews.length > 0
    ? (completedReviews.reduce((sum, r) => sum + r.rating, 0) / completedReviews.length).toFixed(1)
    : null;

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: transparent; padding: 16px; }
          .widget { background: #fff; border: 1px solid rgba(0,0,0,0.08); border-radius: 16px; overflow: hidden; }
          .header { background: #1a1918; padding: 20px 24px; display: flex; align-items: center; gap: 14px; }
          .avatar { width: 44px; height: 44px; border-radius: 50%; background: #FAECE7; color: #993C1D; display: flex; align-items: center; justify-content: center; font-weight: 500; font-size: 14px; flex-shrink: 0; overflow: hidden; }
          .avatar img { width: 100%; height: 100%; object-fit: cover; }
          .agent-name { color: white; font-size: 15px; font-weight: 500; margin-bottom: 2px; }
          .agent-sub { color: rgba(255,255,255,0.4); font-size: 12px; }
          .rating-badge { margin-left: auto; background: rgba(216,90,48,0.2); border: 1px solid rgba(216,90,48,0.3); border-radius: 20px; padding: 4px 12px; color: #f4a07a; font-size: 12px; font-weight: 500; white-space: nowrap; }
          .reviews { padding: 16px 24px; display: flex; flex-direction: column; gap: 16px; }
          .review { border-bottom: 1px solid rgba(0,0,0,0.06); padding-bottom: 16px; }
          .review:last-child { border: none; padding-bottom: 0; }
          .stars { color: #EF9F27; font-size: 13px; margin-bottom: 6px; }
          .review-text { font-size: 13px; color: #6b6a65; line-height: 1.5; margin-bottom: 6px; }
          .review-meta { font-size: 11px; color: #9f9e99; display: flex; align-items: center; gap: 6px; }
          .geo-badge { background: #EAF3DE; color: #3B6D11; padding: 2px 6px; border-radius: 6px; font-size: 10px; font-weight: 500; }
          .footer { padding: 12px 24px; background: #f7f5f0; border-top: 1px solid rgba(0,0,0,0.06); display: flex; align-items: center; justify-content: space-between; }
          .footer-text { font-size: 11px; color: #9f9e99; }
          .footer-link { font-size: 11px; color: #D85A30; text-decoration: none; font-weight: 500; }
          .no-reviews { padding: 32px 24px; text-align: center; color: #9f9e99; font-size: 13px; }
        `}</style>
      </head>
      <body>
        <div className="widget">
          <div className="header">
            <div className="avatar">
              {agent.avatar_url
                ? <img src={agent.avatar_url} alt={agent.name} />
                : agent.name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2)
              }
            </div>
            <div>
              <div className="agent-name">{agent.name}</div>
              <div className="agent-sub">{agent.years_exp} yrs · {agent.city}</div>
            </div>
            {avgRating && (
              <div className="rating-badge">★ {avgRating} · {completedReviews.length} review{completedReviews.length !== 1 ? "s" : ""}</div>
            )}
          </div>

          {completedReviews.length === 0 ? (
            <div className="no-reviews">No reviews yet</div>
          ) : (
            <div className="reviews">
              {completedReviews.map((r: any) => (
                <div key={r.id} className="review">
                  <div className="stars">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</div>
                  {r.body && <div className="review-text">{r.body}</div>}
                  <div className="review-meta">
                    <span>{r.client_name}</span>
                    {r.geo_label && <span className="geo-badge">verified location</span>}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="footer">
            <span className="footer-text">powered by</span>
            <a href="https://www.meetmyagent.app" target="_blank" className="footer-link">meetmyagent.app</a>
          </div>
        </div>
      </body>
    </html>
  );
}