import { pgTable, text, serial, integer, boolean, timestamp, json, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Base users table (keeping as required by the template)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Learning Sessions table
export const learningSessions = pgTable("learning_sessions", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: integer("user_id").references(() => users.id),
  topic: text("topic").notNull(),
  score: integer("score"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Flashcards table
export const flashcards = pgTable("flashcards", {
  id: varchar("id", { length: 36 }).primaryKey(),
  sessionId: varchar("session_id", { length: 36 }).notNull().references(() => learningSessions.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
});

// MCQs table
export const mcqs = pgTable("mcqs", {
  id: varchar("id", { length: 36 }).primaryKey(),
  sessionId: varchar("session_id", { length: 36 }).notNull().references(() => learningSessions.id),
  question: text("question").notNull(),
  options: json("options").$type<string[]>().notNull(),
  correctAnswer: varchar("correct_answer", { length: 1 }).notNull(),
});

// Relations
export const learningSessionsRelations = relations(learningSessions, ({ many, one }) => ({
  flashcards: many(flashcards),
  mcqs: many(mcqs),
  user: one(users, {
    fields: [learningSessions.userId],
    references: [users.id],
  }),
}));

export const flashcardsRelations = relations(flashcards, ({ one }) => ({
  session: one(learningSessions, {
    fields: [flashcards.sessionId],
    references: [learningSessions.id],
  }),
}));

export const mcqsRelations = relations(mcqs, ({ one }) => ({
  session: one(learningSessions, {
    fields: [mcqs.sessionId],
    references: [learningSessions.id],
  }),
}));

// Schemas for validation
export const learningSessionInsertSchema = createInsertSchema(learningSessions, {
  topic: (schema) => schema.min(2, "Topic must be at least 2 characters"),
});

export const flashcardInsertSchema = createInsertSchema(flashcards, {
  title: (schema) => schema.min(2, "Title must be at least 2 characters"),
  content: (schema) => schema.min(5, "Content must be at least 5 characters"),
});

export const mcqInsertSchema = createInsertSchema(mcqs, {
  question: (schema) => schema.min(5, "Question must be at least 5 characters"),
  correctAnswer: (schema) => schema.min(1, "Correct answer must be specified"),
});

export type LearningSession = typeof learningSessions.$inferSelect;
export type InsertLearningSession = z.infer<typeof learningSessionInsertSchema>;

export type Flashcard = typeof flashcards.$inferSelect;
export type InsertFlashcard = z.infer<typeof flashcardInsertSchema>;

export type MCQ = typeof mcqs.$inferSelect;
export type InsertMCQ = z.infer<typeof mcqInsertSchema>;
