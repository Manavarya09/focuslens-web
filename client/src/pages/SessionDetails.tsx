import { useRoute } from "wouter";
import { useSession, useTelemetry } from "@/hooks/use-sessions";
import { Link } from "wouter";
import { format } from "date-fns";
import { ArrowLeft, Loader2, Target, Clock, Activity, Video } from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine 
} from "recharts";

export function SessionDetails() {
  const [, params] = useRoute("/session/:id");
  const sessionId = Number(params?.id);
  
  const { data: session, isLoading: sessionLoading } = useSession(sessionId);
  const { data: telemetry, isLoading: telemetryLoading } = useTelemetry(sessionId);

  if (sessionLoading || telemetryLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-foreground gap-4">
        <h2 className="text-2xl font-bold">Session not found</h2>
        <Link href="/" className="text-primary hover:underline">Return to Dashboard</Link>
      </div>
    );
  }

  // Prepare chart data
  const chartData = (telemetry || []).map((t, idx) => ({
    time: idx, // since we sample every 1s, index ~= seconds
    yaw: t.yaw,
    pitch: t.pitch,
    eyeContact: t.eyeContact ? 100 : 0
  }));

  const score = session.averageEyeContact ? Math.round(session.averageEyeContact) : 0;
  const scoreColor = score >= 80 ? "text-success" : score >= 50 ? "text-amber-400" : "text-destructive";

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      <header className="border-b border-white/[0.08] bg-background/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center gap-4">
          <Link href="/" className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="h-4 w-px bg-white/10" />
          <h1 className="font-display font-semibold text-lg">{session.title} Analytics</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 mt-10">
        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5">
              <Target className="w-24 h-24" />
            </div>
            <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-2">
              <Target className="w-4 h-4" /> Score
            </div>
            <div className={`text-5xl font-display font-bold ${scoreColor}`}>
              {score}%
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl">
            <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Duration
            </div>
            <div className="text-5xl font-display font-bold">
              {session.duration ? Math.round(session.duration / 60) : 0}
              <span className="text-2xl text-muted-foreground ml-1">min</span>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl">
            <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-2">
              <Video className="w-4 h-4" /> Date
            </div>
            <div className="text-2xl font-display font-bold mt-3">
              {format(new Date(session.startTime!), "MMM d")}
            </div>
            <div className="text-muted-foreground font-medium mt-1">
              {format(new Date(session.startTime!), "h:mm a")}
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="glass-panel p-6 rounded-2xl mb-8">
          <div className="flex items-center gap-2 mb-8">
            <Activity className="w-5 h-5 text-primary" />
            <h3 className="text-xl font-display font-semibold">Gaze Trajectory</h3>
          </div>
          
          {chartData.length > 0 ? (
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorYaw" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPitch" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis 
                    dataKey="time" 
                    stroke="hsl(var(--muted-foreground))" 
                    tickFormatter={(val) => `${val}s`}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))" 
                    tick={{ fontSize: 12 }}
                    domain={[-45, 45]}
                  />
                  <RechartsTooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '8px',
                      color: 'hsl(var(--foreground))'
                    }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                    labelFormatter={(val) => `Time: ${val}s`}
                  />
                  {/* Ideal eye contact zone bounds */}
                  <ReferenceLine y={15} stroke="hsl(var(--success))" strokeDasharray="3 3" strokeOpacity={0.5} />
                  <ReferenceLine y={-15} stroke="hsl(var(--success))" strokeDasharray="3 3" strokeOpacity={0.5} />
                  
                  <Area 
                    type="monotone" 
                    dataKey="yaw" 
                    name="Head Yaw (Left/Right)"
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorYaw)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="pitch" 
                    name="Head Pitch (Up/Down)"
                    stroke="hsl(var(--accent))" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorPitch)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-muted-foreground border border-dashed border-white/10 rounded-xl">
              Not enough telemetry data recorded.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
