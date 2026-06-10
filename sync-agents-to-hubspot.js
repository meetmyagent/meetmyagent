// sync-agents-to-hubspot.js
// Pulls agents from Supabase and creates/updates them as HubSpot contacts
// Run: node sync-agents-to-hubspot.js

const SUPABASE_URL = "https://sfmtwcjwjmpbunvqoazg.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmbXR3Y2p3am1wYnVudnFvYXpnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTk3NTY5OSwiZXhwIjoyMDk1NTUxNjk5fQ.YGKQDQNm38zZwclRlnch8BhtI5_BwzsIdpnFdUtqyVQ"; // Settings > API > service_role key
const HUBSPOT_TOKEN = "pat-na2-8c67eecc-d8a7-453d-8156-25f9216ecf78";

async function fetchAgents() {
  console.log("📦 Fetching agents from Supabase...");
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/agents?select=name,email,city,years_exp,bio&order=name.asc`,
    {
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase error ${res.status}: ${text}`);
  }
  const agents = await res.json();
  console.log(`✅ Found ${agents.length} agents\n`);
  return agents;
}

function buildHubSpotProps(agent) {
  const nameParts = (agent.name || "").trim().split(" ");
  const firstname = nameParts[0] || "";
  const lastname = nameParts.slice(1).join(" ") || "";

  const props = {
    email: agent.email || "",
    firstname,
    lastname,
    city: agent.city || "",
    jobtitle: agent.bio || "",
  };


  return props;
}

async function upsertHubSpotContact(props) {
  // Search for existing contact by email first
  const searchRes = await fetch(
    "https://api.hubapi.com/crm/v3/objects/contacts/search",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HUBSPOT_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        filterGroups: [
          {
            filters: [
              {
                propertyName: "email",
                operator: "EQ",
                value: props.email,
              },
            ],
          },
        ],
        properties: ["email", "firstname", "lastname"],
        limit: 1,
      }),
    }
  );

  if (!searchRes.ok) {
    const text = await searchRes.text();
    throw new Error(`HubSpot search error ${searchRes.status}: ${text}`);
  }

  const searchData = await searchRes.json();
  const existing = searchData.results?.[0];

  if (existing) {
    // Update existing contact
    const updateRes = await fetch(
      `https://api.hubapi.com/crm/v3/objects/contacts/${existing.id}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${HUBSPOT_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ properties: props }),
      }
    );
    if (!updateRes.ok) {
      const text = await updateRes.text();
      throw new Error(`HubSpot update error ${updateRes.status}: ${text}`);
    }
    return { action: "updated", id: existing.id };
  } else {
    // Create new contact
    const createRes = await fetch(
      "https://api.hubapi.com/crm/v3/objects/contacts",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HUBSPOT_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ properties: props }),
      }
    );
    if (!createRes.ok) {
      const text = await createRes.text();
      throw new Error(`HubSpot create error ${createRes.status}: ${text}`);
    }
    const data = await createRes.json();
    return { action: "created", id: data.id };
  }
}

async function main() {
  console.log("🔄 Starting Supabase → HubSpot agent sync\n");

  let agents;
  try {
    agents = await fetchAgents();
  } catch (e) {
    console.error("❌ Failed to fetch agents:", e.message);
    process.exit(1);
  }

  let created = 0;
  let updated = 0;
  let errors = 0;

  for (const agent of agents) {
    const name = agent.name || "(unnamed)";
    const email = agent.email || "";

    if (!email) {
      console.log(`⚠️  Skipped ${name} — no email address`);
      errors++;
      continue;
    }

    try {
      const props = buildHubSpotProps(agent);
      const result = await upsertHubSpotContact(props);
      if (result.action === "created") {
        console.log(`✅ Created  ${name} <${email}> (id: ${result.id})`);
        created++;
      } else {
        console.log(`🔁 Updated  ${name} <${email}> (id: ${result.id})`);
        updated++;
      }
    } catch (e) {
      console.log(`❌ Error    ${name} <${email}>: ${e.message}`);
      errors++;
    }

    // Small delay to stay well under HubSpot rate limits (100 req/10s)
    await new Promise((r) => setTimeout(r, 150));
  }

  console.log("\n─────────────────────────────");
  console.log(`✅ Created:  ${created}`);
  console.log(`🔁 Updated:  ${updated}`);
  console.log(`❌ Errors:   ${errors}`);
  console.log(`📊 Total:    ${agents.length}`);
  console.log("─────────────────────────────");
  console.log("Done!");
}

main();
