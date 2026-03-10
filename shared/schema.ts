import { pgTable, text, serial, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  startTime: timestamp("start_time").defaultNow(),
  endTime: timestamp("end_time"),
  duration: integer("duration"), // in seconds
  averageEyeContact: real("average_eye_contact"), // percentage
});

export const sessionsRelations = relations(sessions, ({ many }) => ({
  telemetryEvents: many(telemetryEvents),
}));

export const insertSessionSchema = createInsertSchema(sessions).omit({ id: true, startTime: true });

export type Session = typeof sessions.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;

export type CreateSessionRequest = InsertSession;
export type UpdateSessionRequest = Partial<InsertSession>;
export type SessionResponse = Session;

export const telemetryEvents = pgTable("telemetry_events", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  eyeContact: boolean("eye_contact").notNull(),
  yaw: real("yaw"),
  pitch: real("pitch"),
  roll: real("roll"),
});

export const telemetryEventsRelations = relations(telemetryEvents, ({ one }) => ({
  session: one(sessions, {
    fields: [telemetryEvents.sessionId],
    references: [sessions.id],
  }),
}));

export const insertTelemetryEventSchema = createInsertSchema(telemetryEvents).omit({ id: true, timestamp: true });

export type TelemetryEvent = typeof telemetryEvents.$inferSelect;
export type InsertTelemetryEvent = z.infer<typeof insertTelemetryEventSchema>;

export type CreateTelemetryEventRequest = InsertTelemetryEvent;
export type TelemetryEventResponse = TelemetryEvent;
