export interface WardrobeItemRecord {
  id: string;
  category?: string | null;
  sub_category?: string | null;
  subCategory?: string | null;
  color_family?: string | null;
  colorFamily?: string | null;
  pattern?: string | null;
  fabric?: string | null;
  formality?: string | null;
  min_temp?: number | null;
  minTemp?: number | null;
  max_temp?: number | null;
  maxTemp?: number | null;
  precipitation_resistant?: boolean | null;
  precipitationResistant?: boolean | null;
  image_url?: string | null;
  imageUrl?: string | null;
}

export interface NormalizedWardrobeItem {
  id: string;
  category: string;
  sub_category: string;
  subCategory: string;
  color_family: string;
  colorFamily: string;
  pattern: string;
  fabric: string;
  formality: string;
  min_temp: number;
  minTemp: number;
  max_temp: number;
  maxTemp: number;
  precipitation_resistant: boolean;
  precipitationResistant: boolean;
  image_url: string | null;
  imageUrl: string | null;
}

export interface WeatherPayload {
  city: string;
  temp: number;
  minTemp: number;
  maxTemp: number;
  condition: string;
  precipitationRisk: number;
  description: string;
  source?: string;
}

export interface CalendarEventPayload {
  id?: string;
  time: string;
  title: string;
  description?: string;
  start?: string;
  end?: string;
  location?: string;
  source?: string;
}

export interface PlannerOutfitItem {
  id: string;
  category: string;
  subCategory: string;
  imageUrl?: string | null;
}

export interface PlannerOutfit {
  context: string;
  scenario?: string;
  schedule?: string;
  weather?: string;
  items: PlannerOutfitItem[];
  stylingReasoning: string;
  reasoning?: string;
}

const FORMALITY_SCORE: Record<string, number> = {
  loungewear: 0,
  athletic: 1,
  casual: 2,
  "smart casual": 3,
  formal: 4,
};

export function normalizeWardrobeItem(item: WardrobeItemRecord): NormalizedWardrobeItem {
  return {
    id: item.id,
    category: item.category || "Accessory",
    sub_category: item.sub_category || item.subCategory || "Wardrobe piece",
    subCategory: item.subCategory || item.sub_category || "Wardrobe piece",
    color_family: item.color_family || item.colorFamily || "Classic",
    colorFamily: item.colorFamily || item.color_family || "Classic",
    pattern: item.pattern || "Solid",
    fabric: item.fabric || "Mixed fabric",
    formality: item.formality || "Casual",
    min_temp: typeof item.min_temp === "number" ? item.min_temp : item.minTemp ?? 45,
    minTemp: typeof item.minTemp === "number" ? item.minTemp : item.min_temp ?? 45,
    max_temp: typeof item.max_temp === "number" ? item.max_temp : item.maxTemp ?? 85,
    maxTemp: typeof item.maxTemp === "number" ? item.maxTemp : item.max_temp ?? 85,
    precipitation_resistant: Boolean(item.precipitation_resistant ?? item.precipitationResistant),
    precipitationResistant: Boolean(item.precipitationResistant ?? item.precipitation_resistant),
    image_url: item.image_url || item.imageUrl || null,
    imageUrl: item.imageUrl || item.image_url || null,
  };
}

export function formatWeatherLabel(weather: WeatherPayload) {
  return `${Math.round(weather.temp)}°F • ${weather.condition} in ${weather.city}`;
}

export function formatScheduleLabel(events: CalendarEventPayload[]) {
  if (!events.length) return "No calendar events found for today";
  return events.map((event) => `${event.time} - ${event.title}`).join(" · ");
}

export function normalizePlannerResult(
  rawResult: any,
  weather: WeatherPayload,
  calendar: CalendarEventPayload[],
  closet: WardrobeItemRecord[]
) {
  const normalizedCloset = closet.map(normalizeWardrobeItem);
  const outfits = Array.isArray(rawResult?.outfits) ? rawResult.outfits : [];
  const weatherLabel = formatWeatherLabel(weather);
  const scheduleLabel = formatScheduleLabel(calendar);

  return {
    ...rawResult,
    outfits: outfits.map((outfit: any) => {
      const items = Array.isArray(outfit?.items)
        ? outfit.items
            .map((selected: any) => {
              const selectedId = typeof selected === "string" ? selected : selected?.id;
              const closetItem = normalizedCloset.find((item) => item.id === selectedId);
              if (!selectedId || !closetItem) return null;
              return {
                id: selectedId,
                category: selected?.category || closetItem.category,
                subCategory: selected?.subCategory || selected?.sub_category || closetItem.sub_category,
                imageUrl: closetItem.image_url,
              };
            })
            .filter(Boolean)
        : [];

      const context = outfit?.context || calendar[0]?.title || "Today's Outfit";
      const reasoning = outfit?.stylingReasoning || outfit?.reasoning || buildReasoning(weather, calendar, items);

      return {
        ...outfit,
        context,
        scenario: outfit?.scenario || context,
        schedule: outfit?.schedule || scheduleLabel,
        weather: outfit?.weather || weatherLabel,
        items,
        stylingReasoning: reasoning,
        reasoning,
      };
    }),
  };
}

