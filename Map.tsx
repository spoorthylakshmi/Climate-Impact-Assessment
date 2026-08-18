import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Circle, Popup, useMapEvents, CircleMarker, LayersControl } from "react-leaflet";
import { Slider } from "@/components/ui/slider";
import { Thermometer, CloudRain, Leaf, MapPin, Layers, Play, Pause, Activity, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import L from "leaflet";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

type LayerKey = "temperature" | "rainfall" | "ndvi" | "cci";
type BaseKey = "light" | "satellite" | "dark";

interface ClickInfo {
  lat: number;
  lng: number;
  temp: number;
  rain: number;
  ndvi: number;
  tempAnomaly: number;
  rainVariability: number;
  vegLoss: number;
  cci: number;
  region: string;
}

interface LocationPoint {
  id?: number;
  name: string;
  lat: number;
  lng: number;
  temp: number;
  rain: number;
  ndvi: number;
  cci: number;
  tempAnomaly: number;
  rainVariability: number;
  vegLoss: number;
}

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
const safe = (n: number, fallback = 0) => (Number.isFinite(n) ? n : fallback);

const baseLayers: Record<BaseKey, { name: string; url: string; attr: string }> = {
  light:     { name: "Light",     url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",                                        attr: "© OpenStreetMap © CARTO" },
  satellite: { name: "Satellite", url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",          attr: "© Esri" },
  dark:      { name: "Dark",      url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",                                         attr: "© OpenStreetMap © CARTO" },
};

const layerMeta: Record<LayerKey, { label: string; color: string; icon: typeof Thermometer }> = {
  temperature: { label: "Temperature",         color: "hsl(14 85% 58%)",  icon: Thermometer },
  rainfall:    { label: "Rainfall",            color: "hsl(205 75% 50%)", icon: CloudRain },
  ndvi:        { label: "Vegetation (NDVI)",   color: "hsl(140 55% 42%)", icon: Leaf },
  cci:         { label: "Climate Change Index",color: "hsl(280 60% 55%)", icon: Activity },
};

// --- climate helpers ----------------------------------------------------

function cciSeverity(cci: number) {
  if (cci < 25) return { label: "Low", color: "hsl(140 55% 42%)" };
  if (cci < 50) return { label: "Moderate", color: "hsl(45 90% 50%)" };
  if (cci < 75) return { label: "High", color: "hsl(20 85% 55%)" };
  return { label: "Severe", color: "hsl(0 75% 55%)" };
}

function findNearestLocation(lat: number, lng: number, locations: LocationPoint[]) {
  if (!locations.length) return null;

  let best = locations[0];
  let bestDistance = Infinity;
  for (const point of locations) {
    const d = Math.hypot(lat - point.lat, lng - point.lng);
    if (d < bestDistance) {
      bestDistance = d;
      best = point;
    }
  }
  return best;
}

// --- click handler -----------------------------------------------------------

const ClickHandler = ({ onClick, locations }: { onClick: (i: ClickInfo) => void; locations: LocationPoint[] }) => {
  useMapEvents({
    click(e) {
      try {
        const { lat, lng } = e.latlng;
        if (lat < 5 || lat > 38 || lng < 65 || lng > 100) return;

        const point = findNearestLocation(lat, lng, locations);
        if (!point) return;

        onClick({
          lat,
          lng,
          temp: point.temp,
          rain: point.rain,
          ndvi: point.ndvi,
          tempAnomaly: point.tempAnomaly,
          rainVariability: point.rainVariability,
          vegLoss: point.vegLoss,
          cci: point.cci,
          region: point.name,
        });
      } catch { /* swallow */ }
    },
  });
  return null;
};

// --- main page ---------------------------------------------------------------

const MapPage = () => {
  const [year, setYear] = useState(2026);
  const [info, setInfo] = useState<ClickInfo | null>(null);
  const [inspectorLoading, setInspectorLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [locationsLoading, setLocationsLoading] = useState(true);
  const [base, setBase] = useState<BaseKey>("light");
  const [activeLayer, setActiveLayer] = useState<LayerKey>("temperature");
  const [playing, setPlaying] = useState(false);
  const [locations, setLocations] = useState<LocationPoint[]>([]);
  const loadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [futureYear, setFutureYear] = useState(2026);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);
useEffect(() => {
  fetch("/future_predictions.json")
    .then((res) => res.json())
    .then((data) => setPredictions(data))
    .catch((err) => console.error(err));
}, []);
  useEffect(() => {
    const controller = new AbortController();
    setLocationsLoading(true);

    fetch(`http://localhost:5000/api/locations?year=${year}`, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch locations");
        return res.json();
      })
      .then((data: LocationPoint[]) => setLocations(data))
      .catch(() => setLocations([]))
      .finally(() => setLocationsLoading(false));

    return () => controller.abort();
  }, [year]);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setYear((y) => (y >= 2024 ? 2000 : y + 1)), 600);
    return () => clearInterval(id);
  }, [playing]);

  const handleClick = (i: ClickInfo) => {
    setInspectorLoading(true);
    setInfo(i);
    if (loadTimerRef.current) clearTimeout(loadTimerRef.current);
    loadTimerRef.current = setTimeout(() => setInspectorLoading(false), 450);
  };

  useEffect(() => () => { if (loadTimerRef.current) clearTimeout(loadTimerRef.current); }, []);

  const mapLoading = loading || locationsLoading;

  const layerRange: Record<LayerKey, { min: number; max: number; unit: string }> = {
    temperature: { min: 0,   max: 32,   unit: "°C" },
    rainfall:    { min: 100, max: 2400, unit: " mm" },
    ndvi:        { min: 0.1, max: 0.8,  unit: "" },
    cci:         { min: 0,   max: 100,  unit: "" },
  };

  const valueFor = (p: LocationPoint) => {
    const { min, max, unit } = layerRange[activeLayer];
    const v =
      activeLayer === "temperature" ? p.temp :
      activeLayer === "rainfall"    ? p.rain :
      activeLayer === "ndvi"        ? p.ndvi : p.cci;
    return { v, min, max, unit };
  };

  const ActiveIcon = layerMeta[activeLayer].icon;

  return (
    <div className="container py-8 md:py-12">
      <header className="mb-6">
        <span className="text-xs uppercase tracking-widest text-primary font-semibold">Interactive map · India</span>
        <h1 className="font-display text-3xl md:text-4xl font-bold mt-1">Climate layers across India</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Toggle temperature, rainfall, vegetation or the composite <strong>Climate Change Index</strong>.
          Click anywhere on the subcontinent to inspect indicators for that location.
        </p>
      </header>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        {/* MAP */}
        <div className="relative rounded-2xl overflow-hidden border border-border/60 shadow-elevated bg-card">
          {mapLoading && (
            <div className="absolute inset-0 z-[500] flex items-center justify-center bg-background/60 backdrop-blur">
              <div className="h-10 w-10 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
            </div>
          )}

          <div className="absolute bottom-3 left-3 z-[400] bg-card/95 backdrop-blur border border-border/60 rounded-xl shadow-soft px-4 py-3 max-w-[280px]">
            <div className="flex items-center gap-2 mb-2">
              <ActiveIcon className="h-3.5 w-3.5" style={{ color: layerMeta[activeLayer].color }} />
              <span className="text-xs font-semibold">{layerMeta[activeLayer].label} · {year}</span>
            </div>
            <div
              className="h-2 rounded-full"
              style={{
                background:
                  activeLayer === "temperature" ? "linear-gradient(90deg, hsl(205 75% 60%), hsl(50 90% 60%), hsl(14 85% 58%))" :
                  activeLayer === "rainfall"    ? "linear-gradient(90deg, hsl(40 80% 70%), hsl(205 75% 50%))" :
                  activeLayer === "ndvi"        ? "linear-gradient(90deg, hsl(30 40% 70%), hsl(140 55% 42%))" :
                                                  "linear-gradient(90deg, hsl(140 55% 42%), hsl(45 90% 55%), hsl(20 85% 55%), hsl(0 75% 55%))",
              }}
            />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
              <span>{layerRange[activeLayer].min}{layerRange[activeLayer].unit}</span>
              <span>{layerRange[activeLayer].max}{layerRange[activeLayer].unit}</span>
            </div>
          </div>

          <MapContainer
            center={[22.5, 80]}
            zoom={5}
            minZoom={4}
            maxBounds={[[5, 65], [38, 100]]}
            maxBoundsViscosity={0.7}
            style={{ height: "600px", width: "100%" }}
            scrollWheelZoom
          >
            <LayersControl position="topright">
              {(Object.keys(baseLayers) as BaseKey[]).map((k) => (
                <LayersControl.BaseLayer
                  key={k}
                  checked={base === k}
                  name={baseLayers[k].name}
                >
                  <TileLayer
                    url={baseLayers[k].url}
                    attribution={baseLayers[k].attr}
                    subdomains={["a", "b", "c", "d"]}
                    maxZoom={19}
                  />
                </LayersControl.BaseLayer>
              ))}
            </LayersControl>
            <DataLayer key={`data-${activeLayer}-${year}`} points={locations} activeLayer={activeLayer} valueFor={valueFor} year={year} />
            <ClickHandler onClick={handleClick} locations={locations} />
          </MapContainer>
        </div>

        {/* SIDE PANEL */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
            <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
  <h3 className="font-display font-semibold mb-3">
    Future Climate Prediction
  </h3>

  <select
    className="w-full border rounded p-2 mb-4"
    value={futureYear}
    onChange={(e) => setFutureYear(Number(e.target.value))}
  >
    {predictions.map((p) => (
      <option key={p.year} value={p.year}>
        {p.year}
      </option>
    ))}
  </select>

  {predictions
    .filter((p) => p.year === futureYear)
    .map((p) => (
      <div key={p.year} className="space-y-2">
        <p><strong>NDVI:</strong> {p.ndvi.toFixed(3)}</p>
        <p><strong>Rainfall:</strong> {p.rainfall.toFixed(1)} mm</p>
        <p><strong>Temperature:</strong> {p.temperature.toFixed(2)} °C</p>
        <p><strong>CCI:</strong> {p.cci.toFixed(3)}</p>
      </div>
    ))}
</div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-semibold">Year</h3>
              <Button size="sm" variant="ghost" onClick={() => setPlaying(!playing)} className="h-8 px-2 text-primary">
                {playing ? <><Pause className="h-3.5 w-3.5 mr-1" /> Pause</> : <><Play className="h-3.5 w-3.5 mr-1" /> Play</>}
              </Button>
            </div>
            <div className="flex items-baseline justify-between mb-3">
              <span className="font-display text-4xl font-bold gradient-hero bg-clip-text text-transparent">{year}</span>
              <span className="text-xs text-muted-foreground">2000 — 2024</span>
            </div>
            <Slider value={[year]} min={2000} max={2024} step={1} onValueChange={(v) => setYear(v[0])} />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-2">
              <span>2000</span><span>2012</span><span>2024</span>
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
            <h3 className="font-display font-semibold mb-3 flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" /> Active layer
            </h3>
            <div className="grid gap-2">
              {(Object.keys(layerMeta) as LayerKey[]).map((k) => {
                const Icon = layerMeta[k].icon;
                const active = activeLayer === k;
                return (
                  <button
                    key={k}
                    onClick={() => setActiveLayer(k)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-smooth text-left",
                      active ? "border-primary bg-accent shadow-soft" : "border-border/60 hover:bg-muted hover:border-border"
                    )}
                  >
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-lg"
                      style={{ backgroundColor: layerMeta[k].color.replace(")", " / 0.15)"), color: layerMeta[k].color }}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium flex-1">{layerMeta[k].label}</span>
                    {active && <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 gradient-card p-5 shadow-soft">
            <h3 className="font-display font-semibold mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" /> Inspector
            </h3>
            {info ? (
              inspectorLoading ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin text-primary mb-2" />
                  <span className="text-xs">Loading climate data…</span>
                </div>
              ) : (
                <InspectorContent info={info} />
              )
            ) : (
              <p className="text-sm text-muted-foreground">Click anywhere on the map to view climate data stored in the database and the Climate Change Index for that location.</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

// --- inspector ---------------------------------------------------------------

const InspectorContent = ({ info }: { info: ClickInfo }) => {
  const sev = cciSeverity(info.cci);
  return (
    <div className="space-y-4 text-sm">
      <div>
        <p className="text-xs text-muted-foreground">Nearest reference</p>
        <p className="font-display font-semibold">{info.region}</p>
        <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
          {info.lat.toFixed(2)}°N, {info.lng.toFixed(2)}°E
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Stat label="Temp" value={`${info.temp.toFixed(1)}°C`} color="hsl(var(--temperature))" />
        <Stat label="Rain" value={`${info.rain} mm`} color="hsl(var(--rainfall))" />
        <Stat label="NDVI" value={info.ndvi.toFixed(2)} color="hsl(var(--ndvi))" />
      </div>

      <div className="rounded-xl border border-border/60 p-3" style={{ background: `${sev.color.replace(")", " / 0.08)")}` }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4" style={{ color: sev.color }} />
            <span className="text-xs font-semibold">Climate Change Index</span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: sev.color }}>{sev.label}</span>
        </div>
        <div className="flex items-baseline gap-1 mb-2">
          <span className="font-display text-2xl font-bold" style={{ color: sev.color }}>{info.cci.toFixed(1)}</span>
          <span className="text-xs text-muted-foreground">/ 100</span>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${info.cci}%`, background: sev.color }} />
        </div>
        <div className="grid grid-cols-3 gap-2 mt-3 text-[10px]">
          <Sub label="Temp anomaly" value={`${info.tempAnomaly >= 0 ? "+" : ""}${info.tempAnomaly}°C`} />
          <Sub label="Rain variability" value={`±${info.rainVariability}%`} />
          <Sub label="Veg loss" value={info.vegLoss > 0 ? `−${info.vegLoss}` : "0"} />
        </div>
      </div>
    </div>
  );
};

const Stat = ({ label, value, color }: { label: string; value: string; color: string }) => (
  <div className="rounded-lg border border-border/60 bg-background/50 p-2 text-center">
    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
    <p className="font-display font-semibold text-sm mt-0.5" style={{ color }}>{value}</p>
  </div>
);

const Sub = ({ label, value }: { label: string; value: string }) => (
  <div className="text-center">
    <p className="text-muted-foreground">{label}</p>
    <p className="font-semibold text-foreground mt-0.5">{value}</p>
  </div>
);

// --- data layer (markers) ----------------------------------------------------

interface DataLayerProps {
  points: LocationPoint[];
  activeLayer: LayerKey;
  valueFor: (p: any) => { v: number; min: number; max: number; unit: string };
  year: number;
}

const DataLayer = ({ points, activeLayer, valueFor, year }: DataLayerProps) => {
  return (
    <>
      {points.map((p) => {
        const { v, min, max, unit } = valueFor(p);
        const t = clamp(safe((v - min) / (max - min)), 0, 1);
        let color: string;
        if (activeLayer === "temperature") {
          const hue = 210 - t * 196;
          color = `hsl(${hue} 80% 55%)`;
        } else if (activeLayer === "rainfall") {
          color = `hsl(205 75% ${70 - t * 30}%)`;
        } else if (activeLayer === "ndvi") {
          color = `hsl(140 55% ${65 - t * 30}%)`;
        } else {
          // CCI gradient: green → yellow → red
          const hue = 140 - t * 140;
          color = `hsl(${hue} 70% 50%)`;
        }
        const radius = 40000 + t * 90000;
        const sev = activeLayer === "cci" ? cciSeverity(p.cci) : null;
        return (
          <Circle
            key={p.name}
            center={[p.lat, p.lng]}
            radius={radius}
            pathOptions={{ color, fillColor: color, fillOpacity: 0.5, weight: 1.5 }}
          >
            <Popup>
              <div className="font-sans min-w-[180px]">
                <p className="font-semibold mb-1.5 text-sm">{p.name}</p>
                <div className="space-y-0.5 text-xs">
                  <div className="flex justify-between"><span>🌡 Temperature</span><span className="font-semibold">{p.temp.toFixed(1)}°C</span></div>
                  <div className="flex justify-between"><span>💧 Rainfall</span><span className="font-semibold">{p.rain.toLocaleString()} mm</span></div>
                  <div className="flex justify-between"><span>🌿 NDVI</span><span className="font-semibold">{p.ndvi.toFixed(2)}</span></div>
                  <div className="flex justify-between border-t border-gray-200 mt-1 pt-1">
                    <span>📊 CCI</span>
                    <span className="font-semibold" style={sev ? { color: sev.color } : undefined}>
                      {p.cci.toFixed(1)}{sev ? ` · ${sev.label}` : ""}
                    </span>
                  </div>
                </div>
                <p className="text-[10px] text-gray-500 mt-1.5">{layerMeta[activeLayer].label} · {year} · {typeof v === "number" ? (v < 10 ? v.toFixed(2) : Math.round(v)) : v}{unit}</p>
              </div>
            </Popup>
          </Circle>
        );
      })}
      {points.map((p) => (
        <CircleMarker
          key={`${p.name}-dot`}
          center={[p.lat, p.lng]}
          radius={3}
          pathOptions={{ color: "white", fillColor: "white", fillOpacity: 1, weight: 1 }}
        />
      ))}
    </>
  );
};

export default MapPage;