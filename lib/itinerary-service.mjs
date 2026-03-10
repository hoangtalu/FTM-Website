import fs from "node:fs/promises";
import path from "node:path";

const DEFAULT_CONTEXT_PATH = path.join(process.cwd(), "data", "ftm-context.md");
const contextCache = new Map();

export function createRuntimeConfig(env = process.env) {
  return {
    contextPath: env.FTM_CONTEXT_PATH || DEFAULT_CONTEXT_PATH,
    geminiApiKey: env.GEMINI_API_KEY || "",
    geminiModel: env.GEMINI_MODEL || "gemini-2.5-flash",
    agencyConfig: {
      name: env.AGENCY_NAME || "Fill The Map",
      email: env.AGENCY_EMAIL || "",
      whatsapp: env.AGENCY_WHATSAPP || "",
      bookingLink: env.BOOKING_LINK || ""
    }
  };
}

export function getPublicConfig(runtimeConfig = createRuntimeConfig()) {
  return {
    mode: runtimeConfig.geminiApiKey ? "grounded" : "demo",
    agency: runtimeConfig.agencyConfig,
    model: runtimeConfig.geminiModel
  };
}

export async function generateItinerary(rawInput = {}, runtimeConfig = createRuntimeConfig()) {
  const input = normalizeInput(rawInput);
  return runtimeConfig.geminiApiKey
    ? buildGroundedItinerary(input, runtimeConfig)
    : buildDemoItinerary(input);
}

