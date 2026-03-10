const form = document.querySelector("#tour-form");
const resultShell = document.querySelector("#result-shell");
const modeIndicator = document.querySelector("#mode-indicator");
const regionInput = document.querySelector("#region-input");
const destinationInput = document.querySelector("#destination-input");
const regionTitle = document.querySelector("#region-title");
const regionCopy = document.querySelector("#region-copy");
const regionTags = document.querySelector("#region-tags");
const focusBestFor = document.querySelector("#focus-best-for");
const focusSignatureList = document.querySelector("#focus-signature-list");
const mapHost = document.querySelector("#map-svg-host");
const regionChips = document.querySelectorAll("[data-region-chip]");
const zoomButtons = document.querySelectorAll("[data-zoom-action]");

const progressMessages = [
  "Scanning the region...",
  "Matching the best route...",
  "Layering stays, transport, and meals...",
  "Pricing the trip...",
  "Finalizing the itinerary..."
];

const regionMeta = {
  northern_vietnam: {
    title: "Northern Vietnam",
    copy: "This rugged region is defined by the towering Hoang Lien Son mountains and the deep-rooted traditions of the Red River Delta. It offers a dramatic blend of misty peaks, ancient history, and distinct seasonal changes.",
    tags: ["Hoang Lien Son", "Red River Delta", "Seasons"],
    bestFor: "Epic mountain routes, terraced valleys, and cooler highland escapes",
    signatureStops: ["Hà Nội", "Sapa", "Hà Giang", "Ninh Bình"]
  },
  central_vietnam: {
    title: "Central Vietnam",
    copy: "A narrow strip of land where the Truong Son Mountains meet the East Sea, known for its UNESCO heritage sites and pristine beaches. It serves as the country's culinary and imperial heart, bridging the distinct vibes of the north and south.",
    tags: ["UNESCO", "Beaches", "Imperial heart"],
    bestFor: "Beach-driven journeys with heritage cities and coastal food culture",
    signatureStops: ["Huế", "Đà Nẵng", "Hội An", "Nha Trang"]
  },
  southern_vietnam: {
    title: "Southern Vietnam",
    copy: "Dominated by the fertile plains of the Mekong Delta, this region is a sun-drenched powerhouse of commerce and tropical agriculture. Life here moves to the rhythm of the water, characterized by a fast-paced urban energy and a warm, hospitable climate.",
    tags: ["Mekong Delta", "Commerce", "Tropical"],
    bestFor: "River life, tropical islands, and fast city-to-water contrasts",
    signatureStops: ["Hồ Chí Minh City", "Mekong Delta", "Phú Quốc", "Cà Mau"]
  }
};

const regionGroups = {
  northern_vietnam: [
    "VN01", "VN02", "VN03", "VN04", "VN05", "VN06", "VN07", "VN09", "VN13",
    "VN14", "VN18", "VN20", "VN21", "VN53", "VN54", "VN56", "VN61", "VN63",
    "VN66", "VN67", "VN68", "VN69", "VN70", "VN71", "VNHN", "VNHP"
  ],
  central_vietnam: [
    "VN22", "VN23", "VN24", "VN25", "VN26", "VN27", "VN28", "VN29", "VN30",
    "VN31", "VN32", "VN33", "VN34", "VN35", "VN36", "VNDN"
  ],
  southern_vietnam: [
    "VN37", "VN39", "VN40", "VN41", "VN43", "VN44", "VN45", "VN46", "VN47",
    "VN49", "VN50", "VN51", "VN52", "VN55", "VN57", "VN58", "VN59", "VN73",
    "VNCT", "VNSG"
  ]
};

