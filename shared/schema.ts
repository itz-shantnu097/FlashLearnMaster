import { pgTable, text, serial, integer, boolean, timestamp, json, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Base users table with extended profile information
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
  lastLoginAt: timestamp("last_login_at"),
  // User preferences
  theme: text("theme").default("light"),
  // User stats
  totalPoints: integer("total_points").default(0),
  totalSessions: integer("total_sessions").default(0),
  totalCompletedSessions: integer("total_completed_sessions").default(0),
  averageScore: integer("average_score").default(0),
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  lastSessionDate: timestamp("last_session_date"),
});

// User preferences table for more complex preferences
export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  notificationsEnabled: boolean("notifications_enabled").default(true),
  emailNotifications: boolean("email_notifications").default(true),
  sessionReminders: boolean("session_reminders").default(true),
  difficultyLevel: text("difficulty_level").default("medium"),
  colorTheme: text("color_theme").default("blue"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// User achievements table
export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  achievementType: text("achievement_type").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  iconName: text("icon_name"),
  earnedAt: timestamp("earned_at").defaultNow().notNull(),
  pointsAwarded: integer("points_awarded").default(0),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  displayName: true,
});

export const insertUserPreferencesSchema = createInsertSchema(userPreferences).pick({
  userId: true,
  notificationsEnabled: true,
  emailNotifications: true,
  sessionReminders: true,
  difficultyLevel: true,
  colorTheme: true,
});

export const insertUserAchievementSchema = createInsertSchema(userAchievements).pick({
  userId: true,
  achievementType: true,
  title: true,
  description: true,
  iconName: true,
  pointsAwarded: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type UserPreferences = typeof userPreferences.$inferSelect;
export type InsertUserPreferences = z.infer<typeof insertUserPreferencesSchema>;
export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;

// Learning Sessions table
export const learningSessions = pgTable("learning_sessions", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: integer("user_id").references(() => users.id),
  topic: text("topic").notNull(),
  score: integer("score"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  // Fields for tracking in-progress learning sessions
  progressType: varchar("progress_type", { length: 20 }), // "flashcards" or "mcq"
  progressIndex: integer("progress_index"), // Current flashcard or MCQ index
  progressData: text("progress_data"), // JSON string with additional progress data
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
export const usersRelations = relations(users, ({ many }) => ({
  learningSessions: many(learningSessions),
  preferences: many(userPreferences),
  achievements: many(userAchievements)
}));

export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(users, {
    fields: [userPreferences.userId],
    references: [users.id],
  }),
}));

export const userAchievementsRelations = relations(userAchievements, ({ one }) => ({
  user: one(users, {
    fields: [userAchievements.userId],
    references: [users.id],
  }),
}));

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