export function buildRuleBasedOOTD(
  weather: WeatherPayload,
  calendar: CalendarEventPayload[],
  closet: WardrobeItemRecord[]
) {
  const normalizedCloset = closet.map(normalizeWardrobeItem);
  const requiredFormality = inferRequiredFormality(calendar);
  const isWet = weather.precipitationRisk >= 45 || /rain|storm|snow|drizzle/i.test(`${weather.condition} ${weather.description}`);
  const targetTemp = weather.temp;

  const scoreItem = (item: NormalizedWardrobeItem) => {
    const tempFit =
      targetTemp >= item.min_temp && targetTemp <= item.max_temp
        ? 35
        : Math.max(0, 25 - Math.min(Math.abs(targetTemp - item.min_temp), Math.abs(targetTemp - item.max_temp)));
    const rainFit = isWet ? (item.precipitation_resistant ? 20 : -8) : 4;
    const formalityFit = 20 - Math.abs(formalityRank(item.formality) - requiredFormality) * 5;
    const categoryFit = item.category === "Accessory" ? 1 : 8;
    return tempFit + rainFit + formalityFit + categoryFit;
  };

  const byScore = [...normalizedCloset].sort((a, b) => scoreItem(b) - scoreItem(a));
  const pickCategory = (categories: string[], excludedIds = new Set<string>()) =>
    byScore.find((item) => categories.includes(item.category.toLowerCase()) && !excludedIds.has(item.id));

  const selected: NormalizedWardrobeItem[] = [];
  const excluded = new Set<string>();
  const onePiece = pickCategory(["one-piece"], excluded);

  if (onePiece && (requiredFormality <= 2 || scoreItem(onePiece) >= scoreItem(byScore[0] || onePiece) - 5)) {
    selected.push(onePiece);
    excluded.add(onePiece.id);
  } else {
    const top = pickCategory(["top"], excluded);
    if (top) {
      selected.push(top);
      excluded.add(top.id);
    }

    const bottom = pickCategory(["bottom"], excluded);
    if (bottom) {
      selected.push(bottom);
      excluded.add(bottom.id);
    }
  }

  const needsLayer = targetTemp <= 65 || isWet || requiredFormality >= 3;
  const outerwear = pickCategory(["outerwear"], excluded);
  if (outerwear && needsLayer) {
    selected.push(outerwear);
    excluded.add(outerwear.id);
  }

  const footwear = pickCategory(["footwear"], excluded);
  if (footwear) selected.push(footwear);

  if (!selected.length && byScore[0]) selected.push(byScore[0]);

  const context = calendar[0]?.title || `A ${weather.condition.toLowerCase()} day in ${weather.city}`;
  const items = selected.map((item) => ({
    id: item.id,
    category: item.category,
    subCategory: item.sub_category,
    imageUrl: item.image_url,
  }));

  return {
    outfits: [
      {
        context,
        scenario: context,
        schedule: formatScheduleLabel(calendar),
        weather: formatWeatherLabel(weather),
        items,
        stylingReasoning: buildReasoning(weather, calendar, items),
        reasoning: buildReasoning(weather, calendar, items),
      },
    ],
    plannerSource: "rules-fallback",
  };
}

function buildReasoning(weather: WeatherPayload, calendar: CalendarEventPayload[], items: PlannerOutfitItem[]) {
  const scheduleText = calendar.length
    ? `your ${calendar[0].title}${calendar.length > 1 ? ` and ${calendar.length - 1} other event${calendar.length > 2 ? "s" : ""}` : ""}`
    : "an open schedule";
  const itemText = items.map((item) => item.subCategory).join(", ") || "the selected closet pieces";
  const rainText =
    weather.precipitationRisk >= 45
      ? " The recommendation gives extra weight to weather-ready layers and footwear because precipitation is likely."
      : "";

  return `For ${scheduleText}, this pulls ${itemText} from your closet to balance the ${Math.round(weather.temp)}°F ${weather.condition.toLowerCase()} forecast with the day's formality.${rainText}`;
}

function inferRequiredFormality(calendar: CalendarEventPayload[]) {
  const text = calendar.map((event) => `${event.title} ${event.description || ""}`).join(" ").toLowerCase();
  if (/board|executive|client|interview|pitch|presentation|briefing|investor|formal/.test(text)) return 4;
  if (/meeting|sync|review|office|standup|workshop/.test(text)) return 3;
  if (/gym|workout|run|training|hike|sport/.test(text)) return 1;
  if (/brunch|party|social|coffee|dinner|lunch|casual/.test(text)) return 2;
  return 2;
}

function formalityRank(formality: string | null | undefined) {
  return FORMALITY_SCORE[(formality || "casual").toLowerCase()] ?? 2;
}
