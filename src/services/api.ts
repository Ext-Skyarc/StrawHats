export interface WasteScanResult {
  itemName: string;
  category: 'Recycle' | 'Compost' | 'Landfill' | 'Hazardous / E-Waste' | 'Special Drop-off' | 'Reusable';
  materialType: string;
  confidence: number;
  handlingSteps: string[];
  contaminationAlerts: string[];
  reuseIdeas: string[];
  estimatedWeightKg: number;
  avoidedCo2eKg: number;
  diversionEligible: boolean;
  funEcoFact: string;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

function edgeFunctionUrl(slug: string): string {
  return `${SUPABASE_URL}/functions/v1/${slug}`;
}

function edgeHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    apikey: SUPABASE_ANON_KEY,
  };
}

export async function scanWasteItem(params: {
  itemName?: string;
  imageBase64?: string;
  mimeType?: string;
}): Promise<{ source: string; data: WasteScanResult }> {
  const res = await fetch(edgeFunctionUrl('waste-scan'), {
    method: 'POST',
    headers: edgeHeaders(),
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    throw new Error(`Failed to scan waste item (${res.status})`);
  }

  const json = await res.json();
  if (!json.success) {
    throw new Error(json.error || 'Unknown scan error');
  }

  return { source: json.source, data: json.data };
}

export async function chatWithCoach(params: {
  userMessage: string;
  userContext: {
    totalKwh: number;
    totalCost: number;
    totalCo2eKg: number;
    wasteCount: number;
    diversionRate: number;
    streakDays: number;
    sustainabilityScore: number;
    recentItems: string[];
  };
}): Promise<{ source: string; reply: string }> {
  const res = await fetch(edgeFunctionUrl('coach-chat'), {
    method: 'POST',
    headers: edgeHeaders(),
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    throw new Error(`Failed to reach AI Sustainability Coach (${res.status})`);
  }

  const json = await res.json();
  return { source: json.source, reply: json.reply };
}

export async function auditEnergyAppliance(params: {
  appliance: string;
  wattage: number;
  hoursPerDay: number;
  daysPerWeek: number;
  tariff: number;
  gridFactor: number;
}) {
  const res = await fetch(edgeFunctionUrl('energy-audit'), {
    method: 'POST',
    headers: edgeHeaders(),
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    throw new Error('Energy audit calculation failed');
  }

  const json = await res.json();
  return json.data;
}

export interface AiForecastResult {
  projectedKwhSavedMonthly: number;
  projectedCostSavedMonthly: number;
  projectedCo2eSavedMonthly: number;
  wasteDivertedKgMonthly: number;
  treesEquivalentAnnual: number;
  carMilesAvoidedMonthly: number;
  actionBreakdown: { action: string; monthlyCo2eSaved: number; effort: 'Low' | 'Medium' | 'High'; tip: string }[];
  feasibilityScore: number;
  executiveSummary: string;
}

export async function simulateAiForecast(params: {
  scenarioText: string;
  currentKwh?: number;
  currentWaste?: number;
  tariff?: number;
  gridFactor?: number;
}): Promise<{ source: string; data: AiForecastResult }> {
  const res = await fetch(edgeFunctionUrl('ai-forecast'), {
    method: 'POST',
    headers: edgeHeaders(),
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error('Forecast calculation unavailable');
  const json = await res.json();
  return { source: json.source, data: json.data };
}

export async function generateAiLetter(params: {
  userName: string;
  streakDays: number;
  lastAction: string;
  avoidedCo2e: number;
}): Promise<{ source: string; letter: string }> {
  const res = await fetch(edgeFunctionUrl('ai-letter'), {
    method: 'POST',
    headers: edgeHeaders(),
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error('Letter generator unavailable');
  const json = await res.json();
  return { source: json.source, letter: json.letter };
}

export interface Ai7DayPlanResult {
  planTitle: string;
  totalEstimatedMonthlySavings: string;
  totalEstimatedCo2Saved: string;
  dailyPlan: {
    day: number;
    title: string;
    action: string;
    category: 'Energy' | 'Waste' | 'Habit';
    timeRequiredMinutes: number;
    xpPoints: number;
  }[];
  expertCoachNote: string;
}

export async function generateAi7DayPlan(params: {
  goal: string;
  householdSize?: number;
}): Promise<{ source: string; data: Ai7DayPlanResult }> {
  const res = await fetch(edgeFunctionUrl('ai-diagnose'), {
    method: 'POST',
    headers: edgeHeaders(),
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error('Plan generator unavailable');
  const json = await res.json();
  return { source: json.source, data: json.data };
}

export interface AiCalculatorAuditResult {
  headlineSummary: string;
  projectedAnnualTonnesCut: number;
  projectedAnnualDollarSavings: number;
  highestLeverSector: string;
  recommendations: {
    title: string;
    description: string;
    co2eCutKg: number;
    annualSavings: string;
    difficulty: 'Easy' | 'Moderate' | 'High';
  }[];
  methodologyNote: string;
}

export async function runAiCalculatorAudit(params: {
  formData: any;
  currentTonnes: number;
}): Promise<{ source: string; data: AiCalculatorAuditResult }> {
  const res = await fetch(edgeFunctionUrl('ai-calculator-audit'), {
    method: 'POST',
    headers: edgeHeaders(),
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error('Calculator audit unavailable');
  const json = await res.json();
  return { source: json.source, data: json.data };
}
