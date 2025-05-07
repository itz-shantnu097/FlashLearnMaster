import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateFlashcards, generateMCQs, generateLearningResults } from "./openai";
import { getSampleFlashcards, getSampleMCQs, getSampleLearningResults } from "./sampleData";
import { v4 as uuidv4 } from "uuid";
import { setupAuth } from "./auth";
import { db } from "../db";
import { learningSessions, flashcards, mcqs } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  await setupAuth(app);
  
  // API routes
  app.post("/api/learning/generate", async (req, res) => {
    try {
      const { topic } = req.body;
      
      if (!topic) {
        return res.status(400).json({ message: "Topic is required" });
      }

      let flashcards;
      let mcqs;
      let usingSampleData = false;

      try {
        // Try to generate flashcards and MCQs in parallel using OpenAI
        const [flashcardsResponse, mcqsResponse] = await Promise.all([
          generateFlashcards(topic),
          generateMCQs(topic)
        ]);

        // Add IDs to flashcards and MCQs
        flashcards = flashcardsResponse.flashcards.map(card => ({
          ...card,
          id: uuidv4()
        }));

        mcqs = mcqsResponse.mcqs.map(question => ({
          ...question,
          id: uuidv4()
        }));
      } catch (apiError) {
        console.warn("OpenAI API error, falling back to sample data:", apiError);
        
        // Use sample data instead
        flashcards = getSampleFlashcards(topic);
        mcqs = getSampleMCQs(topic);
        usingSampleData = true;
      }

      // Create a learning session
      const sessionId = await storage.createLearningSession(topic);

      // If user is authenticated, associate this session with them
      if (req.isAuthenticated() && req.user?.id) {
        try {
          await db.update(learningSessions)
            .set({ userId: req.user.id })
            .where(eq(learningSessions.id, sessionId));
        } catch (error) {
          console.error("Error associating session with user:", error);
        }
      }

      // Store flashcards and MCQs
      await Promise.all([
        storage.saveFlashcards(sessionId, flashcards),
        storage.saveMCQs(sessionId, mcqs)
      ]);

      return res.status(200).json({
        flashcards,
        mcqs,
        sessionId,
        usingSampleData
      });
    } catch (error) {
      console.error("Error generating learning materials:", error);
      return res.status(500).json({ 
        message: "Failed to generate learning materials",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.post("/api/learning/results", async (req, res) => {
    try {
      const { topic, mcqs, selectedAnswers, usingSampleData } = req.body;
      
      if (!topic || !mcqs || !selectedAnswers) {
        return res.status(400).json({ message: "Topic, MCQs, and selectedAnswers are required" });
      }

      let results;
      
      try {
        // Try to generate results using OpenAI if we're not already using sample data
        if (!usingSampleData) {
          results = await generateLearningResults(topic, mcqs, selectedAnswers);
        } else {
          // If we're already using sample data, continue using sample data
          throw new Error("Using sample data due to previous API limitations");
        }
      } catch (apiError) {
        console.warn("OpenAI API error for results, using sample results:", apiError);
        
        // Calculate the number of correct answers
        let correctAnswers = 0;
        for (let i = 0; i < mcqs.length; i++) {
          if (i < selectedAnswers.length && selectedAnswers[i] === mcqs[i].correctAnswer) {
            correctAnswers++;
          }
        }
        
        // Use sample results
        results = getSampleLearningResults(mcqs.length, correctAnswers);
      }
      
      // Get session ID from request
      const sessionId = req.body.sessionId;
      
      // Update session with score and link to user if authenticated
      if (sessionId) {
        await storage.updateSessionScore(sessionId, results.score);
        
        // If user is authenticated, associate this session with them
        if (req.isAuthenticated() && req.user?.id) {
          try {
            await db.update(learningSessions)
              .set({ userId: req.user.id, completedAt: new Date() })
              .where(eq(learningSessions.id, sessionId));
          } catch (error) {
            console.error("Error associating session with user:", error);
          }
        }
      }

      return res.status(200).json(results);
    } catch (error) {
      console.error("Error generating learning results:", error);
      return res.status(500).json({ 
        message: "Failed to generate learning results",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // Get user's learning history
  app.get("/api/user/history", async (req, res) => {
    // Check if user is authenticated
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      // Get all learning sessions for the current user
      const userSessions = await db.query.learningSessions.findMany({
        where: eq(learningSessions.userId, req.user.id),
        orderBy: [desc(learningSessions.createdAt)],
      });
      
      return res.status(200).json(userSessions);
    } catch (error) {
      console.error("Error fetching user history:", error);
      return res.status(500).json({ 
        message: "Failed to fetch learning history",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // Save learning progress for a session
  app.post("/api/learning/save-progress", async (req, res) => {
    // Check if user is authenticated
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const { sessionId, type, currentIndex, topic, answers, timeRemaining } = req.body;
      
      if (!sessionId || !type) {
        return res.status(400).json({ message: "Session ID and type are required" });
      }
      
      // Update session with progress details
      await db.update(learningSessions)
        .set({ 
          userId: req.user.id,
          progressType: type,
          progressIndex: currentIndex,
          progressData: JSON.stringify({ 
            answers, 
            timeRemaining,
            lastUpdated: new Date().toISOString()
          })
        })
        .where(eq(learningSessions.id, sessionId));
      
      return res.status(200).json({ 
        message: "Progress saved successfully",
        sessionId
      });
    } catch (error) {
      console.error("Error saving learning progress:", error);
      return res.status(500).json({ 
        message: "Failed to save progress",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // Get a specific learning session with its flashcards and MCQs
  app.get("/api/sessions/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      
      // Get the session
      const session = await db.query.learningSessions.findFirst({
        where: eq(learningSessions.id, sessionId),
      });
      
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      // Check if user is authorized to access this session
      if (session.userId && req.user?.id !== session.userId && req.isAuthenticated()) {
        return res.status(403).json({ message: "Not authorized to access this session" });
      }
      
      // Get flashcards and MCQs for this session
      const [sessionFlashcards, sessionMCQs] = await Promise.all([
        db.query.flashcards.findMany({
          where: eq(flashcards.sessionId, sessionId),
        }),
        db.query.mcqs.findMany({
          where: eq(mcqs.sessionId, sessionId),
        }),
      ]);
      
      return res.status(200).json({
        session,
        flashcards: sessionFlashcards,
        mcqs: sessionMCQs,
      });
    } catch (error) {
      console.error("Error fetching session:", error);
      return res.status(500).json({ 
        message: "Failed to fetch session",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