const baseTours = {
  "2": {
    name: "Ninh Binh Escape",
    route: ["Hanoi", "Ninh Binh", "Tam Coc", "Hoa Lu"],
    prices: {
      smart_value: "$60-$90",
      premium_comfort: "$135-$195",
      luxury_private: "$245-$390"
    },
    fit: "Fast reset with cinematic karsts and easy logistics",
    days: [
      {
        title: "Hanoi to Ninh Binh and the first limestone reveal",
        route: "Hanoi -> Bai Dinh -> Trang An -> Tam Coc",
        summary:
          "Leave Hanoi early, lean into the Red River Delta, and let the trip open with pagodas, caves, and slow water.",
        highlights: [
          "Private or shared transfer through rice country",
          "Bai Dinh Pagoda for scale and Buddhist heritage",
          "Trang An boat ride through cave corridors and temple valleys"
        ],
        hiddenGem: "Late-afternoon walk through the village lanes around the homestay before dinner.",
        stay: "Tam Coc valley homestay",
        transport: "Road transfer + rowboat",
        meals: "Lunch, dinner"
      },
      {
        title: "Sunrise lookout and a graceful finish",
        route: "Tam Coc -> Hang Mua -> Bich Dong -> Hoa Lu -> Hanoi",
        summary:
          "Start before the crowds, catch the dragon-viewpoint light, then close the trip with pagodas and Vietnam's ancient capital.",
        highlights: [
          "Hang Mua sunrise over karsts and rice paddies",
          "Tam Coc or Bich Dong depending on pace",
          "Hoa Lu temples for a final historical layer"
        ],
        hiddenGem: "A quiet riverside coffee stop after the morning climb.",
        stay: "Return to Hanoi",
        transport: "Road transfer + sampan boat",
        meals: "Breakfast, lunch"
      }
    ],
    destinations: [
      {
        name: "Ninh Binh",
        reason: "The easiest high-impact short escape from Hanoi.",
        hiddenGem: "Village roads around Tam Coc at dusk."
      }
    ]
  },
  "3": {
    name: "Ha Long Bay Cruise",
    route: ["Hanoi", "Ha Long Bay", "Lan Ha Bay"],
    prices: {
      smart_value: "$250-$325",
      premium_comfort: "$325-$415",
      luxury_private: "$425-$640"
    },
    fit: "Iconic bay scenery with the least planning friction",
    days: [
      {
        title: "Highway to the bay and first sail-out",
        route: "Hanoi -> Ha Long Bay cruise",
        summary:
          "Trade city rhythm for limestone seascapes, settle into the cabin, and begin with caves, kayaks, and sunset on deck.",
        highlights: [
          "Fast express transfer from Hanoi",
          "Cruise embarkation and lunch on the water",
          "Surprising Cave or similar cave stop"
        ],
        hiddenGem: "Blue-hour deck time after dinner when most guests retreat indoors.",
        stay: "Overnight cruise cabin",
        transport: "Express shuttle or private car + cruise",
        meals: "Lunch, dinner"
      },
      {
        title: "Full bay day with room to slow down",
        route: "Ha Long Bay -> Lan Ha Bay loops",
        summary:
          "Use the middle day for kayaking, island viewpoints, floating communities, and unhurried time between activities.",
        highlights: [
          "Sunrise or tai chi on deck",
          "Kayaking through quieter lagoons",
          "Titov or nearby viewpoint depending on route"
        ],
        hiddenGem: "A short early-morning coffee on deck before the day's first excursion.",
        stay: "Overnight cruise cabin",
        transport: "Cruise tender + kayak",
        meals: "Breakfast, lunch, dinner"
      },
      {
        title: "Soft landing back in Hanoi",
        route: "Ha Long Bay -> Hanoi",
        summary:
          "End with brunch on board and an afternoon return that still leaves room for a city dinner or onward flight.",
        highlights: [
          "Gentle morning sail and final photo stops",
          "Brunch before disembarkation",
          "Optional Old Quarter finish in Hanoi"
        ],
        hiddenGem: "Egg coffee in Hanoi after the transfer back.",
        stay: "Return to Hanoi",
        transport: "Cruise + road transfer",
        meals: "Breakfast, brunch"
      }
    ],
    destinations: [
      {
        name: "Ha Long Bay",
        reason: "Best-fit for travelers wanting iconic beauty fast.",
        hiddenGem: "Quieter lagoon time between headline excursions."
      }
    ]
  },
  "4": {
    name: "Sapa Mountain Retreat",
    route: ["Hanoi", "Sapa", "Muong Hoa Valley", "Ta Van"],
    prices: {
      smart_value: "$220-$310",
      premium_comfort: "$365-$515",
      luxury_private: "$595-$885"
    },
    fit: "Cool mountain air, terraces, and cultural depth without rushing the route",
    days: [
      {
        title: "Hanoi to Sapa through the mountain corridor",
        route: "Hanoi -> Sapa -> Cat Cat Village",
        summary:
          "The route climbs out of the delta into the northern highlands, then opens into village culture and a first look at terrace country.",
        highlights: [
          "Morning transfer to Sapa",
          "Check-in and town reset",
          "Cat Cat Village walk with Black Hmong craft culture"
        ],
        hiddenGem: "Sapa dusk coffee above the valley before dinner.",
        stay: "Sapa town hotel",
        transport: "Road transfer",
        meals: "Lunch, dinner"
      },
      {
        title: "Fansipan and the valley villages",
        route: "Sapa -> Fansipan -> Lao Chai -> Ta Van",
        summary:
          "Put the big mountain icon and the real village landscape on the same day, then sleep where the valley feels personal.",
        highlights: [
          "Fansipan cable car to the Roof of Indochina",
          "Temple complex and broad mountain views",
          "Trek into Lao Chai and Ta Van"
        ],
        hiddenGem: "Sunset from the homestay edge over the terraces.",
        stay: "Ta Van homestay",
        transport: "Cable car + guided walk",
        meals: "Breakfast, lunch, dinner"
      },
      {
        title: "Terraces, market color, and return to town",
        route: "Ta Van -> Y Linh Ho -> Sapa town",
        summary:
          "A slower village morning gives the trip texture before returning to Sapa for market energy and a more polished final night.",
        highlights: [
          "Terrace-side walk through the valley",
          "Local market stop if timing works",
          "Stone Church or handicraft browsing in Sapa"
        ],
        hiddenGem: "A quiet viewpoint above town instead of staying in the busy center.",
        stay: "Sapa town hotel",
        transport: "Guided walk + short road transfer",
        meals: "Breakfast, lunch, dinner"
      },
      {
        title: "The scenic road home",
        route: "Sapa -> Hanoi",
        summary:
          "Leave time for one last mountain coffee or waterfall viewpoint before the long but comfortable return to Hanoi.",
        highlights: [
          "Flexible Sapa morning",
          "Optional Silver Waterfall or Heaven's Gate",
          "Private or group return to Hanoi"
        ],
        hiddenGem: "Short stop at a mountain café with valley-facing seats.",
        stay: "Return to Hanoi",
        transport: "Road transfer",
        meals: "Breakfast, lunch"
      }
    ],
    destinations: [
      {
        name: "Sapa",
        reason: "Strongest answer for mountain scenery, villages, and climate contrast.",
        hiddenGem: "Homestay edges in Ta Van when day-trippers leave."
      }
    ]
  },
  "5": {
    name: "Sapa and Mai Chau Adventure",
    route: ["Hanoi", "Sapa", "Ta Van", "Mai Chau"],
    prices: {
      smart_value: "$245-$355",
      premium_comfort: "$415-$605",
      luxury_private: "$715-$1085"
    },
    fit: "A fuller north Vietnam story with terraces, valleys, and local households",
    days: [
      {
        title: "Up to Sapa and into village life",
        route: "Hanoi -> Sapa -> Cat Cat",
        summary:
          "Start with an immediate shift in temperature, terrain, and pace, then use the afternoon for a first cultural introduction.",
        highlights: [
          "Express transfer to Sapa",
          "Hotel reset and local lunch",
          "Cat Cat Village walk"
        ],
        hiddenGem: "Night market snacks instead of a full hotel evening.",
        stay: "Sapa town hotel",
        transport: "Road transfer",
        meals: "Lunch, dinner"
      },
      {
        title: "Big views, then the real valley",
        route: "Sapa -> Fansipan -> Lao Chai -> Ta Van",
        summary:
          "Let the iconic mountain summit give scale, then shift into the more human side of Sapa with a village stay.",
        highlights: [
          "Fansipan cable car and summit complex",
          "Muong Hoa Valley trek",
          "Traditional dinner with a host family"
        ],
        hiddenGem: "Terrace-edge rice wine at the end of the homestay dinner.",
        stay: "Ta Van homestay",
        transport: "Cable car + guided walk",
        meals: "Breakfast, lunch, dinner"
      },
      {
        title: "Cross-country to Mai Chau",
        route: "Ta Van -> Sapa -> Mai Chau",
        summary:
          "Use the transfer day as a landscape day rather than dead time, then arrive in a softer valley built for bicycles and slower evenings.",
        highlights: [
          "Early valley light in Sapa",
          "Scenic drive through changing terrain",
          "Welcome dinner in a White Thai stilt house"
        ],
        hiddenGem: "Roadside tea stop on the mountain pass instead of a standard highway break.",
        stay: "Mai Chau stilt-house homestay",
        transport: "Road transfer",
        meals: "Breakfast, lunch, dinner"
      },
      {
        title: "Mai Chau by bicycle",
        route: "Mai Chau -> Lac Village -> Pom Coong",
        summary:
          "This is the exhale day: flat cycling, weaving villages, relaxed pacing, and easy connection with the valley.",
        highlights: [
          "Morning rice field walk",
          "Village cycling circuit",
          "Textile weaving and cultural encounters"
        ],
        hiddenGem: "An unhurried hammock break overlooking the paddies.",
        stay: "Mai Chau stilt-house homestay",
        transport: "Bicycle + light road support",
        meals: "Breakfast, lunch, dinner"
      },
      {
        title: "Market texture and return to Hanoi",
        route: "Mai Chau -> local market -> Hanoi",
        summary:
          "Close with one more local layer before dropping back into Hanoi with a trip that feels fuller than its length.",
        highlights: [
          "Morning market or artisan visit",
          "Farewell lunch in the valley",
          "Drive back to Hanoi"
        ],
        hiddenGem: "A final village coffee away from the main homestay strip.",
        stay: "Return to Hanoi",
        transport: "Road transfer",
        meals: "Breakfast, lunch"
      }
    ],
    destinations: [
      {
        name: "Sapa",
        reason: "For mountain drama and ethnic village immersion.",
        hiddenGem: "Quiet terrace-edge evenings in Ta Van."
      },
      {
        name: "Mai Chau",
        reason: "For lower-altitude valley calm and cycling.",
        hiddenGem: "Village-to-village back lanes beyond the main homestay row."
      }
    ]
  },
  "7": {
    name: "Grand Northern Vietnam Journey",
    route: ["Hanoi", "Ha Long Bay", "Sapa", "Ta Van", "Mai Chau", "Ninh Binh"],
    prices: {
      smart_value: "$560-$805",
      premium_comfort: "$925-$1295",
      luxury_private: "$1585-$2405"
    },
    fit: "The strongest first trip for travelers who want a complete Northern Vietnam story",
    days: [
      {
        title: "Hanoi to Ha Long Bay",
        route: "Hanoi -> Ha Long Bay cruise",
        summary:
          "Open big. The bay gives the itinerary instant emotional lift and creates a premium first impression.",
        highlights: [
          "Fast transfer from Hanoi to the coast",
          "Cruise embarkation with lunch on board",
          "Cave exploration and sunset deck time"
        ],
        hiddenGem: "Quiet deck time after dinner instead of the busier common areas.",
        stay: "Overnight cruise cabin",
        transport: "Road transfer + cruise",
        meals: "Lunch, dinner"
      },
      {
        title: "More bay, less rush",
        route: "Ha Long Bay -> Lan Ha Bay loops",
        summary:
          "Use the second bay day for kayaking, island lookouts, and one stretch of true stillness between activities.",
        highlights: [
          "Sunrise deck session",
          "Kayaking or a smaller tender excursion",
          "Floating village or lagoon stop"
        ],
        hiddenGem: "An early coffee before the group schedule starts.",
        stay: "Overnight cruise cabin",
        transport: "Cruise + kayak",
        meals: "Breakfast, lunch, dinner"
      },
      {
        title: "Shift from sea to mountains",
        route: "Ha Long -> Hanoi corridor -> Sapa",
        summary:
          "This is the transition day. Make it clean, comfortable, and efficient so the mountain chapter starts with energy left.",
        highlights: [
          "Disembarkation and controlled transfer logistics",
          "Arrival in misty Sapa",
          "Cat Cat or town walk depending on fatigue"
        ],
        hiddenGem: "A mountain-herb dinner instead of a generic town restaurant.",
        stay: "Sapa town hotel",
        transport: "Cruise + road transfer",
        meals: "Breakfast, lunch, dinner"
      },
      {
        title: "Fansipan and valley homestay",
        route: "Sapa -> Fansipan -> Lao Chai -> Ta Van",
        summary:
          "Pair the iconic summit with the deeply personal village sleep. That contrast is one of the trip's strongest beats.",
        highlights: [
          "Fansipan summit by cable car",
          "Trek into Lao Chai and Ta Van",
          "Dinner with a local family"
        ],
        hiddenGem: "Golden-hour terrace views from the homestay edge.",
        stay: "Ta Van homestay",
        transport: "Cable car + guided walk",
        meals: "Breakfast, lunch, dinner"
      },
      {
        title: "From highlands to valley calm",
        route: "Ta Van -> Sapa -> Mai Chau",
        summary:
          "The long scenic drive resets the rhythm and lands in a gentler valley where the trip becomes slower and warmer.",
        highlights: [
          "Morning terrace light before departure",
          "Cross-country drive through mountain roads",
          "White Thai welcome dinner"
        ],
        hiddenGem: "A tea stop with mountain pass views on the way south.",
        stay: "Mai Chau stilt-house homestay",
        transport: "Road transfer",
        meals: "Breakfast, lunch, dinner"
      },
      {
        title: "Mai Chau by bicycle",
        route: "Mai Chau -> Lac Village -> Pom Coong",
        summary:
          "This day is about softness and texture: bicycles, looms, quiet roads, and the kind of pacing travelers remember.",
        highlights: [
          "Rice field morning walk",
          "Flat cycling through White Thai villages",
          "Handicraft and weaving visits"
        ],
        hiddenGem: "Late-afternoon hammock time before the barbecue dinner.",
        stay: "Mai Chau stilt-house homestay",
        transport: "Bicycle + local support vehicle",
        meals: "Breakfast, lunch, dinner"
      },
      {
        title: "Karst finale in Ninh Binh and back to Hanoi",
        route: "Mai Chau -> Ninh Binh -> Hanoi",
        summary:
          "Finish with one last wow moment on the water so the trip closes on beauty rather than simply on logistics.",
        highlights: [
          "Ninh Binh boat ride through karsts and caves",
          "Pagoda or viewpoint stop depending on timing",
          "Return to Hanoi with a full northern Vietnam arc complete"
        ],
        hiddenGem: "A countryside lunch with rice-field views before the final drive.",
        stay: "Return to Hanoi",
        transport: "Road transfer + rowboat",
        meals: "Breakfast, lunch"
      }
    ],
    destinations: [
      {
        name: "Ha Long Bay",
        reason: "Premium opening chapter with world-class scenery.",
        hiddenGem: "Early and late deck windows between excursions."
      },
      {
        name: "Sapa",
        reason: "Mountain altitude, village culture, and the terrace landscape.",
        hiddenGem: "Homestay evenings once day-trippers leave the valley."
      },
      {
        name: "Mai Chau",
        reason: "A softer valley counterweight to Sapa's dramatic terrain.",
        hiddenGem: "Back-lane cycling past working homes and fields."
      },
      {
        name: "Ninh Binh",
        reason: "A final karst-and-water chapter before returning to Hanoi.",
        hiddenGem: "Quiet lunch spots outside the busiest Tam Coc strip."
      }
    ]
  }
};