const destinationCatalog = {
  sapa: {
    label: "Sapa",
    region: "northern_vietnam",
    provinceIds: ["VN02"],
    markerId: "VN02",
    copy: "Perched high in the mountains, this former hill station is famous for its dramatic terraced rice fields and trekking trails through ethnic minority villages. Despite its popularity, it remains the gateway to Fansipan, the highest peak in Indochina.",
    tags: ["Terraced rice fields", "Ethnic villages", "Fansipan"],
    bestFor: "Trekking, cool mountain air, and scenic lodge or homestay escapes",
    signatureStops: ["Fansipan", "Muong Hoa Valley", "Ta Van"]
  },
  ha_giang: {
    label: "Hà Giang",
    region: "northern_vietnam",
    provinceIds: ["VN03"],
    markerId: "VN03",
    copy: "This frontier province is home to the Ma Pi Leng Pass and some of the most spectacular karst plateaus in Southeast Asia. It offers the ultimate off-the-beaten-path adventure for travelers looking to experience raw, untouched landscapes.",
    tags: ["Ma Pi Leng", "Karst plateau", "Adventure"],
    bestFor: "Road-trip travelers chasing raw scenery and high-altitude drama",
    signatureStops: ["Ma Pi Leng Pass", "Dong Van", "Karst Plateau"]
  },
  cao_bang: {
    label: "Cao Bằng",
    region: "northern_vietnam",
    provinceIds: ["VN04"],
    markerId: "VN04",
    copy: "Best known for the majestic Ban Gioc Waterfall, this northern outpost is a geological wonderland of caves and jagged peaks. It provides a serene escape into nature, far removed from the typical tourist circuits.",
    tags: ["Ban Gioc", "Caves", "Serene"],
    bestFor: "Nature-first travelers who want water, caves, and low-traffic routes",
    signatureStops: ["Ban Gioc", "Nguom Ngao Cave", "Border peaks"]
  },
  ha_noi: {
    label: "Hà Nội",
    region: "northern_vietnam",
    provinceIds: ["VNHN"],
    markerId: "VNHN",
    copy: "The thousand-year-old capital balances the chaotic charm of the Old Quarter with elegant colonial architecture and tranquil lakes. It is the ultimate hub for street food lovers and those seeking to understand Vietnam's complex political and artistic history.",
    tags: ["Old Quarter", "Colonial", "Street food"],
    bestFor: "Culture, food walks, and a polished gateway into Northern Vietnam",
    signatureStops: ["Old Quarter", "Hoan Kiem", "Art + politics"]
  },
  ninh_binh: {
    label: "Ninh Bình",
    region: "northern_vietnam",
    provinceIds: ["VN18"],
    markerId: "VN18",
    copy: "Often called Ha Long Bay on Land, this province features limestone pinnacles rising directly out of emerald rice paddies. A sampan boat ride through the Trang An or Tam Coc grottos offers one of the most peaceful perspectives of Vietnam's countryside.",
    tags: ["Trang An", "Tam Coc", "Sampan"],
    bestFor: "Short scenic escapes with calm water, karsts, and countryside rhythm",
    signatureStops: ["Trang An", "Tam Coc", "Hang Mua"]
  },
  ha_long: {
    label: "Hạ Long",
    region: "northern_vietnam",
    provinceIds: ["VN13"],
    markerId: "VN13",
    copy: "Famous for thousands of towering limestone islands and emerald waters, this UNESCO World Heritage site is Vietnam's most iconic seascape. Exploring the hidden caves and floating villages by boat remains a quintessential travel experience.",
    tags: ["UNESCO", "Caves", "Floating villages"],
    bestFor: "Cruise-led itineraries, sea scenery, and a high-impact first-time Vietnam moment",
    signatureStops: ["Cruise", "Caves", "Lan Ha"]
  },
  hue: {
    label: "Huế",
    region: "central_vietnam",
    provinceIds: ["VN26"],
    markerId: "VN26",
    copy: "As the former seat of the Nguyen Dynasty, this city is a living museum of imperial citadels, royal tombs, and pagodas. Its refined atmosphere and specialized royal cuisine offer a glimpse into the country's feudal past.",
    tags: ["Citadel", "Royal tombs", "Cuisine"],
    bestFor: "History lovers and travelers who want a slower, more refined cultural stop",
    signatureStops: ["Citadel", "Royal tombs", "Perfume River"]
  },
  da_nang: {
    label: "Đà Nẵng",
    region: "central_vietnam",
    provinceIds: ["VNDN"],
    markerId: "VNDN",
    copy: "This modern coastal city is celebrated for its long sandy beaches, the Marble Mountains, and the striking Dragon Bridge. It serves as a perfectly positioned base for exploring the central coast while enjoying world-class urban amenities.",
    tags: ["Beaches", "Marble Mountains", "Dragon Bridge"],
    bestFor: "Travelers who want beach access with city comfort and easy logistics",
    signatureStops: ["My Khe Beach", "Marble Mountains", "Dragon Bridge"]
  },
  hoi_an: {
    label: "Hội An",
    region: "central_vietnam",
    provinceIds: ["VN27"],
    markerId: "VN27",
    copy: "This exceptionally well-preserved trading port glows with hundreds of silk lanterns and yellow-walled merchant houses. It is a haven for photography, custom tailoring, and slow-paced cycling through the surrounding coconut groves.",
    tags: ["Lanterns", "Tailoring", "Cycling"],
    bestFor: "Slow travel, photography, tailoring, and river-meets-old-town atmosphere",
    signatureStops: ["Ancient Town", "Lantern nights", "Coconut groves"]
  },
  quy_nhon: {
    label: "Quy Nhơn",
    region: "central_vietnam",
    provinceIds: ["VN31"],
    markerId: "VN31",
    copy: "A rising star on the coast, this city offers quiet, sweeping bays and a surprisingly laid-back atmosphere compared to its busier neighbors. It is a fantastic spot for fresh seafood and exploring ancient Cham towers tucked away in the hills.",
    tags: ["Bays", "Seafood", "Cham towers"],
    bestFor: "Quiet coast trips with fewer crowds and strong local seafood culture",
    signatureStops: ["Sweeping bays", "Seafood", "Cham towers"]
  },
  nha_trang: {
    label: "Nha Trang",
    region: "central_vietnam",
    provinceIds: ["VN34"],
    markerId: "VN34",
    copy: "Vietnam's premier scuba diving and beach resort destination, it boasts a high-energy coastline backed by lush mountains. The city is famous for its offshore islands, mud baths, and vibrant nightlife.",
    tags: ["Scuba", "Mud baths", "Nightlife"],
    bestFor: "Resort stays, island day trips, and livelier beach energy",
    signatureStops: ["Offshore islands", "Mud baths", "Nightlife"]
  },
  mui_ne: {
    label: "Mũi Né",
    region: "southern_vietnam",
    provinceIds: ["VN40"],
    markerId: "VN40",
    copy: "Famous for its massive white and red sand dunes, this coastal town feels like a desert oasis right by the ocean. It is a global hotspot for kitesurfing and windsurfing thanks to its unique microclimate and consistent winds.",
    tags: ["Sand dunes", "Kitesurfing", "Winds"],
    bestFor: "Active beach travelers, wind sports, and bright dry-coast weather",
    signatureStops: ["White dunes", "Red dunes", "Kitesurfing"]
  },
  ho_chi_minh_city: {
    label: "Hồ Chí Minh City",
    region: "southern_vietnam",
    provinceIds: ["VNSG"],
    markerId: "VNSG",
    copy: "Formerly Saigon, this dizzying metropolis is the economic engine of Vietnam, where sleek skyscrapers stand beside historic French cathedrals. It is a city that never sleeps, offering world-class dining, rooftop bars, and the somber history of the War Remnants Museum.",
    tags: ["Skyscrapers", "Dining", "War Remnants"],
    bestFor: "Urban energy, dining, nightlife, and southern gateway convenience",
    signatureStops: ["District 1", "War Remnants", "Rooftop bars"]
  },
  vung_tau: {
    label: "Vũng Tàu",
    region: "southern_vietnam",
    provinceIds: ["VN43"],
    markerId: "VN43",
    copy: "A popular weekend getaway for city dwellers, this peninsula offers refreshing sea breezes and an easygoing waterfront promenade. It is well-known for the giant Jesus Christ statue overlooking the ocean and its bustling local fish markets.",
    tags: ["Weekend", "Waterfront", "Fish markets"],
    bestFor: "Easy coastal resets from the city with local seafood and sea breeze",
    signatureStops: ["Waterfront", "Fish markets", "Jesus statue"]
  },
  mekong_delta: {
    label: "Mekong Delta",
    region: "southern_vietnam",
    provinceIds: ["VNCT", "VN44", "VN45", "VN46", "VN47", "VN49", "VN50", "VN51", "VN52", "VN55", "VN59", "VN73"],
    markerId: "VNCT",
    copy: "Known as the Rice Bowl of Vietnam, this vast network of rivers and canals is home to iconic floating markets and lush fruit orchards. Life revolves entirely around the water, creating a unique cultural landscape best explored by small boat.",
    tags: ["Rice Bowl", "Floating markets", "Canals"],
    bestFor: "Water-led culture, orchard landscapes, and softer boat-based travel",
    signatureStops: ["Floating markets", "Canals", "Fruit orchards"]
  },
  phu_quoc: {
    label: "Phú Quốc",
    region: "southern_vietnam",
    provinceIds: ["VN47"],
    markerId: "VN47",
    copy: "This large tropical island in the Gulf of Thailand is prized for its white-sand beaches, turquoise waters, and luxury resorts. Beyond the coast, travelers can explore the dense national park or learn about the island's famous fish sauce and pearl farms.",
    tags: ["White-sand beaches", "National park", "Pearl farms"],
    bestFor: "Island stays, beach time, and tropical luxury finishes",
    signatureStops: ["White-sand beaches", "National park", "Pearl farms"]
  },
  ca_mau: {
    label: "Cà Mau",
    region: "southern_vietnam",
    provinceIds: ["VN59"],
    markerId: "VN59",
    copy: "Located at the southernmost tip of Vietnam, this province is a wild landscape of mangroves and swampy wetlands. It is a symbolic destination representing the end of the Vietnamese mainland, where the forest meets the sea.",
    tags: ["Southern tip", "Mangroves", "Wetlands"],
    bestFor: "Remote-edge travelers who want mangroves, wetlands, and symbolism",
    signatureStops: ["Mangroves", "Wetlands", "Southern tip"]
  }
};

