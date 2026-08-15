import { Button } from "@/components/ui/button";
import { Download, FileText, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import jsPDF from "jspdf";
import { toast } from "sonner";

const Reports = () => {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("Climate Impact Assessment — India", 20, 25);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated ${new Date().toLocaleDateString()}`, 20, 33);

    doc.setDrawColor(40, 130, 100);
    doc.line(20, 38, 190, 38);

    doc.setFontSize(14);
    doc.setTextColor(20);
    doc.text("Executive Summary", 20, 50);
    doc.setFontSize(11);
    doc.setTextColor(60);
    const summary = doc.splitTextToSize(
      "This report summarizes climate trends observed across Indian regions. Average temperatures show a continued upward trend nationwide, while monsoon precipitation patterns exhibit increasing variability. Vegetation indices remain stable in most regions, with notable stress in arid zones of western India.",
      170
    );
    doc.text(summary, 20, 60);

    doc.setFontSize(14);
    doc.setTextColor(20);
    doc.text("Key Indicators", 20, 95);
    doc.setFontSize(11);
    doc.setTextColor(60);
    [
      "• Average temperature (India): 26.4°C (+1.4°C since 2000)",
      "• Annual rainfall: 1,175 mm (-0.4% YoY)",
      "• Vegetation index (NDVI): 0.54 (Stable)",
      "• Air Quality Index (urban avg.): 118 (Moderate)",
    ].forEach((line, i) => doc.text(line, 20, 105 + i * 8));

    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text("Data sources: IMD · NASA POWER · Copernicus · MODIS · ClimaScope", 20, 280);
    doc.save("climate-impact-india.pdf");
    setLoading(false);
    toast.success("Report downloaded");
  };

  return (
    <div className="container py-8 md:py-12 max-w-5xl">
      <header className="mb-8">
        <span className="text-xs uppercase tracking-widest text-primary font-semibold">Reports</span>
        <h1 className="font-display text-3xl md:text-4xl font-bold mt-1">Download & summary</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">Generate shareable PDF reports from the latest climate data.</p>
      </header>

      <div className="grid md:grid-cols-[1.3fr_1fr] gap-6">
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
          <h2 className="font-display text-xl font-semibold mb-4">Executive summary</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Across Indian regions, average surface temperatures continue an upward trajectory consistent
            with multi-decadal warming. Monsoon precipitation has become more variable, with several states
            reporting below-average annual rainfall.
          </p>
          <ul className="space-y-3 mt-6">
            {[
              "All-India average temperature has risen ~1.4°C since 2000.",
              "North-East India and the Western Ghats remain the wettest regions.",
              "Rajasthan and parts of western India show measurable NDVI decline.",
              "Recommended: continue high-frequency monitoring of stressed regions.",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm">
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-foreground/80">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-border/60 gradient-card p-6 shadow-soft flex flex-col">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
            <FileText className="h-6 w-6" />
          </div>
          <h3 className="font-display text-lg font-semibold mb-2">Sample climate report</h3>
          <p className="text-sm text-muted-foreground mb-6 flex-1">
            A formatted PDF summarizing the latest indicators, trends, and key insights — ready to share.
          </p>
          <Button onClick={handleDownload} disabled={loading} size="lg" className="w-full gradient-hero text-primary-foreground hover:opacity-90 shadow-elevated">
            {loading ? (
              <><span className="h-4 w-4 mr-2 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" /> Preparing…</>
            ) : (
              <><Download className="h-4 w-4 mr-2" /> Download PDF</>
            )}
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-3">PDF · ~80 KB</p>
        </div>
      </div>
    </div>
  );
};

export default Reports;