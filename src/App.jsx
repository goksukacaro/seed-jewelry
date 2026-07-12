import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import { Flower2, MapPin, MapPinned, Pencil, Route, Sprout, Sun } from "lucide-react";
import "leaflet/dist/leaflet.css";

const ringStyles = [
  {
    id: "wave",
    name: "Moss Wave",
    image: "/assets/ring-wave-figma.png",
    cardImage: "/assets/ring-wave-figma.png",
    description: "A soft open form with warm translucent edges.",
  },
  {
    id: "arch",
    name: "Pollinator Arch",
    image: "/assets/ring-arch-clean-transparent.png",
    cardImage: "/assets/ring-arch-clean-transparent.png",
    description: "A squared profile with carved civic passageways.",
  },
  {
    id: "reef",
    name: "Reef Bloom",
    image: "/assets/ring-reef-figma.png",
    cardImage: "/assets/ring-reef-figma.png",
    description: "A botanical crown shaped like a small habitat.",
  },
  {
    id: "gemstone",
    name: "Seed Facet",
    image: "/assets/ring-gemstone-figma.png",
    cardImage: "/assets/ring-gemstone-figma.png",
    description: "A compact faceted ring with dense seed visibility.",
  },
];

const coverageColors = {
  good: "#3f7d5a",
  need: "#cf8b18",
  critical: "#bd4b4b",
};

const seedColors = {
  knapweed: "#6f4aa8",
  mallow: "#df5d3f",
  yarrow: "#d58a00",
  thyme: "#2f7a55",
  sage: "#6e54aa",
  cornflower: "#3f6fb5",
  milkweed: "#d65f3d",
  bergamot: "#9a2c73",
  aster: "#7a3fa0",
};

const seedFlowerImages = {
  knapweed: "/assets/flowers/knapweed.webp",
  mallow: "/assets/flowers/mallow.webp",
  yarrow: "/assets/flowers/yarrow.webp",
  thyme: "/assets/flowers/thyme.webp",
  sage: "/assets/flowers/sage.webp",
  cornflower: "/assets/flowers/cornflower.webp",
  milkweed: "/assets/flowers/milkweed.webp",
  bergamot: "/assets/flowers/bergamot.webp",
  aster: "/assets/flowers/aster.webp",
};

function SeedFlowerThumbnail({ seed }) {
  const image = seedFlowerImages[seed.id] ?? seedFlowerImages.knapweed;

  return (
    <span className="seed-flower-thumb">
      <img src={image} alt={`${seed.name} flower`} loading="lazy" decoding="async" />
    </span>
  );
}