const provinceToRegion = Object.entries(regionGroups).reduce((accumulator, [region, ids]) => {
  for (const id of ids) {
    accumulator[id] = region;
  }
  return accumulator;
}, {});

let appConfig = {
  mode: "demo",
  agency: {
    name: "Fill The Map",
    email: "",
    whatsapp: "",
    bookingLink: ""
  }
};

const mapState = {
  scale: 1,
  minScale: 1,
  maxScale: 3.2,
  translateX: 0,
  translateY: 0,
  dragging: false,
  dragMoved: false,
  pointerId: null,
  startX: 0,
  startY: 0,
  originX: 0,
  originY: 0
};

boot();

async function boot() {
  bindRegionChips();
  bindZoomControls();
  await loadVietnamMap();
  syncRegionOverview(regionInput.value);
  window.addEventListener("resize", handleViewportResize);

  try {
    const response = await fetch("/api/config");
    if (!response.ok) {
      throw new Error("Failed to load config");
    }

    appConfig = await response.json();
    modeIndicator.textContent =
      appConfig.mode === "grounded"
        ? "Gemini grounded mode is active."
        : "Demo mode is active. Add GEMINI_API_KEY for live regional itineraries.";
  } catch {
    modeIndicator.textContent = "Config unavailable. The page can still run locally.";
  }
}