async function buildGroundedItinerary(input, runtimeConfig) {
  const ftmContext = await getFtmContext(runtimeConfig.contextPath);
  const prompt = buildGeminiPrompt(input, ftmContext);
  const apiUrl =
    `https://generativelanguage.googleapis.com/v1beta/models/${runtimeConfig.geminiModel}:generateContent?key=${encodeURIComponent(runtimeConfig.geminiApiKey)}`;

  const apiResponse = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ],
      tools: [{ google_search: {} }],
      generationConfig: {
        temperature: 0.45,
        topP: 0.9,
        maxOutputTokens: 8192
      }
    })
  });

  const apiPayload = await apiResponse.json();

  if (!apiResponse.ok) {
    const message = apiPayload?.error?.message || "Gemini request failed";
    throw new Error(message);
  }

  const candidate = apiPayload.candidates?.[0];
  const text = candidate?.content?.parts?.map((part) => part.text || "").join("").trim();

  if (!text) {
    throw new Error("Gemini returned an empty itinerary");
  }

  const itinerary = parseGeminiJson(text);

  return {
    mode: "grounded",
    itinerary,
    sources: extractSources(candidate?.groundingMetadata)
  };
}

function parseGeminiJson(text) {
  const candidates = [
    text,
    stripCodeFence(text),
    extractJsonObject(text)
  ].filter(Boolean);

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate);
    } catch {
      // Try the next candidate.
    }
  }

  throw new Error("Gemini returned text, but it was not valid JSON");
}

