import { useSessions } from "@/hooks/use-sessions";
import { Link } from "wouter";
import { Video, Sparkles, AlertCircle, Loader2 } from "lucide-react";
import { SessionCard } from "@/components/SessionCard";

export function Dashboard() {
  const { data: sessions, isLoading, error } = useSessions();

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      {/* Navbar */}
      <header className="sticky top-0 z-40 backdrop-blur-xl border-b border-white/[0.08] bg-background/60">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20">
              <Video className="w-4 h-4 text-white" />
            </div>
            <h1 className="font-display font-bold text-xl tracking-wide">FocusLens</h1>
          </div>
          
          <nav>
            <Link href="/call" className="glass-button px-5 py-2 rounded-full text-sm font-semibold flex items-center gap-2 text-primary group">
              <span className="w-2 h-2 rounded-full bg-primary group-hover:shadow-[0_0_8px_rgba(28,58,255,0.8)] transition-all"></span>
              Start New Call
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 mt-12">
        {/* Hero Section */}
        <section className="mb-16">
          <h2 className="text-5xl font-display font-bold text-gradient mb-4">
            Master your presence.
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
            Privacy-first real-time telemetry assistant that tracks your gaze locally to improve 
            eye contact and engagement during critical video meetings.
          </p>
        </section>

        {/* Sessions Section */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-display font-semibold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Past Sessions
            </h3>
          </div>

          {isLoading ? (
            <div className="h-64 flex flex-col items-center justify-center text-muted-foreground gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p>Loading analytics...</p>
            </div>
          ) : error ? (
            <div className="glass-panel p-6 rounded-2xl flex items-center gap-4 text-destructive border-destructive/20">
              <AlertCircle className="w-6 h-6" />
              <p>Failed to load sessions. Please try again later.</p>
            </div>
          ) : sessions?.length === 0 ? (
            <div className="glass-panel p-12 rounded-3xl flex flex-col items-center justify-center text-center border-dashed border-white/10">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <Video className="w-6 h-6 text-muted-foreground" />
              </div>
              <h4 className="text-xl font-semibold mb-2">No sessions yet</h4>
              <p className="text-muted-foreground max-w-sm mb-6">
                Start a new call to begin tracking your engagement metrics and build better habits.
              </p>
              <Link href="/call" className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all">
                Launch Assistant
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sessions?.map(session => (
                <SessionCard key={session.id} session={session} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