function bindRegionChips() {
  for (const chip of regionChips) {
    chip.addEventListener("click", () => {
      syncRegionOverview(chip.dataset.regionChip);
    });
  }
}

function bindZoomControls() {
  for (const button of zoomButtons) {
    button.addEventListener("click", () => {
      const action = button.dataset.zoomAction;
      if (action === "reset") {
        resetMapZoom();
        return;
      }

      zoomBy(action === "in" ? 0.24 : -0.24);
    });
  }
}

function syncDestinationUI(destinationKey) {
  const destination = destinationCatalog[destinationKey] || destinationCatalog.ha_noi;
  destinationInput.value = destinationKey;
  regionInput.value = destination.region;
  regionTitle.textContent = destination.label;
  regionCopy.textContent = destination.copy;
  regionTags.innerHTML = destination.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");
  focusBestFor.textContent = destination.bestFor;
  focusSignatureList.innerHTML = destination.signatureStops.map((item) => `<span>${escapeHtml(item)}</span>`).join("");

  for (const chip of regionChips) {
    chip.classList.toggle("active", chip.dataset.regionChip === destination.region);
  }

  const svg = mapHost.querySelector("svg");
  if (!svg) {
    return;
  }

  const selectedIds = new Set(destination.provinceIds);
  const allDestinationProvinceIds = new Set(Object.values(destinationCatalog).flatMap((item) => item.provinceIds));
  const provincePaths = svg.querySelectorAll("#features path");

  for (const path of provincePaths) {
    const active = selectedIds.has(path.id);
    const selectable = allDestinationProvinceIds.has(path.id);
    path.classList.toggle("region-active", active);
    path.classList.toggle("destination-linked", selectable);
    path.classList.toggle("region-muted", !active && !selectable);
  }

  const markers = svg.querySelectorAll(".destination-marker");
  for (const marker of markers) {
    marker.classList.toggle("active", marker.dataset.destination === destinationKey);
  }
}

