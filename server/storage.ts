import { v4 as uuidv4 } from "uuid";
import { db } from "@db";
import { flashcards, mcqs, learningSessions } from "@shared/schema";
import { eq } from "drizzle-orm";

export const storage = {
  async createLearningSession(topic: string): Promise<string> {
    const [session] = await db.insert(learningSessions)
      .values({
        id: uuidv4(),
        topic,
        createdAt: new Date()
      })
      .returning({ id: learningSessions.id });
    
    return session.id;
  },

  async updateSessionScore(sessionId: string, score: number): Promise<void> {
    await db.update(learningSessions)
      .set({
        score,
        completedAt: new Date()
      })
      .where(eq(learningSessions.id, sessionId));
  },

  async saveFlashcards(sessionId: string, flashcardsData: any[]): Promise<void> {
    const flashcardsToInsert = flashcardsData.map(card => ({
      id: card.id,
      sessionId,
      title: card.title,
      content: card.content
    }));

    await db.insert(flashcards).values(flashcardsToInsert);
  },

  async saveMCQs(sessionId: string, mcqsData: any[]): Promise<void> {
    const mcqsToInsert = mcqsData.map(question => ({
      id: question.id,
      sessionId,
      question: question.question,
      options: JSON.stringify(question.options),
      correctAnswer: question.correctAnswer
    }));

    await db.insert(mcqs).values(mcqsToInsert);
  },

  async getSessionById(sessionId: string) {
    return await db.query.learningSessions.findFirst({
      where: eq(learningSessions.id, sessionId)
    });
  },

  async getFlashcardsBySessionId(sessionId: string) {
    return await db.query.flashcards.findMany({
      where: eq(flashcards.sessionId, sessionId)
    });
  },

  async getMCQsBySessionId(sessionId: string) {
    return await db.query.mcqs.findMany({
      where: eq(mcqs.sessionId, sessionId)
    });
  }
};
