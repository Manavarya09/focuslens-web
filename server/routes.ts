import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Create sample data if none exists
  const existingSessions = await storage.getSessions();
  if (existingSessions.length === 0) {
    const s1 = await storage.createSession({
      title: "Morning Sync",
      duration: 1800, // 30 mins
      averageEyeContact: 85.5,
    });
    const s2 = await storage.createSession({
      title: "Project Review",
      duration: 3600, // 60 mins
      averageEyeContact: 62.0,
    });
    
    // Some mock telemetry for s1
    await storage.createTelemetryEvent({ sessionId: s1.id, eyeContact: true, yaw: 0.1, pitch: -0.05, roll: 0 });
    await storage.createTelemetryEvent({ sessionId: s1.id, eyeContact: true, yaw: 0.05, pitch: -0.02, roll: 0 });
    await storage.createTelemetryEvent({ sessionId: s1.id, eyeContact: false, yaw: 15.0, pitch: 5.0, roll: 2.0 });
  }

  app.get(api.sessions.list.path, async (req, res) => {
    const sessions = await storage.getSessions();
    res.json(sessions);
  });

  app.get(api.sessions.get.path, async (req, res) => {
    const session = await storage.getSession(Number(req.params.id));
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    res.json(session);
  });

  app.post(api.sessions.create.path, async (req, res) => {
    try {
      const input = api.sessions.create.input.parse(req.body);
      const session = await storage.createSession(input);
      res.status(201).json(session);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.put(api.sessions.update.path, async (req, res) => {
    try {
      const input = api.sessions.update.input.parse(req.body);
      const session = await storage.updateSession(Number(req.params.id), input);
      res.json(session);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.get(api.telemetry.listBySession.path, async (req, res) => {
    const events = await storage.getTelemetryEvents(Number(req.params.sessionId));
    res.json(events);
  });

  app.post(api.telemetry.create.path, async (req, res) => {
    try {
      const input = api.telemetry.create.input.parse(req.body);
      const event = await storage.createTelemetryEvent(input);
      res.status(201).json(event);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  return httpServer;
}