function syncRegionOverview(region) {
  const meta = regionMeta[region] || regionMeta.northern_vietnam;
  destinationInput.value = "";
  regionInput.value = region;
  regionTitle.textContent = meta.title;
  regionCopy.textContent = meta.copy;
  regionTags.innerHTML = meta.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");
  focusBestFor.textContent = meta.bestFor;
  focusSignatureList.innerHTML = meta.signatureStops.map((item) => `<span>${escapeHtml(item)}</span>`).join("");

  for (const chip of regionChips) {
    chip.classList.toggle("active", chip.dataset.regionChip === region);
  }

  const svg = mapHost.querySelector("svg");
  if (!svg) {
    return;
  }

  const selectedIds = new Set(regionGroups[region] || []);
  const allDestinationProvinceIds = new Set(Object.values(destinationCatalog).flatMap((item) => item.provinceIds));
  const provincePaths = svg.querySelectorAll("#features path");

  for (const path of provincePaths) {
    const active = selectedIds.has(path.id);
    const selectable = allDestinationProvinceIds.has(path.id);
    path.classList.toggle("region-active", active);
    path.classList.toggle("destination-linked", selectable);
    path.classList.toggle("region-muted", !active && !selectable);
  }

  const markers = svg.querySelectorAll(".destination-marker");
  for (const marker of markers) {
    marker.classList.remove("active");
  }
}

async function loadVietnamMap() {
  try {
    const response = await fetch("/assets/vn.svg");
    if (!response.ok) {
      throw new Error("Map asset unavailable");
    }

    const rawSvg = await response.text();
    mapHost.innerHTML = rawSvg;

    const svg = mapHost.querySelector("svg");
    if (!svg) {
      throw new Error("Map markup missing");
    }

    svg.classList.add("vietnam-map");
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    svg.removeAttribute("width");
    svg.removeAttribute("height");
    initializePanZoom();

    const labelPoints = svg.querySelector("#label_points");
    const markersLayer = createSvgElement("g");
    markersLayer.setAttribute("id", "ftm-destination-markers");
    svg.appendChild(markersLayer);

    for (const [destinationKey, destination] of Object.entries(destinationCatalog)) {
      const anchor = labelPoints?.querySelector(`#${CSS.escape(destination.markerId)}`);
      if (!anchor) {
        continue;
      }

      const marker = createDestinationMarker(destinationKey, destination, Number(anchor.getAttribute("cx")), Number(anchor.getAttribute("cy")));
      markersLayer.appendChild(marker);
    }

    const provincePaths = svg.querySelectorAll("#features path");
    for (const path of provincePaths) {
      const destinationKey = Object.entries(destinationCatalog).find(([, destination]) => destination.provinceIds.includes(path.id))?.[0];
      if (!destinationKey) {
        path.classList.add("region-muted");
        continue;
      };

      path.setAttribute("tabindex", "0");
      path.setAttribute("role", "button");
      path.setAttribute("aria-label", path.getAttribute("name") || path.id);

      const assignDestination = () => {
        if (mapState.dragMoved) {
          mapState.dragMoved = false;
          return;
        }
        syncDestinationUI(destinationKey);
      };

      path.addEventListener("click", assignDestination);
      path.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          assignDestination();
        }
      });
    }
  } catch {
    mapHost.innerHTML = `<p class="map-loading">Vietnam map could not be loaded.</p>`;
  }
}