function stripCodeFence(text) {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced ? fenced[1].trim() : "";
}

function extractJsonObject(text) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    return "";
  }

  return text.slice(start, end + 1).trim();
}

function buildDemoItinerary(input) {
  const tour = baseTours[input.tripLength] || baseTours["7"];
  const comfortLabel = comfortMap[input.comfortLevel];
  const focusLabel = focusMap[input.tripFocus];
  const paceLabel = paceMap[input.paceStyle];
  const partyLabel = partyMap[input.partyType];
  const regionLabel = regionMap[input.region];
  const destinationLabel = destinationMap[input.destination];
  const partySize = partySizeMap[input.partyType];
  const perPersonEstimate = tour.prices[input.comfortLevel];
  const totalTripEstimate = multiplyPriceRange(perPersonEstimate, partySize);

  const stays = buildDemoStays(tour, input.comfortLevel);
  const restaurants = buildDemoRestaurants(tour.route, input.tripFocus);
  const servicesIncluded = buildIncludedServices(input);

  return {
    mode: "demo",
    itinerary: {
      tripTitle: `${tour.name} | ${comfortLabel} for ${partyLabel}`,
      summary:
        `This ${input.tripLength}-day itinerary starts from Hanoi and is optimized for ${focusLabel.toLowerCase()}. ` +
        `The flow keeps decisions light, builds around ${paceLabel.toLowerCase()}, and gives the traveler one clear route to react to fast.`,
      fitSummary: tour.fit,
      choiceSnapshot: [
        regionLabel,
        ...(destinationLabel ? [destinationLabel] : []),
        `${input.tripLength} days`,
        input.travelMonth,
        partyLabel,
        focusLabel,
        comfortLabel,
        paceLabel
      ],
      price: {
        currency: "USD",
        perPersonEstimate,
        totalTripEstimate,
        pricingBasis: `${comfortLabel} estimate based on current FTM pricing bands.`,
        totalBasis: `Estimated for ${partySize} traveler${partySize > 1 ? "s" : ""}.`
      },
      destinations: tour.destinations,
      stays,
      transport: buildTransportPlan(tour.route, input.comfortLevel),
      restaurants,
      servicesIncluded,
      servicesExcluded: [
        "International flights to and from Vietnam",
        "Travel insurance",
        "Personal shopping and optional spa treatments",
        "Alcohol beyond hosted tasting moments"
      ],
      days: tour.days.map((day, index) => ({
        dayNumber: index + 1,
        ...day
      }))
    },
    sources: []
  };
}

