/* Edge function: coach-chat — deployed via Supabase MCP */
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { userMessage, userContext } = await req.json();
    const {
      totalKwh = 145,
      totalCost = 23.2,
      totalCo2eKg = 55.8,
      wasteCount = 12,
      diversionRate = 75,
      streakDays = 5,
      sustainabilityScore = 78,
      recentItems = ["Aluminum Soda Can", "Cardboard Delivery Box", "Refrigerator eco-mode"],
    } = userContext || {};

    const apiKey = Deno.env.get("GEMINI_API_KEY");

    if (apiKey) {
      try {
        const prompt = `You are the EcoQuest & GreenPulse AI Sustainability Consultant (Straw Hats).
You are a warm, highly knowledgeable, science-backed environmental and energy consultant.

User's current real-time stats:
- Sustainability Impact Score: ${sustainabilityScore}/100
- Active Daily Streak: ${streakDays} days
- Tracked Energy: ${totalKwh} kWh ($${totalCost.toFixed(2)}, ~${totalCo2eKg.toFixed(1)} kg CO2e)
- Tracked Waste Items: ${wasteCount} items (${diversionRate}% diverted from landfill)
- Recent activity: ${recentItems.join(", ")}

User question/message: "${userMessage || "How can I reduce my energy bills and waste footprint this month?"}"

Respond with:
1. Direct, warm, concise consultant answer (max 3 short paragraphs).
2. 2-3 specific, measurable, high-impact action steps with numbers ($ saved, kWh avoided, kg CO2e reduced).
3. 1 custom "GreenQuest Challenge / Mission" the user can undertake today with suggested points (e.g. "+35 XP").

Keep tone encouraging, crisp, without corporate jargon or robotic boilerplate. Return clean markdown.`;

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 20000);
        const aiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: prompt }),
            signal: controller.signal,
          }
        );
        clearTimeout(timeout);

        if (aiRes.ok) {
          const aiJson = await aiRes.json();
          const reply = aiJson?.candidates?.[0]?.content?.parts?.[0]?.text || "";
          if (reply) {
            return new Response(JSON.stringify({ success: true, source: "gemini-2.0-flash", reply }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
        }
      } catch (aiErr: any) {
        console.warn("Gemini coach call failed, using intelligent coach template:", aiErr?.message);
      }
    }

    const fallbackReply = `### Great question! Here is your personalized action plan:

Looking at your current **${sustainabilityScore}/100 Sustainability Score** and **${streakDays}-day streak**, your energy tracking is solid, but **phantom/standby electrical load** and **packaging waste** are two quick areas where you can unlock immediate wins!

#### 3 High-Impact Steps You Can Take:
1. **Target Vampire Power Draw**: Your entertainment center and PC setup likely consume 15-30W even when turned off. Plugging them into a smart power strip will cut ~20 kWh and save roughly **$3.20 & 7.7 kg CO2e every month**.
2. **Double-Check Food Contamination**: You've diverted **${diversionRate}%** of your waste so far! Remember that paper and cardboard must be free of grease; compost soiled napkins instead of sending them to standard recycling.
3. **Optimize Refrigerator Temperatures**: Set your fridge to 37F (3C) and freezer to 0F (-18C). Every degree cooler than that wastes 5% more energy.

---
**Your Personalized GreenPulse Mission:**
**"The 24-Hour Phantom Power Audit"** (+40 XP)
*Walk around your home tonight and switch off 4 standby appliances before bed.*`;

    return new Response(JSON.stringify({ success: true, source: "coach-fallback", reply: fallbackReply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message || "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