function createDestinationMarker(destinationKey, destination, cx, cy) {
  const group = createSvgElement("g");
  const circle = createSvgElement("circle");
  const text = createSvgElement("text");
  const markerRadius = destination.label.length > 11 ? 9 : 8;

  group.setAttribute("class", "destination-marker");
  group.dataset.destination = destinationKey;
  group.setAttribute("role", "button");
  group.setAttribute("tabindex", "0");
  group.setAttribute("aria-label", destination.label);

  circle.setAttribute("cx", String(cx));
  circle.setAttribute("cy", String(cy));
  circle.setAttribute("r", String(markerRadius));

  text.setAttribute("x", String(cx + 14));
  text.setAttribute("y", String(cy + 6));
  text.textContent = destination.label;

  const select = () => {
    if (mapState.dragMoved) {
      mapState.dragMoved = false;
      return;
    }
    syncDestinationUI(destinationKey);
  };

  group.append(circle, text);
  group.addEventListener("click", select);
  group.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      select();
    }
  });

  return group;
}

function createSvgElement(tag) {
  return document.createElementNS("http://www.w3.org/2000/svg", tag);
}

function initializePanZoom() {
  resetMapZoom();

  mapHost.addEventListener("wheel", handleMapWheel, { passive: false });
  mapHost.addEventListener("pointerdown", handlePointerDown);
  mapHost.addEventListener("pointermove", handlePointerMove);
  mapHost.addEventListener("pointerup", finishDrag);
  mapHost.addEventListener("pointercancel", finishDrag);
}

function handleMapWheel(event) {
  if (!mapHost.querySelector("svg")) {
    return;
  }

  event.preventDefault();
  zoomBy(event.deltaY < 0 ? 0.18 : -0.18);
}

function handlePointerDown(event) {
  if (mapState.scale <= 1 || !mapHost.querySelector("svg")) {
    return;
  }

  mapState.dragging = true;
  mapState.dragMoved = false;
  mapState.pointerId = event.pointerId;
  mapState.startX = event.clientX;
  mapState.startY = event.clientY;
  mapState.originX = mapState.translateX;
  mapState.originY = mapState.translateY;
  mapHost.querySelector("svg")?.classList.add("is-dragging");
  mapHost.setPointerCapture(event.pointerId);
}

function handlePointerMove(event) {
  if (!mapState.dragging || event.pointerId !== mapState.pointerId) {
    return;
  }

  mapState.translateX = mapState.originX + (event.clientX - mapState.startX);
  mapState.translateY = mapState.originY + (event.clientY - mapState.startY);
  mapState.dragMoved = Math.abs(event.clientX - mapState.startX) > 3 || Math.abs(event.clientY - mapState.startY) > 3;
  applyMapTransform();
}

function finishDrag(event) {
  if (!mapState.dragging) {
    return;
  }

  if (event.pointerId && event.pointerId !== mapState.pointerId) {
    return;
  }

  if (mapState.pointerId !== null && mapHost.hasPointerCapture(mapState.pointerId)) {
    mapHost.releasePointerCapture(mapState.pointerId);
  }

  mapState.dragging = false;
  mapState.pointerId = null;
  mapHost.querySelector("svg")?.classList.remove("is-dragging");
  applyMapTransform();
}

function zoomBy(delta) {
  const nextScale = clamp(mapState.scale + delta, mapState.minScale, mapState.maxScale);
  if (nextScale === mapState.scale) {
    return;
  }

  mapState.scale = nextScale;

  if (mapState.scale <= 1) {
    mapState.translateX = 0;
    mapState.translateY = 0;
  }

  applyMapTransform();
}

function resetMapZoom() {
  mapState.scale = 1;
  mapState.translateX = 0;
  mapState.translateY = 0;
  applyMapTransform();
}

function applyMapTransform() {
  const svg = mapHost.querySelector("svg");
  if (!svg) {
    return;
  }

  const { x, y } = clampPan(svg, mapState.translateX, mapState.translateY);
  mapState.translateX = x;
  mapState.translateY = y;
  svg.style.transform = `translate(${mapState.translateX}px, ${mapState.translateY}px) scale(${mapState.scale})`;
}