function buildGeminiPrompt(input, ftmContext) {
  const destinationPromptLine = destinationMap[input.destination]
    ? `- Anchor destination: ${destinationMap[input.destination]}`
    : "- Anchor destination: none selected, plan at the region level";

  return `
You are the itinerary designer for Fill The Map with Jude.

Use the Fill The Map context below as your brand and pricing baseline. You are producing a premium conversion-first itinerary for a website called "30-Second Tour."

The traveler already gave enough input. Do not ask follow-up questions. Make strong decisions.

Website concept rules:
- Return one best-fit itinerary, not multiple options.
- Default geography is Northern Vietnam starting from Hanoi.
- Selected region: ${regionMap[input.region]}
- Default geography should follow the selected region unless the user notes something else.
- Keep the answer practical, premium, and warm.
- The itinerary must be something a traveler can read in the browser and immediately either buy or customize.
- Use grounded web research for hotels, restaurants, transport timing, and practical local details.
- If availability or exact rates are uncertain, say "subject to confirmation."
- Price in USD.
- Include the estimated full-trip total and a per-person estimate.
- Include hotel suggestions, restaurant suggestions, transport plan, included services, iconic sights, sightseeing stops, and at least one hidden gem each day.
- Do not invent false certainty. When needed, label things as suggested or estimated.

Traveler inputs:
- Duration: ${input.tripLength} days
- Region: ${regionMap[input.region]}
${destinationPromptLine}
- Travel month: ${input.travelMonth}
- Party type: ${partyMap[input.partyType]}
- Trip focus: ${focusMap[input.tripFocus]}
- Comfort level: ${comfortMap[input.comfortLevel]}
- Pace style: ${paceMap[input.paceStyle]}
- Extra notes: ${input.mustKnow || "None"}

Fill The Map context:
${ftmContext}

Output requirements:
- Return valid JSON only.
- No markdown fences.
- Use this exact top-level shape:
{
  "tripTitle": "string",
  "summary": "string",
  "fitSummary": "string",
  "choiceSnapshot": ["string"],
  "price": {
    "currency": "USD",
    "perPersonEstimate": "string",
    "totalTripEstimate": "string",
    "pricingBasis": "string",
    "totalBasis": "string"
  },
  "destinations": [
    {
      "name": "string",
      "reason": "string",
      "hiddenGem": "string"
    }
  ],
  "stays": [
    {
      "destination": "string",
      "name": "string",
      "note": "string"
    }
  ],
  "transport": ["string"],
  "restaurants": [
    {
      "destination": "string",
      "name": "string",
      "whyVisit": "string"
    }
  ],
  "servicesIncluded": ["string"],
  "servicesExcluded": ["string"],
  "days": [
    {
      "dayNumber": 1,
      "title": "string",
      "route": "string",
      "summary": "string",
      "highlights": ["string"],
      "hiddenGem": "string",
      "stay": "string",
      "transport": "string",
      "meals": "string"
    }
  ]
}
  `.trim();
}

