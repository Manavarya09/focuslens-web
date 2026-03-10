import { db } from "./db";
import {
  sessions,
  telemetryEvents,
  type CreateSessionRequest,
  type UpdateSessionRequest,
  type SessionResponse,
  type CreateTelemetryEventRequest,
  type TelemetryEventResponse
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getSessions(): Promise<SessionResponse[]>;
  getSession(id: number): Promise<SessionResponse | undefined>;
  createSession(session: CreateSessionRequest): Promise<SessionResponse>;
  updateSession(id: number, updates: UpdateSessionRequest): Promise<SessionResponse>;
  
  getTelemetryEvents(sessionId: number): Promise<TelemetryEventResponse[]>;
  createTelemetryEvent(event: CreateTelemetryEventRequest): Promise<TelemetryEventResponse>;
}

export class DatabaseStorage implements IStorage {
  async getSessions(): Promise<SessionResponse[]> {
    return await db.select().from(sessions);
  }

  async getSession(id: number): Promise<SessionResponse | undefined> {
    const [session] = await db.select().from(sessions).where(eq(sessions.id, id));
    return session;
  }

  async createSession(session: CreateSessionRequest): Promise<SessionResponse> {
    const [newSession] = await db.insert(sessions).values(session).returning();
    return newSession;
  }

  async updateSession(id: number, updates: UpdateSessionRequest): Promise<SessionResponse> {
    const [updated] = await db.update(sessions)
      .set(updates)
      .where(eq(sessions.id, id))
      .returning();
    return updated;
  }

  async getTelemetryEvents(sessionId: number): Promise<TelemetryEventResponse[]> {
    return await db.select().from(telemetryEvents).where(eq(telemetryEvents.sessionId, sessionId));
  }

  async createTelemetryEvent(event: CreateTelemetryEventRequest): Promise<TelemetryEventResponse> {
    const [newEvent] = await db.insert(telemetryEvents).values(event).returning();
    return newEvent;
  }
}

export const storage = new DatabaseStorage();