function clampPan(svg, translateX, translateY) {
  if (mapState.scale <= 1) {
    return { x: 0, y: 0 };
  }

  const hostRect = mapHost.getBoundingClientRect();
  const svgRect = svg.getBoundingClientRect();
  const baseWidth = svgRect.width / mapState.scale;
  const baseHeight = svgRect.height / mapState.scale;
  const scaledWidth = baseWidth * mapState.scale;
  const scaledHeight = baseHeight * mapState.scale;
  const maxX = Math.abs(scaledWidth - hostRect.width) / 2 + 24;
  const maxY = Math.abs(scaledHeight - hostRect.height) / 2 + 24;

  return {
    x: clamp(translateX, -maxX, maxX),
    y: clamp(translateY, -maxY, maxY)
  };
}

function handleViewportResize() {
  applyMapTransform();
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const payload = Object.fromEntries(formData.entries());
  const submitButton = form.querySelector("button[type='submit']");
  let tick = 0;

  submitButton.disabled = true;
  renderLoading(progressMessages[0]);

  const intervalId = window.setInterval(() => {
    tick = (tick + 1) % progressMessages.length;
    renderLoading(progressMessages[tick]);
  }, 1800);

  try {
    const response = await fetch("/api/itinerary", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Unable to build itinerary");
    }

    window.clearInterval(intervalId);
    renderItinerary(data);
  } catch (error) {
    window.clearInterval(intervalId);
    renderError(error.message);
  } finally {
    submitButton.disabled = false;
  }
});

function renderLoading(message) {
  resultShell.innerHTML = `
    <div class="status-card">
      <p class="panel-kicker">Building</p>
      <h2>Designing the route.</h2>
      <p class="result-note">${escapeHtml(message)}</p>
      <div class="status-meter"><span></span></div>
    </div>
  `;
}

function renderError(message) {
  resultShell.innerHTML = `
    <div class="status-card">
      <p class="panel-kicker">Problem</p>
      <h2>The itinerary did not finish.</h2>
      <p class="result-note">${escapeHtml(message)}</p>
    </div>
  `;
}