function extractSources(groundingMetadata = {}) {
  const chunks = groundingMetadata.groundingChunks || [];
  const seen = new Set();
  const sources = [];

  for (const chunk of chunks) {
    const web = chunk.web;
    if (!web?.uri || seen.has(web.uri)) {
      continue;
    }

    seen.add(web.uri);
    sources.push({
      title: web.title || web.uri,
      uri: web.uri
    });
  }

  return sources.slice(0, 8);
}

function buildDemoStays(tour, comfortLevel) {
  const stayProfiles = {
    smart_value: {
      cruise: "Well-rated cabin or local homestay standard",
      mountain: "Simple clean stay with local character",
      note: "Chosen for value, location, and strong guest sentiment."
    },
    premium_comfort: {
      cruise: "Boutique cruise cabin or polished valley lodge",
      mountain: "4-star boutique stay or upgraded homestay room",
      note: "Balanced toward comfort, design, and smoother service."
    },
    luxury_private: {
      cruise: "Top-tier cruise suite or private valley retreat",
      mountain: "Luxury resort room or highest-comfort private stay",
      note: "Built around privacy, views, and premium transfer support."
    }
  };

  const profile = stayProfiles[comfortLevel];
  const uniqueStops = [...new Set(tour.route.filter((stop) => stop !== "Hanoi"))];

  return uniqueStops.map((destination) => {
    const isWater = destination.includes("Bay");
    const isTown = destination === "Sapa" || destination === "Ninh Binh";
    return {
      destination,
      name: isWater ? profile.cruise : isTown ? profile.mountain : `Curated local stay in ${destination}`,
      note: profile.note
    };
  });
}

