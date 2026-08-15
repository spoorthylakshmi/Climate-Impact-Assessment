import { useEffect, useState } from "react";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Droplets, Leaf, Activity } from "lucide-react";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

const Analytics = () => {
  const [region, setRegion] = useState("All India");
  const [regions, setRegions] = useState<string[]>(["All India"]);
  const [series, setSeries] = useState({ region: "All India", years: [] as number[], temp: [] as number[], rain: [] as number[], ndvi: [] as number[] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/analytics/regions")
      .then((res) => res.json())
      .then((data: string[]) => setRegions(data))
      .catch(() => setRegions(["All India"]));
  }, []);

  useEffect(() => {
    setLoading(true);
    const controller = new AbortController();

    fetch(`http://localhost:5000/api/analytics?region=${encodeURIComponent(region)}`, { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => setSeries(data))
      .catch(() => setSeries({ region, years: [], temp: [], rain: [], ndvi: [] }))
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [region]);

  const years = series.years.map((year) => `${year}`);
  const d = { temp: series.temp, rain: series.rain, ndvi: series.ndvi };

  // Climate Change Index per year: temp anomaly (vs first year), rainfall variability, vegetation loss
  const cciSeries = d.temp.map((t, i) => {
    const tAnom = t - d.temp[0];
    const rVar = Math.abs(d.rain[i] - d.rain[0]) / Math.max(d.rain[0], 1);
    const vLoss = Math.max(0, d.ndvi[0] - d.ndvi[i]);
    const tN = Math.min(1, Math.max(0, tAnom / 3));
    const rN = Math.min(1, rVar / 0.4);
    const vN = Math.min(1, vLoss / 0.2);
    return +((tN * 0.4 + rN * 0.35 + vN * 0.25) * 100).toFixed(1);
  });

const lineData = {
    labels: years,
    datasets: [
      {
        label: "Temperature (°C)",
        data: d.temp,
        borderColor: "hsl(14, 85%, 58%)",
        backgroundColor: "hsla(14, 85%, 58%, 0.12)",
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: "hsl(14, 85%, 58%)",
        pointHoverRadius: 6,
      },
    ],
  };

  const barData = {
    labels: years,
    datasets: [
      {
        label: "Rainfall (mm)",
        data: d.rain,
        backgroundColor: "hsla(205, 75%, 50%, 0.8)",
        borderRadius: 8,
        hoverBackgroundColor: "hsla(205, 75%, 50%, 1)",
      },
    ],
  };

  const ndviData = {
    labels: years,
    datasets: [
      {
        label: "NDVI",
        data: d.ndvi,
        borderColor: "hsl(140, 55%, 42%)",
        backgroundColor: "hsla(140, 55%, 42%, 0.12)",
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: "hsl(140, 55%, 42%)",
        pointHoverRadius: 6,
      },
    ],
  };

  const cciData = {
    labels: years,
    datasets: [
      {
        label: "Climate Change Index",
        data: cciSeries,
        borderColor: "hsl(280, 60%, 55%)",
        backgroundColor: "hsla(280, 60%, 55%, 0.15)",
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: "hsl(280, 60%, 55%)",
        pointHoverRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { font: { family: "Inter", size: 12 }, color: "hsl(200, 15%, 42%)" } },
      tooltip: {
        backgroundColor: "hsl(200, 30%, 12%)",
        padding: 12,
        cornerRadius: 10,
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: "hsl(200, 15%, 42%)" } },
      y: { grid: { color: "hsl(180, 20%, 92%)" }, ticks: { color: "hsl(200, 15%, 42%)" } },
    },
  };

  return (
    <div className="container py-8 md:py-12">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div>
          <span className="text-xs uppercase tracking-widest text-primary font-semibold">Analytics</span>
          <h1 className="font-display text-3xl md:text-4xl font-bold mt-1">Trends & comparisons</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">Multi-decade climate signals drawn from the database at the regional level.</p>
        </div>
        <div className="w-full md:w-64">
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Region</label>
          <Select value={region} onValueChange={setRegion}>
            <SelectTrigger className="bg-card"><SelectValue /></SelectTrigger>
            <SelectContent>
              {regions.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--temperature)/0.12)] text-[hsl(var(--temperature))]">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display font-semibold">Temperature trend</h3>
                <p className="text-xs text-muted-foreground">{region} · {years[0]} – {years[years.length - 1]}</p>
              </div>
            </div>
          </div>
          <div className="h-72">
            {loading ? <div className="h-full w-full bg-muted/40 animate-pulse rounded-lg" /> : <Line data={lineData} options={chartOptions} />}
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--rainfall)/0.12)] text-[hsl(var(--rainfall))]">
                <Droplets className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display font-semibold">Annual rainfall</h3>
                <p className="text-xs text-muted-foreground">{region} · {years[0]} – {years[years.length - 1]}</p>
              </div>
            </div>
          </div>
          <div className="h-72">
            {loading ? <div className="h-full w-full bg-muted/40 animate-pulse rounded-lg" /> : <Bar data={barData} options={chartOptions} />}
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--ndvi)/0.12)] text-[hsl(var(--ndvi))]">
                <Leaf className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display font-semibold">Vegetation Index (NDVI)</h3>
                <p className="text-xs text-muted-foreground">{region} · {years[0]} – {years[years.length - 1]}</p>
              </div>
            </div>
          </div>
          <div className="h-72">
            {loading ? <div className="h-full w-full bg-muted/40 animate-pulse rounded-lg" /> : <Line data={ndviData} options={chartOptions} />}
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "hsla(280, 60%, 55%, 0.12)", color: "hsl(280, 60%, 55%)" }}>
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display font-semibold">Climate Change Index</h3>
                <p className="text-xs text-muted-foreground">Composite: temp anomaly · rain variability · veg loss</p>
              </div>
            </div>
            <span className="font-display text-2xl font-bold" style={{ color: "hsl(280, 60%, 55%)" }}>{cciSeries[cciSeries.length - 1]}</span>
          </div>
          <div className="h-72">
            {loading ? <div className="h-full w-full bg-muted/40 animate-pulse rounded-lg" /> : <Line data={cciData} options={chartOptions} />}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border/60 gradient-soft p-6">
        <h3 className="font-display font-semibold mb-2">Key insight</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {region} has warmed by approximately <span className="font-semibold text-foreground">{(d.temp[d.temp.length - 1] - d.temp[0]).toFixed(1)}°C</span> over the past decade,
          rainfall has shifted by <span className="font-semibold text-foreground">{d.rain[d.rain.length - 1] - d.rain[0]} mm</span>, and NDVI has changed by <span className="font-semibold text-foreground">{(d.ndvi[d.ndvi.length - 1] - d.ndvi[0]).toFixed(2)}</span>.
          The composite Climate Change Index now stands at <span className="font-semibold" style={{ color: "hsl(280, 60%, 55%)" }}>{cciSeries[cciSeries.length - 1]}/100</span>.
        </p>
      </div>
    </div>
  );
};

export default Analytics;