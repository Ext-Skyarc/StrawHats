/* Edge function: waste-scan — deployed via Supabase MCP */
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const WASTE_KNOWLEDGE_BASE: Record<string, any> = {
  "plastic bottle": {
    category: "Recycle",
    materialType: "PET (#1 Polyethylene Terephthalate)",
    handlingSteps: [
      "Empty all liquid contents completely",
      "Rinse bottle with cold water to remove sugary residue",
      "Crush bottle slightly to save bin volume",
      "Replace cap tightly (modern MRF facilities accept caps on)",
      "Place in dedicated plastic/recycling container",
    ],
    contaminationAlerts: ["Do not leave straws or dirty wrappers inside", "Avoid mixing with non-PET soft plastics"],
    reuseIdeas: ["Cut base for seedling planters", "Make self-watering herb pots", "Convert into a bird feeder"],
    estimatedWeightKg: 0.025,
    avoidedCo2eKg: 0.082,
    diversionEligible: true,
    funEcoFact: "Recycling 1 ton of PET plastic bottles saves roughly 3.8 barrels of crude oil and 1,200 kWh of electricity.",
  },
  "coffee cup": {
    category: "Landfill",
    materialType: "Paperboard lined with Polyethylene (PE) coating",
    handlingSteps: [
      "Separate the plastic lid (check if lid is #5 PP or #6 PS)",
      "Remove the cardboard heat sleeve (cardboard sleeve CAN be recycled)",
      "Discard paper cup body in landfill bin (waxy plastic liner cannot be repulped in standard mills)",
    ],
    contaminationAlerts: ["Paper coffee cups placed in recycling contaminate paper bales with waterproof resin"],
    reuseIdeas: ["Use as a temporary paint/glue mixer cup", "Bring a reusable vacuum-insulated mug next time (+20 XP)"],
    estimatedWeightKg: 0.018,
    avoidedCo2eKg: 0.015,
    diversionEligible: false,
    funEcoFact: "Over 16 billion paper coffee cups are discarded each year globally. Reusable tumblers break even after only 20 uses.",
  },
  "aluminum can": {
    category: "Recycle",
    materialType: "Aluminum Alloy (100% infinitely recyclable)",
    handlingSteps: [
      "Pour out remaining beverage liquid",
      "Light rinse if sugary or sticky",
      "Keep tab attached to the can",
      "Place in curbside metals recycling",
    ],
    contaminationAlerts: ["Do not crush completely if your municipality uses optical sorting sensors"],
    reuseIdeas: ["Desk pencil organizer", "Repurposed tealight candle holder", "Seed starting pots"],
    estimatedWeightKg: 0.015,
    avoidedCo2eKg: 0.14,
    diversionEligible: true,
    funEcoFact: "Recycling aluminum uses 95% less energy than mining and smelting new bauxite ore. A recycled can is back on shelves in 60 days.",
  },
  battery: {
    category: "Hazardous / E-Waste",
    materialType: "Lithium-Ion / Alkaline heavy metal chemistry",
    handlingSteps: [
      "Tape battery contact terminals with clear electrical tape to prevent short circuits",
      "Store in a cool, dry container away from direct sunlight",
      "Do NOT place in standard trash or curbside recycling",
      "Drop off at designated hardware store or municipal e-waste depot (e.g. Call2Recycle kiosk)",
    ],
    contaminationAlerts: ["Lithium batteries crushed in garbage trucks or recycling sorting lines cause severe fires"],
    reuseIdeas: ["Check rechargeable health before recycling; recharge if battery pack is still serviceable"],
    estimatedWeightKg: 0.045,
    avoidedCo2eKg: 0.35,
    diversionEligible: true,
    funEcoFact: "Recycling lithium batteries recovers critical cobalt, nickel, and lithium, reducing demand for virgin open-pit mining by up to 70%.",
  },
  cardboard: {
    category: "Recycle",
    materialType: "Corrugated Cardboard (Kraft fibers)",
    handlingSteps: [
      "Remove all plastic packing tape and shipping label stickers if possible",
      "Flatten boxes completely to save transport emissions and bin space",
      "Keep dry; place in blue paper/cardboard bin",
    ],
    contaminationAlerts: ["Grease-soaked pizza cardboard must go to compost or trash, not paper recycling"],
    reuseIdeas: ["Use for garden sheet mulching (suppresses weeds organically)", "Packaging storage and moving boxes"],
    estimatedWeightKg: 0.25,
    avoidedCo2eKg: 0.42,
    diversionEligible: true,
    funEcoFact: "Recycling 1 ton of cardboard saves 9 cubic yards of landfill space and 46 gallons of oil.",
  },
  "food scraps": {
    category: "Compost",
    materialType: "Organic Plant / Cellulose Matter",
    handlingSteps: [
      "Collect in a breathable countertop compost pail or freezer bowl to avoid odors",
      "Add to backyard compost tumbler or city green-waste bin",
      "Balance greens (nitrogen-rich scraps) with browns (dry leaves, shredded cardboard)",
    ],
    contaminationAlerts: ["Do not mix plastic produce stickers or rubber bands into compost"],
    reuseIdeas: ["Simmer vegetable peelings to make homemade aromatic vegetable broth", "Feed suitable scraps to home vermicompost (worms)"],
    estimatedWeightKg: 0.3,
    avoidedCo2eKg: 0.55,
    diversionEligible: true,
    funEcoFact: "When food scraps decompose in landfills without oxygen, they release methane (CH4), a greenhouse gas 28x more potent than CO2.",
  },
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { itemName, imageBase64, mimeType = "image/jpeg" } = await req.json();
    const apiKey = Deno.env.get("GEMINI_API_KEY");

    if (apiKey) {
      try {
        const promptText = `You are the GreenPulse Waste AI Classifier. Analyze this waste item: "${itemName || "item in image"}".
Categorize it precisely and provide concrete handling guidance.

Return a STRICT JSON object with these EXACT keys:
{
  "itemName": string,
  "category": "Recycle" | "Compost" | "Landfill" | "Hazardous / E-Waste" | "Special Drop-off" | "Reusable",
  "materialType": string,
  "confidence": number (integer 0 to 100),
  "handlingSteps": string[] (3 to 5 clear action steps),
  "contaminationAlerts": string[] (1 to 2 critical contamination prevention warnings),
  "reuseIdeas": string[] (1 to 3 creative reuse or upcycling tips),
  "estimatedWeightKg": number,
  "avoidedCo2eKg": number,
  "diversionEligible": boolean,
  "funEcoFact": string
}
Return only valid JSON, without markdown formatting.`;

        let body: any;
        if (imageBase64) {
          const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
          body = {
            contents: {
              parts: [
                { inlineData: { mimeType, data: cleanBase64 } },
                { text: promptText },
              ],
            },
            generationConfig: { responseMimeType: "application/json" },
          };
        } else {
          body = {
            contents: promptText,
            generationConfig: { responseMimeType: "application/json" },
          };
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 20000);
        const aiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
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
      } catch (aiErr: any) {
        console.warn("Gemini waste classification failed, falling back to rule engine:", aiErr?.message);
      }
    }

    const query = (itemName || "plastic bottle").toLowerCase();
    let matchedKey = Object.keys(WASTE_KNOWLEDGE_BASE).find((k) => query.includes(k));
    if (!matchedKey) {
      if (query.includes("cup") || query.includes("starbucks")) matchedKey = "coffee cup";
      else if (query.includes("can") || query.includes("coke") || query.includes("soda") || query.includes("beer")) matchedKey = "aluminum can";
      else if (query.includes("battery") || query.includes("electronics") || query.includes("charger")) matchedKey = "battery";
      else if (query.includes("box") || query.includes("amazon") || query.includes("paper")) matchedKey = "cardboard";
      else if (query.includes("apple") || query.includes("food") || query.includes("banana") || query.includes("peel")) matchedKey = "food scraps";
      else matchedKey = "plastic bottle";
    }

    const template = WASTE_KNOWLEDGE_BASE[matchedKey];
    const result = {
      itemName: itemName || matchedKey.charAt(0).toUpperCase() + matchedKey.slice(1),
      category: template.category,
      materialType: template.materialType,
      confidence: 88,
      handlingSteps: template.handlingSteps,
      contaminationAlerts: template.contaminationAlerts,
      reuseIdeas: template.reuseIdeas,
      estimatedWeightKg: template.estimatedWeightKg,
      avoidedCo2eKg: template.avoidedCo2eKg,
      diversionEligible: template.diversionEligible,
      funEcoFact: template.funEcoFact,
    };

    return new Response(JSON.stringify({ success: true, source: "rule-engine-fallback", data: result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message || "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