function buildDemoRestaurants(route, tripFocus) {
  const entries = [
    {
      destination: "Hanoi",
      name: "Hong Hoai's Restaurant",
      whyVisit: "Reliable local favorite for a classic first or last meal in the Old Quarter."
    },
    {
      destination: "Hanoi",
      name: "Hanoi Food Culture",
      whyVisit: "Strong option when food and local life are part of the brief."
    },
    {
      destination: "Sapa",
      name: "Mountain-herb hotpot dinner",
      whyVisit: "Fits the climate and gives the trip a clear regional flavor."
    },
    {
      destination: "Ta Van",
      name: "Hosted family dinner at the homestay",
      whyVisit: "Best route into real conversation and local cooking."
    },
    {
      destination: "Mai Chau",
      name: "White Thai homestay barbecue",
      whyVisit: "The most memorable dinner format in the valley."
    },
    {
      destination: "Ninh Binh",
      name: "Countryside goat and crispy rice lunch",
      whyVisit: "A signature regional stop before the return to Hanoi."
    },
    {
      destination: "Ha Long Bay",
      name: "Seafood set menu on the cruise",
      whyVisit: "Best fit for the bay chapter and the premium opening tone."
    }
  ];

  const routeSet = new Set(route);
  const filtered = entries.filter((entry) => routeSet.has(entry.destination));

  if (tripFocus === "food_local_life") {
    filtered.unshift({
      destination: "Hanoi",
      name: "Lan Ong Restaurant",
      whyVisit: "A compact, flavor-led stop for duck pho and spring rolls."
    });
  }

  return filtered.slice(0, 6);
}

function buildTransportPlan(route, comfortLevel) {
  const comfortTransport = {
    smart_value: "Shared or semi-private transfer where it keeps the route efficient",
    premium_comfort: "Private transfers for the long legs, local support for the activity segments",
    luxury_private: "Private car and premium transfer support throughout"
  };

  const segments = [];

  for (let index = 0; index < route.length - 1; index += 1) {
    const from = route[index];
    const to = route[index + 1];
    if (from === to) {
      continue;
    }

    segments.push(`${from} to ${to}: ${comfortTransport[comfortLevel]}`);
  }

  segments.push("Boat, bicycle, and cable-car activities folded into the right days.");
  return segments;
}

