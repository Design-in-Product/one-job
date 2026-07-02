import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, HashRouter, Routes, Route } from "react-router-dom";

// Native (Capacitor) builds load from local files, so there is no server to
// resolve paths — hash routing keeps the router working from file/capacitor
// origins. Web builds keep clean BrowserRouter URLs.
const Router = import.meta.env.MODE === "capacitor" ? HashRouter : BrowserRouter;
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          {/* Production build is served from /app/ on GitHub Pages */}
          <Route path="/app" element={<Index />} />
          <Route path="/app/index.html" element={<Index />} />
          <Route path="/demo.html" element={<Index />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
