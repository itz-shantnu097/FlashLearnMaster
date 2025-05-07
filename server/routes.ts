import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateFlashcards, generateMCQs, generateLearningResults } from "./openai";
import { getSampleFlashcards, getSampleMCQs, getSampleLearningResults } from "./sampleData";
import { v4 as uuidv4 } from "uuid";

export async function registerRoutes(app: Express): Promise<Server> {
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

      // Store flashcards and MCQs
      await Promise.all([
        storage.saveFlashcards(sessionId, flashcards),
        storage.saveMCQs(sessionId, mcqs)
      ]);

      return res.status(200).json({
        flashcards,
        mcqs,
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