const cityData = {
  berlin: {
    city: "Berlin",
    region: "Temperate Central European lowland",
    short: "Fragmented parks, rail edges, and balcony gardens can become stepping stones for bees and butterflies.",
    corridor: "Volkspark Friedrichshain to Tempelhofer Feld",
    mapView: { center: [52.503, 13.407], zoom: 12 },
    seeds: [
      {
        id: "knapweed",
        name: "Brown knapweed",
        pollinators: "solitary bees, hoverflies",
        bloom: "June to September",
        rationale: "Strong late-season nectar helps bridge gaps after spring plantings fade.",
      },
      {
        id: "mallow",
        name: "Common mallow",
        pollinators: "wild bees, small butterflies",
        bloom: "May to October",
        rationale: "Tolerates disturbed city soil and supports long bloom continuity.",
      },
      {
        id: "yarrow",
        name: "Yarrow",
        pollinators: "hoverflies, tiny bees",
        bloom: "June to August",
        rationale: "Compact flower clusters work well in small shared beds and tree pits.",
      },
    ],
    spots: [
      {
        name: "Kottbusser Tor tree pits",
        area: "Kreuzberg",
        seedId: "mallow",
        urgency: "High gap",
        reason: "Small soil pockets can connect balcony planting with canal-side greenery.",
        lat: 52.499,
        lng: 13.418,
        x: 42,
        y: 58,
      },
      {
        name: "Gleisdreieck south edge",
        area: "Schoeneberg",
        seedId: "knapweed",
        urgency: "Late nectar",
        reason: "A rail-side corridor needs summer bloom to pull pollinators toward open park habitat.",
        lat: 52.497,
        lng: 13.373,
        x: 53,
        y: 67,
      },
      {
        name: "Weberwiese courtyards",
        area: "Friedrichshain",
        seedId: "yarrow",
        urgency: "Stepping stone",
        reason: "Dense residential blocks need small flowering patches between larger green spaces.",
        lat: 52.516,
        lng: 13.443,
        x: 64,
        y: 42,
      },
    ],
    densityZones: [
      { seedId: "knapweed", label: "Tempelhofer edge", status: "good", count: 87, lat: 52.475, lng: 13.404, radius: 780 },
      { seedId: "knapweed", label: "Gleisdreieck beds", status: "need", count: 22, lat: 52.497, lng: 13.373, radius: 560 },
      { seedId: "mallow", label: "Kottbusser tree pits", status: "critical", count: 9, lat: 52.499, lng: 13.418, radius: 520 },
      { seedId: "mallow", label: "Maybachufer canal bank", status: "need", count: 24, lat: 52.493, lng: 13.425, radius: 600 },
      { seedId: "yarrow", label: "Weberwiese courtyards", status: "need", count: 18, lat: 52.516, lng: 13.443, radius: 520 },
      { seedId: "yarrow", label: "Hasenheide meadow border", status: "good", count: 63, lat: 52.486, lng: 13.416, radius: 620 },
    ],
  },
  istanbul: {
    city: "Istanbul",
    region: "Marmara transition zone",
    short: "Coastal winds, steep streets, and pocket gardens create a corridor problem across hard urban edges.",
    corridor: "Macka Park to Kadikoy shoreline gardens",
    mapView: { center: [41.019, 29.013], zoom: 12 },
    seeds: [
      {
        id: "thyme",
        name: "Wild thyme",
        pollinators: "honeybees, solitary bees",
        bloom: "May to July",
        rationale: "Aromatic low growth suits dry exposed edges and compact containers.",
      },
      {
        id: "sage",
        name: "Meadow sage",
        pollinators: "bumblebees, butterflies",
        bloom: "May to August",
        rationale: "Deep flowers support larger pollinators moving through sunny neighborhood gaps.",
      },
      {
        id: "cornflower",
        name: "Cornflower",
        pollinators: "bees, hoverflies",
        bloom: "June to September",
        rationale: "Fast color and accessible nectar make it useful for visible community planting.",
      },
    ],
    spots: [
      {
        name: "Macka stair gardens",
        area: "Sisli",
        seedId: "sage",
        urgency: "Slope gap",
        reason: "Sunny stair edges can extend park habitat into dense streets.",
        lat: 41.047,
        lng: 28.991,
        x: 35,
        y: 48,
      },
      {
        name: "Moda shoreline planters",
        area: "Kadikoy",
        seedId: "thyme",
        urgency: "Dry edge",
        reason: "Windy planters need hardy aromatic flowers that tolerate exposed coastal conditions.",
        lat: 40.985,
        lng: 29.025,
        x: 68,
        y: 61,
      },
      {
        name: "Yeldegirmeni school beds",
        area: "Kadikoy",
        seedId: "cornflower",
        urgency: "Community link",
        reason: "A school garden can become a visible pollinator stop between streets and shoreline.",
        lat: 40.997,
        lng: 29.03,
        x: 59,
        y: 38,
      },
    ],
    densityZones: [
      { seedId: "thyme", label: "Moda shoreline planters", status: "critical", count: 11, lat: 40.985, lng: 29.025, radius: 600 },
      { seedId: "thyme", label: "Cihangir dry edges", status: "good", count: 54, lat: 41.031, lng: 28.982, radius: 520 },
      { seedId: "sage", label: "Macka stair gardens", status: "need", count: 28, lat: 41.047, lng: 28.991, radius: 560 },
      { seedId: "sage", label: "Fenerbahce sunny beds", status: "good", count: 66, lat: 40.974, lng: 29.044, radius: 620 },
      { seedId: "cornflower", label: "Yeldegirmeni school beds", status: "critical", count: 8, lat: 40.997, lng: 29.03, radius: 520 },
      { seedId: "cornflower", label: "Karakoy pocket planters", status: "need", count: 21, lat: 41.024, lng: 28.977, radius: 500 },
    ],
  },
  newyork: {
    city: "New York",
    region: "Northeastern coastal urban plain",
    short: "Street trees, community gardens, and waterfront parks can form a distributed pollinator ladder.",
    corridor: "Prospect Park to East River green edges",
    mapView: { center: [40.69, -73.975], zoom: 12 },
    seeds: [
      {
        id: "milkweed",
        name: "Butterfly milkweed",
        pollinators: "monarch butterflies, native bees",
        bloom: "June to August",
        rationale: "Supports monarch life cycles and creates bright, legible habitat patches.",
      },
      {
        id: "bergamot",
        name: "Wild bergamot",
        pollinators: "bees, butterflies",
        bloom: "July to September",
        rationale: "Extends nectar supply through hot urban summers and works in community beds.",
      },
      {
        id: "aster",
        name: "New York aster",
        pollinators: "late-season bees",
        bloom: "August to October",
        rationale: "Late bloom keeps corridors active when many ornamental plantings are finished.",
      },
    ],
    spots: [
      {
        name: "Fourth Avenue tree guards",
        area: "Park Slope",
        seedId: "aster",
        urgency: "Autumn gap",
        reason: "Street-tree beds can carry late-season nectar between Prospect Park and smaller gardens.",
        lat: 40.672,
        lng: -73.989,
        x: 44,
        y: 66,
      },
      {
        name: "McCarren community beds",
        area: "Williamsburg",
        seedId: "bergamot",
        urgency: "Mid-summer link",
        reason: "Shared garden beds can connect north Brooklyn pollinator movement toward the waterfront.",
        lat: 40.721,
        lng: -73.951,
        x: 63,
        y: 42,
      },
      {
        name: "Red Hook waterfront planters",
        area: "Brooklyn",
        seedId: "milkweed",
        urgency: "Monarch stop",
        reason: "Open waterfront planters create visible host and nectar stops along a hard industrial edge.",
        lat: 40.676,
        lng: -74.009,
        x: 51,
        y: 78,
      },
    ],
    densityZones: [
      { seedId: "milkweed", label: "Red Hook waterfront planters", status: "critical", count: 7, lat: 40.676, lng: -74.009, radius: 560 },
      { seedId: "milkweed", label: "Prospect meadow edge", status: "good", count: 72, lat: 40.661, lng: -73.969, radius: 720 },
      { seedId: "bergamot", label: "McCarren community beds", status: "need", count: 24, lat: 40.721, lng: -73.951, radius: 540 },
      { seedId: "bergamot", label: "Fort Greene planters", status: "good", count: 58, lat: 40.691, lng: -73.974, radius: 520 },
      { seedId: "aster", label: "Fourth Avenue tree guards", status: "critical", count: 10, lat: 40.672, lng: -73.989, radius: 620 },
      { seedId: "aster", label: "East River late beds", status: "need", count: 19, lat: 40.704, lng: -73.994, radius: 500 },
    ],
  },
};

