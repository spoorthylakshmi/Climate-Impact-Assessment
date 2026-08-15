import { Database, Globe, Users, Sparkles } from "lucide-react";

const About = () => {
  return (
    <div className="container py-8 md:py-16 max-w-4xl">
      <header className="mb-10">
        <span className="text-xs uppercase tracking-widest text-primary font-semibold">About</span>
        <h1 className="font-display text-3xl md:text-5xl font-bold mt-2 leading-tight">
          A clearer picture of India's changing climate.
        </h1>
      </header>

      <div className="prose prose-lg max-w-none mb-12">
        <p className="text-lg text-muted-foreground leading-relaxed">
          The <span className="text-foreground font-semibold">Climate Impact Assessment</span> project (ClimaScope)
          combines satellite observations, weather station records, and vegetation indices for India into a
          unified, accessible interface. Our goal is to help researchers, educators, and decision-makers
          explore how climate is shifting — from the Himalayan belt to the southern coast.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-12">
        {[
          { icon: Globe, title: "India-wide coverage", text: "28 monitored regions across all states and biomes." },
          { icon: Database, title: "Open data", text: "Built on freely available datasets from leading agencies." },
          { icon: Users, title: "For everyone", text: "Designed for scientists, students, and curious citizens alike." },
          { icon: Sparkles, title: "Always evolving", text: "Continuously updated as new observations come online." },
        ].map(({ icon: Icon, title, text }) => (
          <div key={title} className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft transition-smooth hover:shadow-elevated hover:-translate-y-0.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground mb-3">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="font-display font-semibold mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground">{text}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border/60 gradient-soft p-8">
        <h2 className="font-display text-2xl font-bold mb-4">Data sources</h2>
        <ul className="space-y-3 text-sm">
          {[
            { name: "India Meteorological Department (IMD)", desc: "Official temperature and rainfall observations across India." },
            { name: "NASA POWER", desc: "Surface temperature, solar radiation and meteorological parameters." },
            { name: "Copernicus Climate Data Store", desc: "ERA5 reanalysis for atmospheric and surface variables." },
            { name: "MODIS / Terra & Aqua", desc: "Vegetation indices (NDVI, EVI) at 250 m resolution." },
            { name: "Bhuvan (ISRO)", desc: "Indian satellite imagery and geospatial datasets." },
            { name: "OpenStreetMap & CARTO", desc: "Base map tiles and geographic context." },
          ].map((s) => (
            <li key={s.name} className="flex items-start gap-3">
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
              <div>
                <span className="font-semibold text-foreground">{s.name}</span>
                <span className="text-muted-foreground"> — {s.desc}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <p className="text-xs text-muted-foreground text-center mt-12">
        ClimaScope is a demonstration project. Data shown may be illustrative.
      </p>
    </div>
  );
};

export default About;