function renderItinerary(data) {
  const { itinerary, mode, sources = [] } = data;
  const actionButtons = buildActionButtons(itinerary.tripTitle);
  const sourcesMarkup = sources.length
    ? `
      <section class="sources-card">
        <p class="panel-kicker">Grounded sources</p>
        <div class="sources-list">
          ${sources
            .map(
              (source) => `
                <a href="${escapeAttribute(source.uri)}" target="_blank" rel="noreferrer">
                  ${escapeHtml(source.title || source.uri)}
                </a>
              `
            )
            .join("")}
        </div>
      </section>
    `
    : "";

  resultShell.innerHTML = `
    <section class="result-header">
      <div class="result-topbar">
        <span class="mode-pill">${mode === "grounded" ? "Gemini grounded" : "Demo itinerary"}</span>
        <div class="tag-row">
          ${itinerary.choiceSnapshot
            .map((choice) => `<span class="choice-pill">${escapeHtml(choice)}</span>`)
            .join("")}
        </div>
      </div>
      <div>
        <p class="panel-kicker">Best-fit itinerary</p>
        <h2>${escapeHtml(itinerary.tripTitle)}</h2>
      </div>
      <p class="result-intro">${escapeHtml(itinerary.summary)}</p>
      <div class="summary-grid">
        <article class="summary-card">
          <p class="mini-label">Per person</p>
          <p class="mini-value">${escapeHtml(itinerary.price.perPersonEstimate)}</p>
          <p class="mini-copy">${escapeHtml(itinerary.price.pricingBasis)}</p>
        </article>
        <article class="summary-card">
          <p class="mini-label">Whole trip</p>
          <p class="mini-value">${escapeHtml(itinerary.price.totalTripEstimate)}</p>
          <p class="mini-copy">${escapeHtml(itinerary.price.totalBasis)}</p>
        </article>
      </div>
      <article class="fit-card">
        <p class="mini-label">Why it fits</p>
        <p class="fit-card-copy">${escapeHtml(itinerary.fitSummary)}</p>
        <p class="mini-copy">One clear route. Easy to react to. Easy to customize.</p>
      </article>
      <div class="action-row">
        ${actionButtons}
      </div>
    </section>

    <section class="detail-grid">
      <article class="detail-card">
        <p class="panel-kicker">Destinations</p>
        <ul>
          ${itinerary.destinations
            .map(
              (destination) => `
                <li>
                  <strong>${escapeHtml(destination.name)}</strong>: ${escapeHtml(destination.reason)}
                  <br />
                  Hidden gem: ${escapeHtml(destination.hiddenGem)}
                </li>
              `
            )
            .join("")}
        </ul>
      </article>
      <article class="detail-card">
        <p class="panel-kicker">Stays</p>
        <ul>
          ${itinerary.stays
            .map(
              (stay) => `
                <li>
                  <strong>${escapeHtml(stay.destination)}</strong>: ${escapeHtml(stay.name)}.
                  ${escapeHtml(stay.note)}
                </li>
              `
            )
            .join("")}
        </ul>
      </article>
      <article class="detail-card">
        <p class="panel-kicker">Restaurants</p>
        <ul>
          ${itinerary.restaurants
            .map(
              (restaurant) => `
                <li>
                  <strong>${escapeHtml(restaurant.name)}</strong> in ${escapeHtml(restaurant.destination)}:
                  ${escapeHtml(restaurant.whyVisit)}
                </li>
              `
            )
            .join("")}
        </ul>
      </article>
      <article class="detail-card">
        <p class="panel-kicker">Transport + services</p>
        <ul>
          ${itinerary.transport.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
          ${itinerary.servicesIncluded.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
        </ul>
      </article>
    </section>

    ${itinerary.days
      .map(
        (day) => `
          <article class="day-card">
            <div class="day-topline">
              <span class="day-number">Day ${escapeHtml(String(day.dayNumber))}</span>
              <span class="day-route">${escapeHtml(day.route)}</span>
            </div>
            <h3>${escapeHtml(day.title)}</h3>
            <p class="detail-text">${escapeHtml(day.summary)}</p>
            <div class="pill-row">
              <span class="mini-pill">Stay: ${escapeHtml(day.stay)}</span>
              <span class="mini-pill">Transport: ${escapeHtml(day.transport)}</span>
              <span class="mini-pill">Meals: ${escapeHtml(day.meals)}</span>
            </div>
            <ul>
              ${day.highlights.map((highlight) => `<li>${escapeHtml(highlight)}</li>`).join("")}
            </ul>
            <p class="result-note"><strong>Hidden gem:</strong> ${escapeHtml(day.hiddenGem)}</p>
          </article>
        `
      )
      .join("")}

    <section class="detail-grid">
      <article class="detail-card">
        <p class="panel-kicker">Included</p>
        <ul>
          ${itinerary.servicesIncluded.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
        </ul>
      </article>
      <article class="detail-card">
        <p class="panel-kicker">Not included</p>
        <ul>
          ${itinerary.servicesExcluded.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
        </ul>
      </article>
    </section>

    ${sourcesMarkup}
  `;
}

function buildActionButtons(tripTitle) {
  const subjectBase = encodeURIComponent(`${tripTitle} | Fill The Map`);
  const customText = encodeURIComponent(`I want to customize this itinerary: ${tripTitle}`);
  const bookText = encodeURIComponent(`I want to book this itinerary: ${tripTitle}`);
  const email = appConfig.agency.email;
  const bookingLink = appConfig.agency.bookingLink;
  const whatsapp = normalizeWhatsapp(appConfig.agency.whatsapp);

  const talkButton = email
    ? `<a class="primary-button" href="mailto:${escapeAttribute(email)}?subject=${subjectBase}&body=${customText}">Talk to the agency</a>`
    : `<button class="primary-button" type="button" disabled>Talk to the agency</button>`;

  const bookButton = bookingLink
    ? `<a class="ghost-button" href="${escapeAttribute(bookingLink)}" target="_blank" rel="noreferrer">Buy the service</a>`
    : whatsapp
      ? `<a class="ghost-button" href="https://wa.me/${escapeAttribute(whatsapp)}?text=${bookText}" target="_blank" rel="noreferrer">Buy the service</a>`
      : `<button class="ghost-button" type="button" disabled>Buy the service</button>`;

  return `${talkButton}${bookButton}`;
}

function normalizeWhatsapp(value) {
  return (value || "").replace(/[^\d]/g, "");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttribute(value) {
  return escapeHtml(value);
}