const communityEntries = [
  {
    city: "Berlin",
    name: "Anika",
    note: "Buried near an old canal path. I hope something grows where people already slow down.",
  },
  {
    city: "Istanbul",
    name: "Derya",
    note: "A small band of thyme went into a windy planter by the ferry line.",
  },
  {
    city: "New York",
    name: "Mira",
    note: "I chose late asters because the map showed a gap after summer blooms.",
  },
];

function App() {
  const [cityKey, setCityKey] = useState("berlin");
  const [ringId, setRingId] = useState("wave");
  const [seedId, setSeedId] = useState(cityData.berlin.seeds[0].id);
  const [mapSeedFilterId, setMapSeedFilterId] = useState(cityData.berlin.seeds[0].id);
  const [mapCoverageFilter, setMapCoverageFilter] = useState(null);
  const [activeMapSpotName, setActiveMapSpotName] = useState("");
  const [email, setEmail] = useState("");
  const [formState, setFormState] = useState({ status: "idle", message: "" });

  const city = cityData[cityKey];
  const selectedSeed = city.seeds.find((seed) => seed.id === seedId) ?? city.seeds[0];
  const selectedRing = ringStyles.find((ring) => ring.id === ringId) ?? ringStyles[0];
  const matchedSpots = useMemo(() => {
    const preferred = city.spots.filter((spot) => spot.seedId === selectedSeed.id);
    const others = city.spots.filter((spot) => spot.seedId !== selectedSeed.id);
    return [...preferred, ...others].slice(0, 3);
  }, [city, selectedSeed.id]);

  function updateCity(nextCityKey) {
    const nextCity = cityData[nextCityKey];
    setCityKey(nextCityKey);
    setSeedId(nextCity.seeds[0].id);
  }

  useEffect(() => {
    setMapSeedFilterId(seedId);
    setMapCoverageFilter(null);
    setActiveMapSpotName("");
  }, [cityKey, seedId]);

  async function handleWaitlist(event) {
    event.preventDefault();
    const trimmed = email.trim();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
    if (!valid) {
      setFormState({ status: "error", message: "Enter a valid email to follow the corridor." });
      return;
    }

    const endpoint = import.meta.env.VITE_WAITLIST_ENDPOINT;
    if (endpoint) {
      setFormState({ status: "loading", message: "Joining the corridor..." });
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: trimmed,
            city: city.city,
            seedType: selectedSeed.name,
            source: "seedring-home",
          }),
        });
        if (!response.ok) throw new Error("Waitlist request failed");
      } catch {
        setFormState({
          status: "error",
          message: "The waitlist endpoint did not respond. Your selection is still saved locally.",
        });
        return;
      }
    }

    setFormState({
      status: "success",
      message: `${city.city} noted. We will send the ${selectedSeed.name} corridor brief.`,
    });
    setEmail("");
  }

  return (
    <main>
      <Header />
      <section className="hero botanical-hero" id="home" aria-labelledby="hero-title">
        <div className="hero-copy">
          <h1 id="hero-title">Wear the future you want to grow.</h1>
          <p className="hero-text">
            SeedRing pieces carry native seeds in a biocomposite form that dissolves, returning
            nutrients to soil and life to your city.
          </p>
          <div className="hero-actions">
            <a className="button primary" href="#waitlist">Join the waitlist</a>
            <a className="button secondary" href="#piece">Customize your piece</a>
          </div>
        </div>
      </section>

      <section className="process section" id="process" aria-labelledby="process-title">
        <div className="section-heading process-heading">
          <div>
            <div className="section-kicker">The process</div>
            <h2 id="process-title">A short life, designed with intention.</h2>
            <p className="process-heading-lede">
              Wear custom jewelry crafted from biodegradable materials embedded with native plant
              seeds. When you're ready, bury it in your neighborhood to help weave an urban
              biocorridor - a living network connecting green spaces across the city.
            </p>
          </div>
          <figure className="process-visual" aria-hidden="true">
            <img src="/assets/process-jewelry-sprout-cropped-transparent.png" alt="" loading="lazy" decoding="async" />
          </figure>
        </div>
        <div className="process-grid">
          {[
            { number: "01", title: "Customize your piece", text: "Select your preferred ring design, your bioregion, and seed type", Icon: Pencil },
            { number: "02", title: "Wear it", text: "Your ring carries living seeds. Wear it as long as you want - weeks, months, a season.", Icon: Sun },
            { number: "03", title: "Bury it", text: "When you're ready, our map recommends where to bury your piece to connect with your city's growing biocorridor.", Icon: Sprout },
          ].map(({ number, title, text, Icon }) => (
            <article className="process-step" key={number}>
              <span className="process-step-number">{number}</span>
              <Icon className="process-step-icon" aria-hidden="true" />
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section configurator" id="piece" aria-labelledby="piece-title">
        <div className="config-layout">
          <div className="config-left-stack">
            <div className="section-heading piece-heading">
              <div>
                <div className="section-kicker">Your piece</div>
                <h2 id="piece-title">Customize your piece</h2>
                <p className="piece-heading-lede">
                  Select your preferred ring design, your bioregion, and seed type. SeedRing then
                  routes the planted piece toward three corridor gaps.
                </p>
              </div>
            </div>

            <div className="config-panel">
              <fieldset className="city-field">
                <span className="field-label" id="city-select-label">Choose city</span>
                <CitySelect
                  labelId="city-select-label"
                  value={cityKey}
                  options={Object.entries(cityData).map(([key, entry]) => ({
                    value: key,
                    label: entry.city,
                    region: entry.region,
                  }))}
                  onChange={updateCity}
                />
              </fieldset>

              <div className="region-note">
                <span className="region-note-kicker">Bioregion</span>
                <strong>{city.region}</strong>
                <p>{city.short}</p>
              </div>

              <fieldset>
                <legend>Recommended seeds</legend>
                <div className="seed-list">
                  {city.seeds.map((seed) => {
                    const isSelected = seed.id === selectedSeed.id;
                    return (
                      <button
                        key={seed.id}
                        type="button"
                        className={isSelected ? "seed-card selected" : "seed-card"}
                        onClick={() => setSeedId(seed.id)}
                        aria-expanded={isSelected}
                      >
                        {isSelected ? <SeedFlowerThumbnail seed={seed} /> : null}
                        <strong>{seed.name}</strong>
                        <span>{seed.pollinators}</span>
                        <small>{seed.bloom}</small>
                        {isSelected ? (
                          <div className="seed-rationale-inline" aria-live="polite">
                            <span>Why this seed</span>
                            <p>{selectedSeed.rationale}</p>
                          </div>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            </div>
          </div>

          <div className="product-panel">
            <div className="product-hero-card">
              <div className="product-image-frame">
                <img src={selectedRing.image} alt={selectedRing.name} />
              </div>
              <div>
                <span>Selected design</span>
                <h3>{selectedRing.name}</h3>
                <p>{selectedRing.description}</p>
                <p className="selected-material">Biocomposite</p>
              </div>
            </div>

            <div className="ring-grid" aria-label="Ring design options">
              {ringStyles.map((ring) => (
                <button
                  key={ring.id}
                  type="button"
                  className={ring.id === ringId ? "ring-card selected" : "ring-card"}
                  onClick={() => setRingId(ring.id)}
                >
                  <div className="ring-image-frame">
                    <img src={ring.cardImage} alt="" />
                  </div>
                  <span>{ring.name}</span>
                </button>
              ))}
            </div>

            <aside className="piece-summary" aria-label="Your configured piece">
              <span className="piece-summary-kicker">Your piece</span>
              <p className="piece-summary-line">
                <span>{city.city}</span>
                <em>·</em>
                <span>{selectedSeed.name}</span>
                <em>·</em>
                <span>{selectedRing.name}</span>
                <em>·</em>
                <span>Biocomposite</span>
              </p>
              <p className="piece-summary-note">
                Carrying {selectedSeed.name.toLowerCase()} toward the {city.corridor} corridor — buryable in {selectedSeed.bloom.toLowerCase()}.
              </p>
            </aside>
          </div>
        </div>
      </section>

      <section className="section map-section" id="map" aria-labelledby="map-title">
        <div className="section-heading map-heading">
          <div>
            <div className="section-kicker">Find your spot</div>
            <h2 id="map-title">Where your piece belongs.</h2>
            <p className="map-heading-lede">
              Based on your seed selection and location, we show you where the biocorridor needs you most.
              Every buried piece is recorded — you are building the corridor together.
            </p>
          </div>
        </div>

        <div className="map-layout">
          <InteractiveSeedMap
            city={city}
            selectedSeed={selectedSeed}
            matchedSpots={matchedSpots}
            seedFilterId={mapSeedFilterId}
            coverageFilter={mapCoverageFilter}
            activeSpotName={activeMapSpotName}
            onSpotFocus={setActiveMapSpotName}
          />

          <div className="map-sidebar">
            <div className="map-panel-block">
              <span className="map-panel-title">Filters</span>
              <div className="filter-grid">
                {city.seeds.map((seed) => (
                  <button
                    key={seed.id}
                    type="button"
                    className={mapSeedFilterId === seed.id ? "filter-chip is-active" : "filter-chip"}
                    onClick={() => {
                      setSeedId(seed.id);
                      setMapSeedFilterId(seed.id);
                      setActiveMapSpotName("");
                    }}
                    aria-pressed={mapSeedFilterId === seed.id}
                  >
                    <i style={{ background: seedColors[seed.id] }} />
                    <span>{seed.name}</span>
                    <small>{city.densityZones.filter((zone) => zone.seedId === seed.id).length} zones</small>
                  </button>
                ))}
              </div>
              <div className="urgency-legend" aria-label="Urgency legend">
                {["good", "need", "critical"].map((status) => (
                  <button
                    key={status}
                    type="button"
                    className={mapCoverageFilter === status ? "urgency-chip is-active" : "urgency-chip"}
                    onClick={() => {
                      setMapCoverageFilter((current) => (current === status ? null : status));
                      setActiveMapSpotName("");
                    }}
                    aria-pressed={mapCoverageFilter === status}
                  >
                    <i style={{ background: coverageColors[status] }} />
                    <span>{coverageLabel(status)}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="map-panel-block">
              <span className="map-panel-title">Suggested spots</span>
              <div className="spot-list">
                {matchedSpots.map((spot, index) => {
                  const spotSeed = city.seeds.find((seed) => seed.id === spot.seedId);
                  const isActive = activeMapSpotName === spot.name;
                  return (
                    <button
                      className={[
                        "spot-card",
                        index === 0 ? "preferred" : "",
                        isActive ? "is-active" : "",
                      ].filter(Boolean).join(" ")}
                      key={spot.name}
                      type="button"
                      onClick={() => setActiveMapSpotName(spot.name)}
                      aria-pressed={isActive}
                    >
                      <span className="spot-number">0{index + 1}</span>
                      <div>
                        <div className="spot-meta">
                          <span>{spot.area}</span>
                          <strong>{spot.urgency}</strong>
                        </div>
                        <h3>{spot.name}</h3>
                        <p>{spot.reason}</p>
                        {spotSeed ? (
                          <span className="spot-best-match">
                            <i style={{ background: seedColors[spotSeed.id] }} aria-hidden="true" />
                            {spotSeed.name}
                          </span>
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="map-panel-block">
              <span className="map-panel-title">Recommendation</span>
              <p className="recommendation-copy">
                {matchedSpots[0]?.area} needs more pollinator pathways. Plant during {selectedSeed.bloom.toLowerCase()}.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section science" id="science" aria-labelledby="science-title">
        <div className="section-heading science-heading">
          <div>
            <div className="section-kicker" id="science-title">The science</div>
            <h2 className="science-heading-title">We collaborate with mother nature</h2>
            <p className="science-heading-lede">
              How the rings are designed to disappear, and why their disappearance is the point.
            </p>
          </div>
        </div>
        <div className="science-grid">
          <aside className="science-aside" aria-label="Science summary">
            <blockquote>
              <p>Seeds have always travelled.</p>
              <p>Through fur, through wind, through water. We are simply adding one more vector — the human body.</p>
            </blockquote>

            <div className="science-stats" aria-label="Seed Jewelry impact metrics">
              <div className="science-stat">
                <Flower2 className="science-stat-icon" aria-hidden="true" />
                <strong>47</strong>
                <span>Native species supported</span>
              </div>
              <div className="science-stat">
                <Route className="science-stat-icon" aria-hidden="true" />
                <strong>12 km</strong>
                <span>Corridor length when complete</span>
              </div>
              <div className="science-stat">
                <MapPinned className="science-stat-icon" aria-hidden="true" />
                <strong>3</strong>
                <span>Cities currently participating</span>
              </div>
              <div className="science-stat">
                <Sprout className="science-stat-icon" aria-hidden="true" />
                <strong>40%</strong>
                <span>More biodiversity in connected corridors</span>
              </div>
            </div>
          </aside>

          <div className="science-copy">
            <article>
              <h3>Seed dispersal</h3>
              <p>
                Plants have spent millions of years engineering relationships with other species to
                carry their seeds. Squirrels bury acorns and forget them. Birds eat berries and
                deposit them kilometers away. Every dispersal strategy is a negotiation between
                species — a quiet contract written in calories, shelter, and timing.
              </p>
            </article>
            <article>
              <h3>Biomaterials</h3>
              <p>
                Each Seed ring piece is cast from biocomposite materials that would dissolve at
                the same pace as the seed's germination window. The ring does not persist. It
                becomes soil leaving the seeds to blossom.
              </p>
            </article>
            <article>
              <h3>Biocorridors</h3>
              <p>
                Urban biocorridors are ecological networks that connect fragmented green spaces
                across a city. They allow species to move, breed, and adapt. A single connected
                corridor can support up to 40% more biodiversity than isolated green patches.
                Seed Jewelry maps and contributes to these corridors in real time.
              </p>
            </article>
            <figure className="science-photo" aria-label="Seed Jewelry corridor ring map with impact metrics">
              <img src="/assets/science-corridor-ring-map.png" alt="" />
            </figure>
          </div>
        </div>
        <p className="science-footnote">
          <span className="science-footnote-rule" aria-hidden="true" />
          Designed with ecologists, botanists, and urban planners
          <span className="science-footnote-rule" aria-hidden="true" />
        </p>
      </section>

      <section className="section community" id="community" aria-labelledby="community-title">
        <div className="section-heading centered">
          <div>
            <div className="section-kicker">The corridor</div>
            <h2 id="community-title">You are not alone in this.</h2>
          </div>
          <p>Every piece buried is a node in a growing network. Here is what the community has planted so far.</p>
        </div>
        <div className="community-row">
          {communityEntries.map((entry) => (
            <article key={`${entry.city}-${entry.name}`} className="community-card">
              <span className="community-card-city">
                <MapPin className="community-card-pin" aria-hidden="true" />
                {entry.city}
              </span>
              <h3>{entry.name}</h3>
              <p className="community-card-note">{entry.note}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="final-cta" id="waitlist" aria-labelledby="waitlist-title">
        <div>
          <div className="section-kicker">Follow the corridor</div>
          <h2 id="waitlist-title">Wear it. Bury it. Let it become.</h2>
        </div>
        <form onSubmit={handleWaitlist} noValidate>
          <label htmlFor="email">Email address</label>
          <div className="email-row">
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              placeholder="you@email.com"
              onChange={(event) => setEmail(event.target.value)}
              aria-describedby="form-message"
            />
            <button type="submit" disabled={formState.status === "loading"}>
              Join
            </button>
          </div>
          <p id="form-message" className={`form-message ${formState.status}`}>
            {formState.message || "One field note per season. Unsubscribe anytime."}
          </p>
        </form>
      </section>
      <Footer />
    </main>
  );
}

function InteractiveSeedMap({
  city,
  selectedSeed,
  matchedSpots,
  seedFilterId,
  coverageFilter,
  activeSpotName,
  onSpotFocus,
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const overlayRef = useRef(null);
  const previousCityRef = useRef("");
  const lastWheelZoomRef = useRef(Number.NEGATIVE_INFINITY);
  const modifierZoomKeyRef = useRef(false);
  const effectiveSeedId = seedFilterId;
  const effectiveCoverage = coverageFilter;
  const effectiveSpotName = activeSpotName;
  const statusSeed = city.seeds.find((seed) => seed.id === seedFilterId);
  const statusSpot = matchedSpots.find((spot) => spot.name === activeSpotName);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      zoomControl: true,
      scrollWheelZoom: false,
      zoomAnimation: true,
      preferCanvas: true,
    }).setView(city.mapView.center, city.mapView.zoom);

    const syncZoomLevel = () => {
      containerRef.current?.setAttribute("data-zoom-level", String(map.getZoom()));
    };
    const handleModifierWheelZoom = (event) => {
      if (!event.metaKey && !event.ctrlKey && !modifierZoomKeyRef.current) return;

      event.preventDefault();
      const now = window.performance.now();
      if (now - lastWheelZoomRef.current < 180) return;
      lastWheelZoomRef.current = now;

      const direction = event.deltaY < 0 ? 1 : -1;
      window.setTimeout(() => {
        const zoomControl = containerRef.current
          ?.closest(".map-shell")
          ?.querySelector(direction > 0 ? ".leaflet-control-zoom-in" : ".leaflet-control-zoom-out");
        zoomControl?.click();
      }, 0);
    };
    const handleModifierKeyDown = (event) => {
      if (event.key === "Meta" || event.key === "Control") {
        modifierZoomKeyRef.current = true;
      }
    };
    const handleModifierKeyUp = (event) => {
      if (event.key === "Meta" || event.key === "Control") {
        modifierZoomKeyRef.current = false;
      }
    };
    const resetModifierZoomKey = () => {
      modifierZoomKeyRef.current = false;
    };
    syncZoomLevel();
    map.on("zoomend", syncZoomLevel);
    containerRef.current.addEventListener("wheel", handleModifierWheelZoom, { capture: true, passive: false });
    window.addEventListener("keydown", handleModifierKeyDown);
    window.addEventListener("keyup", handleModifierKeyUp);
    window.addEventListener("blur", resetModifierZoomKey);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    overlayRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    setTimeout(() => map.invalidateSize(), 0);
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize({ pan: false });
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      containerRef.current?.removeEventListener("wheel", handleModifierWheelZoom, { capture: true });
      window.removeEventListener("keydown", handleModifierKeyDown);
      window.removeEventListener("keyup", handleModifierKeyUp);
      window.removeEventListener("blur", resetModifierZoomKey);
      map.off("zoomend", syncZoomLevel);
      map.remove();
      mapRef.current = null;
      overlayRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const overlay = overlayRef.current;
    if (!map || !overlay) return;

    overlay.clearLayers();
    const cityChanged = previousCityRef.current !== city.city;

    const selectedSeedZones = city.densityZones.filter((zone) => zone.seedId === effectiveSeedId);
    const otherZones = city.densityZones.filter((zone) => zone.seedId !== effectiveSeedId);
    const zones = [...otherZones, ...selectedSeedZones];

    zones.forEach((zone) => {
      const seed = city.seeds.find((item) => item.id === zone.seedId);
      const color = coverageColors[zone.status];
      const seedColor = seedColors[zone.seedId];
      const matchesSeed = !effectiveSeedId || zone.seedId === effectiveSeedId;
      const matchesCoverage = !effectiveCoverage || zone.status === effectiveCoverage;
      const isHighlighted = matchesSeed && matchesCoverage;
      const isSelectedSeed = zone.seedId === effectiveSeedId;

      L.circle([zone.lat, zone.lng], {
        radius: zone.radius,
        color,
        weight: isHighlighted ? 3 : 1,
        fillColor: color,
        fillOpacity: isHighlighted ? 0.28 : 0.045,
        opacity: isHighlighted ? 0.92 : 0.18,
      })
        .bindPopup(`
          <strong>${zone.label}</strong><br />
          ${seed?.name ?? "Seed mix"}<br />
          ${zone.count} planted records<br />
          ${coverageLabel(zone.status)}
        `, { autoPan: false })
        .addTo(overlay);

      L.circleMarker([zone.lat, zone.lng], {
        radius: isHighlighted || isSelectedSeed ? 6 : 3.5,
        color: "#ffffff",
        weight: isHighlighted ? 2 : 1.2,
        fillColor: seedColor,
        fillOpacity: isHighlighted ? 1 : 0.38,
      }).addTo(overlay);
    });

    matchedSpots.forEach((spot, index) => {
      const color = spot.seedId === selectedSeed.id ? coverageColors.critical : coverageColors.need;
      const html = `<span>${index + 1}</span>`;
      const isActive = spot.name === effectiveSpotName;
      const isMuted = Boolean(effectiveSpotName) && !isActive;

      const marker = L.marker([spot.lat, spot.lng], {
        icon: L.divIcon({
          className: [
            "recommendation-marker",
            isActive ? "is-active" : "",
            isMuted ? "is-muted" : "",
          ].filter(Boolean).join(" "),
          html,
          iconSize: isActive ? [46, 46] : [34, 34],
          iconAnchor: isActive ? [23, 23] : [17, 17],
        }),
      })
        .bindPopup(`
          <strong>${spot.name}</strong><br />
          ${spot.area}<br />
          ${spot.urgency}<br />
          ${spot.reason}
        `, { autoPan: false })
        .addTo(overlay);

      marker.on("click", () => onSpotFocus(spot.name));

      L.circle([spot.lat, spot.lng], {
        radius: isActive ? 330 : 210,
        color,
        weight: isActive ? 3 : 2,
        fillColor: color,
        fillOpacity: isMuted ? 0.06 : isActive ? 0.28 : 0.16,
        opacity: isMuted ? 0.22 : 0.72,
      }).addTo(overlay);
    });

    if (cityChanged) {
      const bounds = L.latLngBounds([
        ...city.densityZones.map((zone) => [zone.lat, zone.lng]),
        ...matchedSpots.map((spot) => [spot.lat, spot.lng]),
      ]);
      const boundsOptions = { padding: [42, 42], maxZoom: city.mapView.zoom + 1 };
      if (previousCityRef.current) {
        map.flyToBounds(bounds, {
          ...boundsOptions,
          animate: true,
          duration: 0.9,
          easeLinearity: 0.2,
        });
      } else {
        map.fitBounds(bounds, boundsOptions);
      }
    }
    previousCityRef.current = city.city;
  }, [
    city,
    selectedSeed,
    matchedSpots,
    effectiveSeedId,
    effectiveCoverage,
    effectiveSpotName,
    onSpotFocus,
  ]);

  return (
    <div className="map-shell">
      <div
        ref={containerRef}
        className="map-canvas"
        aria-label={`${city.city} interactive biocorridor seed density map`}
      />
      <div className="map-caption" aria-live="polite">
        <span>{city.city}</span>
        <strong>{statusSpot ? statusSpot.name : city.corridor}</strong>
        <em>
          {statusSpot
            ? `${statusSpot.area} — ${statusSpot.urgency.toLowerCase()}`
            : coverageFilter
              ? `Filtered to ${coverageLabel(coverageFilter).toLowerCase()}`
              : statusSeed
                ? `${statusSeed.name} density and recommended gaps`
                : "All seed density and recommended gaps"}
        </em>
      </div>
      <div className="map-zoom-hint" aria-hidden="true">Hold Cmd/Ctrl + scroll to zoom</div>
    </div>
  );
}

function coverageLabel(status) {
  if (status === "good") return "Good coverage";
  if (status === "need") return "Needs more seeds";
  return "Critical gap";
}

function Header() {
  return (
    <header className="site-header">
      <a href="#home" className="logo">seedring</a>
      <nav aria-label="Primary navigation">
        <a href="#process">Process</a>
        <a href="#piece">Design</a>
        <a href="#map">Map</a>
        <a href="#science">Science</a>
        <a href="#community">Corridor</a>
      </nav>
      <a href="#waitlist" className="header-cta">Waitlist</a>
    </header>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <a href="#home" className="footer-logo">seedring</a>
        <p className="footer-line">Made with care for the corridors that will outlive us.</p>
        <span className="footer-meta">© {new Date().getFullYear()}</span>
      </div>
    </footer>
  );
}

function CitySelect({ labelId, value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(() =>
    Math.max(0, options.findIndex((option) => option.value === value)),
  );
  const wrapRef = useRef(null);
  const listRef = useRef(null);
  const selectedIndex = options.findIndex((option) => option.value === value);
  const selected = options[selectedIndex] ?? options[0];

  useEffect(() => {
    if (!open) return undefined;
    function handlePointer(event) {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handlePointer);
    return () => document.removeEventListener("mousedown", handlePointer);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    listRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const node = listRef.current?.querySelector(`[data-index="${activeIndex}"]`);
    node?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex]);

  function commit(index) {
    const next = options[index];
    if (!next) return;
    onChange(next.value);
    setOpen(false);
  }

  function handleTriggerKeyDown(event) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setActiveIndex(Math.max(0, selectedIndex));
      setOpen(true);
    }
  }

  function handleListKeyDown(event) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % options.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => (index - 1 + options.length) % options.length);
    } else if (event.key === "Home") {
      event.preventDefault();
      setActiveIndex(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setActiveIndex(options.length - 1);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      commit(activeIndex);
    } else if (event.key === "Escape" || event.key === "Tab") {
      setOpen(false);
    }
  }

  return (
    <div className={`city-select-wrap${open ? " is-open" : ""}`} ref={wrapRef}>
      <button
        type="button"
        className="city-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={labelId}
        onClick={() => {
          setActiveIndex(Math.max(0, selectedIndex));
          setOpen((prev) => !prev);
        }}
        onKeyDown={handleTriggerKeyDown}
      >
        <span className="city-trigger-label">{selected.label}</span>
        {selected.region ? <span className="city-trigger-region">{selected.region}</span> : null}
      </button>
      {open ? (
        <ul
          ref={listRef}
          className="city-options"
          role="listbox"
          tabIndex={-1}
          aria-labelledby={labelId}
          aria-activedescendant={`city-option-${activeIndex}`}
          onKeyDown={handleListKeyDown}
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            const isActive = index === activeIndex;
            return (
              <li
                key={option.value}
                id={`city-option-${index}`}
                data-index={index}
                role="option"
                aria-selected={isSelected}
                className={`city-option${isSelected ? " is-selected" : ""}${isActive ? " is-active" : ""}`}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseDown={(event) => {
                  event.preventDefault();
                  commit(index);
                }}
              >
                <span className="city-option-mark" aria-hidden="true" />
                <span className="city-option-text">
                  <span className="city-option-name">{option.label}</span>
                  {option.region ? <span className="city-option-region">{option.region}</span> : null}
                </span>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

export default App;
