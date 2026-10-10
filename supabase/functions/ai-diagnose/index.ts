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
    const { goal = "Cut monthly electricity bills by 20% and zero out landfill plastics", householdSize = 3 } = await req.json();
    const apiKey = Deno.env.get("GEMINI_API_KEY");

    if (apiKey) {
      try {
        const prompt = `Create a realistic 7-Day Micro-Action Carbon Diet plan for a household of ${householdSize} people.
Goal: "${goal}".
Return STRICT JSON:
{
  "planTitle": string,
  "totalEstimatedMonthlySavings": string,
  "totalEstimatedCo2Saved": string,
  "dailyPlan": [
    { "day": number, "title": string, "action": string, "category": "Energy" | "Waste" | "Habit", "timeRequiredMinutes": number, "xpPoints": number }
  ],
  "expertCoachNote": string
}`;

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 20000);
        const aiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: prompt,
              generationConfig: { responseMimeType: "application/json" },
            }),
            signal: controller.signal,
          }
        );
        clearTimeout(timeout);

        if (aiRes.ok) {
          const aiJson = await aiRes.json();
          const rawText = aiJson?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
          const parsed = JSON.parse(rawText.replace(/```json/g, "").replace(/```/g, "").trim());
          return new Response(JSON.stringify({ success: true, source: "gemini-2.0-flash", data: parsed }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      } catch (err: any) {
        console.warn("Gemini plan fallback:", err?.message);
      }
    }

    const fallbackPlan = {
      planTitle: "The 7-Day Household Efficiency Kickstart",
      totalEstimatedMonthlySavings: "$18.40 / month",
      totalEstimatedCo2Saved: "38.2 kg CO2e / month",
      dailyPlan: [
        { day: 1, title: "Vampire Electronics Hunt", action: "Walk around your home and unplug 4 idle transformers or turn off gaming PC master switch.", category: "Energy", timeRequiredMinutes: 10, xpPoints: 25 },
        { day: 2, title: "Fridge Thermostat Calibration", action: "Set refrigerator to 37F (3C) and freezer to 0F (-18C) to prevent compressor overworking.", category: "Energy", timeRequiredMinutes: 5, xpPoints: 20 },
        { day: 3, title: "Kitchen Compost Staging", action: "Set up a countertop scrap bowl or freezer container for coffee grounds and fruit peels.", category: "Waste", timeRequiredMinutes: 15, xpPoints: 30 },
        { day: 4, title: "The Cold-Water Laundry Shift", action: "Switch laundry dial to 30C Cold Wash and hang-dry 5 items instead of using resistance dryer.", category: "Energy", timeRequiredMinutes: 10, xpPoints: 35 },
        { day: 5, title: "Single-Use Plastic Bypass", action: "Carry your own tote bag and refillable tumbler for all errands today with 0 disposable plastics.", category: "Habit", timeRequiredMinutes: 5, xpPoints: 30 },
        { day: 6, title: "Clean Stream Recycling Audit", action: "Inspect municipal recycling bin; rinse residue from cans and remove plastic film wrappers.", category: "Waste", timeRequiredMinutes: 12, xpPoints: 25 },
        { day: 7, title: "Reflection & Letter Celebration", action: "Review week totals in GreenPulse, unlock your Day 7 Appreciation Letter, and set next month target.", category: "Habit", timeRequiredMinutes: 10, xpPoints: 50 },
      ],
      expertCoachNote: "Focus on establishing consistency before adding more complex actions. Habits built this week compound into hundreds of kilograms of avoided emissions every year.",
    };

    return new Response(JSON.stringify({ success: true, source: "plan-fallback", data: fallbackPlan }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
