/* Edge function: ai-letter — deployed via Supabase MCP */
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
    const { userName = "Eco Champion", streakDays = 7, lastAction = "separated waste", avoidedCo2e = 15.4 } = await req.json();
    const apiKey = Deno.env.get("GEMINI_API_KEY");

    if (apiKey) {
      try {
        const prompt = `Write a heartfelt, personal, beautifully crafted eco appreciation letter for a user named "${userName}".
They have achieved a ${streakDays}-day streak on GreenPulse!
Their latest sustainable action was: "${lastAction}".
Estimated cumulative carbon prevented: ${avoidedCo2e} kg CO2e.

Tone: Warm, encouraging, literary, inspiring, grounded in quiet intentionality (like Annie Dillard or Wendell Berry).
Length: 3 short paragraphs.
Sign off: "With gratitude for your mindful footprint, - GreenPulse & The Earth"`;

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
          const letter = aiJson?.candidates?.[0]?.content?.parts?.[0]?.text || "";
          if (letter) {
            return new Response(JSON.stringify({ success: true, source: "gemini-2.0-flash", letter }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
        }
      } catch (err: any) {
        console.warn("Gemini letter fallback:", err?.message);
      }
    }

    const fallbackLetter = `Dear ${userName},

Every thoughtful choice ripples outward. Showing up for ${streakDays} consecutive days is not merely an achievement on a screen; it is a quiet declaration that your daily rhythms matter to the living world. When you choose to ${lastAction}, you take responsibility for the physical materials and currents of energy flowing through your home.

You have already prevented an estimated ${avoidedCo2e} kg of greenhouse gas emissions from entering our shared atmosphere. More importantly, you have begun turning intentional conservation into effortless muscle memory.

Sustainability is not about flawless asceticism-it is about the humble, steady practice of doing one better thing each day. Thank you for walking this path with us.

With gratitude for your mindful footprint,
- The GreenPulse Community`;

    return new Response(JSON.stringify({ success: true, source: "letter-fallback", letter: fallbackLetter }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
