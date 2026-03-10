import { Link } from "wouter";
import { format } from "date-fns";
import { Calendar, Clock, Eye, ChevronRight } from "lucide-react";
import type { SessionResponse } from "@shared/schema";

interface SessionCardProps {
  session: SessionResponse;
}

export function SessionCard({ session }: SessionCardProps) {
  const durationMins = session.duration ? Math.round(session.duration / 60) : 0;
  const eyeContactScore = session.averageEyeContact ? Math.round(session.averageEyeContact) : 0;
  
  // Determine color based on score
  const scoreColor = 
    eyeContactScore >= 80 ? "text-success" : 
    eyeContactScore >= 50 ? "text-amber-400" : 
    "text-destructive";

  return (
    <Link href={`/session/${session.id}`} className="group block">
      <div className="glass-panel rounded-2xl p-6 hover:bg-white/[0.04] transition-all duration-300 hover:scale-[1.02] hover:shadow-primary/5">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
              {session.title}
            </h3>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              <span>{format(new Date(session.startTime!), "MMM d, yyyy h:mm a")}</span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5" />
              Duration
            </div>
            <div className="text-2xl font-display font-semibold text-foreground">
              {durationMins} <span className="text-base font-medium text-muted-foreground">min</span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <Eye className="w-3.5 h-3.5" />
              Eye Contact
            </div>
            <div className={`text-2xl font-display font-semibold ${scoreColor}`}>
              {eyeContactScore}%
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
