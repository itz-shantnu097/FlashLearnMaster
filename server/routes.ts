import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateFlashcards, generateMCQs, generateLearningResults } from "./openai";
import { v4 as uuidv4 } from "uuid";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  app.post("/api/learning/generate", async (req, res) => {
    try {
      const { topic } = req.body;
      
      if (!topic) {
        return res.status(400).json({ message: "Topic is required" });
      }

      // Generate flashcards and MCQs in parallel
      const [flashcardsResponse, mcqsResponse] = await Promise.all([
        generateFlashcards(topic),
        generateMCQs(topic)
      ]);

      // Add IDs to flashcards and MCQs
      const flashcards = flashcardsResponse.flashcards.map(card => ({
        ...card,
        id: uuidv4()
      }));

      const mcqs = mcqsResponse.mcqs.map(question => ({
        ...question,
        id: uuidv4()
      }));

      // Create a learning session
      const sessionId = await storage.createLearningSession(topic);

      // Store flashcards and MCQs
      await Promise.all([
        storage.saveFlashcards(sessionId, flashcards),
        storage.saveMCQs(sessionId, mcqs)
      ]);

      return res.status(200).json({
        flashcards,
        mcqs
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
      const { topic, mcqs, selectedAnswers } = req.body;
      
      if (!topic || !mcqs || !selectedAnswers) {
        return res.status(400).json({ message: "Topic, MCQs, and selectedAnswers are required" });
      }

      const results = await generateLearningResults(topic, mcqs, selectedAnswers);
      
      // Update session with score
      if (req.body.sessionId) {
        await storage.updateSessionScore(req.body.sessionId, results.score);
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

  const httpServer = createServer(app);
  return httpServer;
}
