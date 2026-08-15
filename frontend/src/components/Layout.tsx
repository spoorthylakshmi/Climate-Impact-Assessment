import { NavLink, Outlet } from "react-router-dom";
import { Leaf, Map, BarChart3, FileText, Info, Home } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", label: "Home", icon: Home },
  { to: "/map", label: "Map", icon: Map },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/about", label: "About", icon: Info },
];

const Layout = () => {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-lg">
        <div className="container flex h-16 items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-hero shadow-soft transition-smooth group-hover:scale-105">
              <Leaf className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-display font-bold text-foreground">ClimaScope</span>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Climate Impact</span>
            </div>
          </NavLink>

          <nav className="hidden md:flex items-center gap-1">
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-smooth",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>

          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-smooth"
            aria-label="Toggle menu"
          >
            <div className="space-y-1.5">
              <span className={cn("block h-0.5 w-5 bg-foreground transition-smooth", open && "translate-y-2 rotate-45")} />
              <span className={cn("block h-0.5 w-5 bg-foreground transition-smooth", open && "opacity-0")} />
              <span className={cn("block h-0.5 w-5 bg-foreground transition-smooth", open && "-translate-y-2 -rotate-45")} />
            </div>
          </button>
        </div>

        {open && (
          <nav className="md:hidden border-t border-border/60 bg-background">
            <div className="container py-3 flex flex-col gap-1">
              {links.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === "/"}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-smooth",
                      isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted"
                    )
                  }
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </NavLink>
              ))}
            </div>
          </nav>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-border/60 bg-muted/30">
        <div className="container py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} ClimaScope — Climate Impact Assessment</p>
          <p>Data sources: NASA POWER · Copernicus · MODIS</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;