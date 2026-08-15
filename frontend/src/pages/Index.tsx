import { Link } from "react-router-dom";
import { Thermometer, CloudRain, Leaf, Wind, ArrowRight, Globe2, Sparkles, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import StatCard from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-earth.jpg";

const Index = () => {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const handleSend = async () => {
    if (!message.trim()) return;

    const userMessage = message.trim();
    setChatHistory((prev) => [...prev, { role: "user", content: userMessage }]);
    setMessage("");
    setIsTyping(true);

    try {
      const response = await fetch("http://localhost:5000/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();
      setChatHistory((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (error) {
      setChatHistory((prev) => [...prev, { role: "assistant", content: "Sorry, I could not reach the chatbot service." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden min-h-[640px] flex items-center">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Aerial view of forest meeting ocean" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[hsl(165_55%_15%/0.92)] via-[hsl(195_60%_22%/0.78)] to-[hsl(195_70%_45%/0.4)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_hsl(165_60%_50%/0.35),_transparent_60%)]" />
        </div>

        {/* Floating data orbs */}
        <div className="absolute top-20 right-[12%] hidden md:block animate-float-slow">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-[hsl(14_85%_58%/0.4)] animate-pulse-ring" />
            <div className="relative h-16 w-16 rounded-full bg-[hsl(14_85%_58%/0.95)] flex items-center justify-center shadow-elevated backdrop-blur">
              <Thermometer className="h-7 w-7 text-white" />
            </div>
          </div>
        </div>
        <div className="absolute bottom-32 right-[28%] hidden md:block animate-float-slow" style={{ animationDelay: "1s" }}>
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-[hsl(205_75%_50%/0.4)] animate-pulse-ring" />
            <div className="relative h-14 w-14 rounded-full bg-[hsl(205_75%_55%/0.95)] flex items-center justify-center shadow-elevated">
              <CloudRain className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        <div className="absolute top-32 right-[35%] hidden lg:block animate-float-slow" style={{ animationDelay: "2s" }}>
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-[hsl(140_55%_50%/0.4)] animate-pulse-ring" />
            <div className="relative h-12 w-12 rounded-full bg-[hsl(140_55%_45%/0.95)] flex items-center justify-center shadow-elevated">
              <Leaf className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>

        <div className="relative container py-24 md:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-white text-xs font-medium mb-6 border border-white/20 animate-fade-up">
              <Sparkles className="h-3.5 w-3.5" />
              Climate intelligence for India
            </div>
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.02] mb-6 animate-fade-up delay-100">
              Tracking India's<br />
              <span className="bg-gradient-to-r from-[hsl(140_70%_75%)] via-[hsl(175_80%_70%)] to-[hsl(195_90%_75%)] bg-clip-text text-transparent">changing climate</span>,<br />
              from the Himalayas to the coast.
            </h1>
            <p className="text-lg text-white/85 max-w-2xl mb-8 leading-relaxed animate-fade-up delay-200">
              ClimaScope brings together satellite, weather, and vegetation data across Indian
              states and regions — helping researchers, policymakers, and communities understand
              local climate impact.
            </p>
            <div className="flex flex-wrap gap-3 animate-fade-up delay-300">
              <Button asChild size="lg" className="bg-white text-foreground hover:bg-white/90 shadow-elevated group">
                <Link to="/map">Explore the map <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-white/5 backdrop-blur border-white/30 text-white hover:bg-white/15 hover:text-white">
                <Link to="/analytics">View analytics</Link>
              </Button>
            </div>

            {/* Trust strip */}
            <div className="mt-12 flex items-center gap-6 text-white/60 text-xs animate-fade-up delay-400">
              <span className="uppercase tracking-widest">Powered by</span>
              <div className="h-px flex-1 max-w-12 bg-white/20" />
              <span className="font-display font-semibold text-white/80">NASA</span>
              <span className="font-display font-semibold text-white/80">Copernicus</span>
              <span className="font-display font-semibold text-white/80 hidden sm:inline">MODIS</span>
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <svg className="absolute bottom-0 left-0 w-full text-background" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden="true">
          <path fill="currentColor" d="M0,40 C360,80 720,0 1080,40 C1260,60 1380,50 1440,40 L1440,80 L0,80 Z" />
        </svg>
      </section>

      {/* STATS */}
      <section className="container py-12 md:py-16 -mt-20 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <div className="animate-fade-up"><StatCard title="Avg. Temperature (India)" value="26.4" unit="°C" trend="+1.4°C since 2000" icon={Thermometer} accent="temperature" loading={loading} /></div>
          <div className="animate-fade-up delay-100"><StatCard title="Annual Rainfall" value="1,175" unit="mm" trend="-0.4% YoY" icon={CloudRain} accent="rainfall" loading={loading} /></div>
          <div className="animate-fade-up delay-200"><StatCard title="Vegetation (NDVI)" value="0.54" trend="Stable" icon={Leaf} accent="ndvi" loading={loading} /></div>
          <div className="animate-fade-up delay-300"><StatCard title="Air Quality Index" value="118" trend="Moderate" icon={Wind} accent="primary" loading={loading} /></div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="relative py-16 md:py-24">
        <div className="absolute inset-0 grid-pattern opacity-40" />
        <div className="relative container">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <span className="text-xs uppercase tracking-widest text-primary font-semibold">About the project</span>
              <h2 className="font-display text-3xl md:text-5xl font-bold mt-2 mb-4 leading-tight">
                India's climate, <span className="text-gradient">in focus.</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6 text-lg">
                The Climate Impact Assessment project unifies temperature, precipitation and
                vegetation indices for India — from the Himalayan belt to coastal plains —
                in a single, intuitive interface.
              </p>
              <Button asChild variant="ghost" className="text-primary hover:text-primary hover:bg-accent group px-0">
                <Link to="/about">
                  Learn more
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Indian regions", value: "28", icon: Globe2 },
                { label: "Data points / day", value: "1.2M", icon: TrendingUp },
                { label: "Years of history", value: "40+", icon: Sparkles },
                { label: "Open datasets", value: "8", icon: Leaf },
              ].map((s, i) => (
                <div
                  key={s.label}
                  className="group rounded-2xl border border-border/60 bg-card p-5 shadow-soft transition-smooth hover:shadow-elevated hover:-translate-y-1 hover:border-primary/30 animate-fade-up"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <s.icon className="h-5 w-5 text-primary mb-3 transition-smooth group-hover:scale-110" />
                  <p className="font-display text-3xl font-bold text-gradient">{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CHATBOT */}
      <section className="container pb-20">
        <div className="relative overflow-hidden rounded-3xl gradient-hero p-10 md:p-14 shadow-elevated">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(195_80%_60%/0.6),_transparent_60%)]" />
          <div className="relative grid md:grid-cols-[1fr_auto] gap-6 items-center">
            <div>
              <h3 className="font-display text-2xl md:text-3xl font-bold text-white mb-2">Ready to dive in?</h3>
              <p className="text-white/80 max-w-xl">Explore interactive maps, analytics dashboards, and downloadable reports — all in one place.</p>
            </div>
            <div className="flex gap-3">
              <Button asChild size="lg" className="bg-white text-foreground hover:bg-white/90 shadow-elevated">
                <Link to="/map">Open map <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
          </div>

          <div className="relative mt-8 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-md">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-white">
              <Sparkles className="h-4 w-4" />
              Climate Assistant
            </div>
            <div className="space-y-2 rounded-xl bg-background/90 p-3 text-sm text-foreground">
              {chatHistory.length === 0 && (
                <p className="text-muted-foreground">Ask about climate, maps, or reports.</p>
              )}
              {chatHistory.map((item, index) => (
                <div key={index} className={`rounded-lg px-3 py-2 ${item.role === "user" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                  <strong>{item.role === "user" ? "You" : "Assistant"}:</strong> {item.content}
                </div>
              ))}
              {isTyping && <div className="rounded-lg bg-muted px-3 py-2 text-muted-foreground">Assistant is typing...</div>}
            </div>
            <div className="mt-3 flex gap-2">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask something about climate data"
                className="flex-1 rounded-lg border border-white/20 bg-white/90 px-3 py-2 text-sm text-foreground outline-none"
              />
              <Button onClick={handleSend} size="sm" className="bg-white text-foreground hover:bg-white/90">
                Send
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