function buildIncludedServices(input) {
  const services = [
    "Curated itinerary planning built around the travel brief",
    "Accommodation and transport structure matched to the selected comfort level",
    "Sightseeing sequencing with one hidden gem each day",
    "Restaurant and meal recommendations aligned to the route"
  ];

  if (input.comfortLevel !== "smart_value") {
    services.push("Private guide support on the most logistics-heavy or culture-heavy segments");
  }

  if (input.partyType === "couple" || input.partyType === "family") {
    services.push("Pacing tuned for a more personal, lower-friction private journey");
  }

  return services;
}

export function normalizeInput(input = {}) {
  const destination = input.destination
    ? validOrDefault(input.destination, Object.keys(destinationMap), "ha_noi")
    : "";
  const region = validOrDefault(input.region, Object.keys(regionMap), "northern_vietnam");
  const tripLength = String(input.tripLength || "7");
  const travelMonth = String(input.travelMonth || "October");
  const partyType = validOrDefault(input.partyType, Object.keys(partyMap), "couple");
  const tripFocus = validOrDefault(input.tripFocus, Object.keys(focusMap), "nature_scenery");
  const comfortLevel = validOrDefault(input.comfortLevel, Object.keys(comfortMap), "premium_comfort");
  const paceStyle = validOrDefault(input.paceStyle, Object.keys(paceMap), "balanced_mix");
  const mustKnow = String(input.mustKnow || "").trim().slice(0, 300);

  if (!baseTours[tripLength]) {
    throw new Error("Unsupported trip length");
  }

  return {
    destination,
    region,
    tripLength,
    travelMonth,
    partyType,
    tripFocus,
    comfortLevel,
    paceStyle,
    mustKnow
  };
}

function validOrDefault(value, allowed, fallback) {
  return allowed.includes(value) ? value : fallback;
}

function multiplyPriceRange(price, multiplier) {
  const matches = price.match(/\d+/g);
  if (!matches || matches.length < 2) {
    return price;
  }

  const min = Number(matches[0]) * multiplier;
  const max = Number(matches[1]) * multiplier;
  return `$${min.toLocaleString()}-$${max.toLocaleString()}`;
}

async function getFtmContext(contextPath = DEFAULT_CONTEXT_PATH) {
  const normalizedPath = path.resolve(contextPath);

  if (!contextCache.has(normalizedPath)) {
    contextCache.set(normalizedPath, fs.readFile(normalizedPath, "utf8"));
  }

  return contextCache.get(normalizedPath);
}

const comfortMap = {
  smart_value: "Smart value",
  premium_comfort: "Premium comfort",
  luxury_private: "Luxury private"
};

const focusMap = {
  nature_scenery: "Nature + scenery",
  culture_people: "Culture + people",
  food_local_life: "Food + local life",
  adventure_motion: "Adventure + movement"
};

const partyMap = {
  solo: "Solo traveler",
  couple: "Couple",
  friends: "Friends",
  family: "Family",
  team: "Private team"
};

const partySizeMap = {
  solo: 1,
  couple: 2,
  friends: 4,
  family: 4,
  team: 6
};

const paceMap = {
  iconic_highlights: "Iconic sights",
  balanced_mix: "Balanced mix",
  hidden_gems_first: "Hidden gems first"
};

const regionMap = {
  northern_vietnam: "Northern Vietnam",
  central_vietnam: "Central Vietnam",
  southern_vietnam: "Southern Vietnam"
};

const destinationMap = {
  sapa: "Sapa",
  ha_giang: "Ha Giang",
  cao_bang: "Cao Bang",
  ha_noi: "Ha Noi",
  ninh_binh: "Ninh Binh",
  ha_long: "Ha Long",
  hue: "Hue",
  da_nang: "Da Nang",
  hoi_an: "Hoi An",
  quy_nhon: "Quy Nhon",
  nha_trang: "Nha Trang",
  mui_ne: "Mui Ne",
  ho_chi_minh_city: "Ho Chi Minh City",
  vung_tau: "Vung Tau",
  mekong_delta: "Mekong Delta",
  phu_quoc: "Phu Quoc",
  ca_mau: "Ca Mau"
};
