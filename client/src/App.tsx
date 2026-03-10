import { useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

// Page Imports
import { Dashboard } from "@/pages/Dashboard";
import { ActiveCall } from "@/pages/ActiveCall";
import { SessionDetails } from "@/pages/SessionDetails";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/call" component={ActiveCall} />
      <Route path="/session/:id" component={SessionDetails} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Force dark mode for macOS premium aesthetic
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
