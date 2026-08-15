import { Component, ReactNode } from "react";
import { AlertTriangle, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}
interface State {
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: unknown) {
    // eslint-disable-next-line no-console
    console.error("ErrorBoundary caught:", error, info);
  }

  reset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      return (
        <div className="container py-16">
          <div className="max-w-lg mx-auto rounded-2xl border border-border/60 bg-card p-8 shadow-soft text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-4">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h2 className="font-display text-xl font-bold mb-2">
              {this.props.fallbackTitle ?? "Something went wrong"}
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              {this.state.error.message || "An unexpected error occurred while rendering this view."}
            </p>
            <Button onClick={this.reset} className="gradient-hero text-primary-foreground">
              <RotateCw className="h-4 w-4 mr-2" /> Try again
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;