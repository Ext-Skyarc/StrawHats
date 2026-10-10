/* Edge function: energy-audit — deployed via Supabase MCP */
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
    const { appliance, wattage, hoursPerDay, daysPerWeek, tariff = 0.16, gridFactor = 0.385 } = await req.json();

    const monthlyHours = (hoursPerDay * (daysPerWeek || 7) * 52) / 12;
    const monthlyKwh = (wattage * monthlyHours) / 1000;
    const monthlyCost = monthlyKwh * tariff;
    const monthlyCo2eKg = monthlyKwh * gridFactor;

    let tip = "Consider using a smart outlet timer to automatically turn off power during peak tariff hours.";
    const appLower = (appliance || "").toLowerCase();
    if (appLower.includes("air") || appLower.includes("ac") || appLower.includes("hvac")) {
      tip = "Raising your thermostat setting by just 1C (2F) reduces cooling electricity use by up to 8-10%. Use ceiling fans to feel 4F cooler.";
    } else if (appLower.includes("fridge") || appLower.includes("refrigerator")) {
      tip = "Ensure door seals are airtight and vacuum the condenser coils annually to maintain peak compressor efficiency and save 10% kWh.";
    } else if (appLower.includes("pc") || appLower.includes("computer")) {
      tip = "Enable Sleep Mode after 15 minutes of inactivity. Standby GPU power can draw 40W continually if RGB lighting and peripherals remain awake.";
    } else if (appLower.includes("dish") || appLower.includes("washer")) {
      tip = "Always run full loads and select Air Dry rather than heated drying cycle to reduce energy by roughly 40%.";
    } else if (appLower.includes("car") || appLower.includes("ev")) {
      tip = "Schedule charging during off-peak overnight hours (11 PM - 6 AM) when grid electricity is both significantly cheaper and cleaner.";
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          appliance,
          wattage,
          monthlyHours: Math.round(monthlyHours),
          monthlyKwh: Number(monthlyKwh.toFixed(2)),
          monthlyCost: Number(monthlyCost.toFixed(2)),
          monthlyCo2eKg: Number(monthlyCo2eKg.toFixed(2)),
          ecoTip: tip,
          formula: {
            kwh: `(${wattage}W x ${hoursPerDay}h x ${daysPerWeek}d x 52w / 12m) / 1000 = ${monthlyKwh.toFixed(1)} kWh/mo`,
            cost: `${monthlyKwh.toFixed(1)} kWh x $${tariff}/kWh = $${monthlyCost.toFixed(2)}/mo`,
            co2e: `${monthlyKwh.toFixed(1)} kWh x ${gridFactor} kg CO2e/kWh = ${monthlyCo2eKg.toFixed(1)} kg CO2e/mo`,
          },
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
