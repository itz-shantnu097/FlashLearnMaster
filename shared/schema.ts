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

// Categories for organizing topics
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  iconName: text("icon_name"),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Learning paths - sequences of related topics
export const learningPaths = pgTable("learning_paths", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  difficulty: text("difficulty").default("beginner"), // beginner, intermediate, advanced
  estimatedHours: integer("estimated_hours"),
  categoryId: integer("category_id").references(() => categories.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  isPublished: boolean("is_published").default(false),
  coverImageUrl: text("cover_image_url"),
  authorId: integer("author_id").references(() => users.id),
});

// Path steps - individual topics within a learning path in sequence
export const pathSteps = pgTable("path_steps", {
  id: serial("id").primaryKey(),
  pathId: integer("path_id").notNull().references(() => learningPaths.id),
  title: text("title").notNull(),
  description: text("description"),
  topicName: text("topic_name").notNull(),
  stepOrder: integer("step_order").notNull(),
  isRequired: boolean("is_required").default(true),
  estimatedMinutes: integer("estimated_minutes").default(30),
});

// Topics that are pre-defined in the system
export const topics = pgTable("topics", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  categoryId: integer("category_id").references(() => categories.id),
  difficulty: text("difficulty").default("medium"), // easy, medium, hard
  createdAt: timestamp("created_at").notNull().defaultNow(),
  popularity: integer("popularity").default(0),
  keywords: text("keywords"),
});

// User progress for learning paths
export const pathProgress = pgTable("path_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  pathId: integer("path_id").notNull().references(() => learningPaths.id),
  currentStepId: integer("current_step_id").references(() => pathSteps.id),
  isCompleted: boolean("is_completed").default(false),
  progress: integer("progress").default(0), // percentage of completion
  startedAt: timestamp("started_at").notNull().defaultNow(),
  lastAccessedAt: timestamp("last_accessed_at"),
  completedAt: timestamp("completed_at"),
});

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
  // References to categories and learning paths
  categoryId: integer("category_id").references(() => categories.id),
  pathId: integer("path_id").references(() => learningPaths.id),
  pathStepId: integer("path_step_id").references(() => pathSteps.id),
  difficulty: text("difficulty").default("medium"),
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
  achievements: many(userAchievements),
  authoredPaths: many(learningPaths, { relationName: "author" }),
  pathProgress: many(pathProgress)
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

// Category relations
export const categoriesRelations = relations(categories, ({ many }) => ({
  topics: many(topics),
  learningPaths: many(learningPaths),
  learningSessions: many(learningSessions)
}));

// Learning paths relations
export const learningPathsRelations = relations(learningPaths, ({ many, one }) => ({
  steps: many(pathSteps),
  progressEntries: many(pathProgress),
  category: one(categories, {
    fields: [learningPaths.categoryId],
    references: [categories.id]
  }),
  author: one(users, {
    fields: [learningPaths.authorId],
    references: [users.id]
  }),
  learningSessions: many(learningSessions)
}));

// Path steps relations
export const pathStepsRelations = relations(pathSteps, ({ one, many }) => ({
  path: one(learningPaths, {
    fields: [pathSteps.pathId],
    references: [learningPaths.id]
  }),
  pathProgress: many(pathProgress)
}));

// Topic relations
export const topicsRelations = relations(topics, ({ one }) => ({
  category: one(categories, {
    fields: [topics.categoryId],
    references: [categories.id]
  })
}));

// Path progress relations
export const pathProgressRelations = relations(pathProgress, ({ one }) => ({
  user: one(users, {
    fields: [pathProgress.userId],
    references: [users.id]
  }),
  path: one(learningPaths, {
    fields: [pathProgress.pathId],
    references: [learningPaths.id]
  }),
  currentStep: one(pathSteps, {
    fields: [pathProgress.currentStepId],
    references: [pathSteps.id]
  })
}));

export const learningSessionsRelations = relations(learningSessions, ({ many, one }) => ({
  flashcards: many(flashcards),
  mcqs: many(mcqs),
  user: one(users, {
    fields: [learningSessions.userId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [learningSessions.categoryId],
    references: [categories.id]
  }),
  path: one(learningPaths, {
    fields: [learningSessions.pathId],
    references: [learningPaths.id]
  }),
  pathStep: one(pathSteps, {
    fields: [learningSessions.pathStepId],
    references: [pathSteps.id]
  })
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

// Category types and schemas
export const categoryInsertSchema = createInsertSchema(categories, {
  name: (schema) => schema.min(2, "Name must be at least 2 characters"),
  slug: (schema) => schema.min(2, "Slug must be at least 2 characters"),
});
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof categoryInsertSchema>;

// Learning path types and schemas
export const learningPathInsertSchema = createInsertSchema(learningPaths, {
  name: (schema) => schema.min(2, "Name must be at least 2 characters"),
  description: (schema) => schema.min(10, "Description must be at least 10 characters").optional(),
});
export type LearningPath = typeof learningPaths.$inferSelect;
export type InsertLearningPath = z.infer<typeof learningPathInsertSchema>;

// Path step types and schemas
export const pathStepInsertSchema = createInsertSchema(pathSteps, {
  title: (schema) => schema.min(2, "Title must be at least 2 characters"),
  topicName: (schema) => schema.min(2, "Topic name must be at least 2 characters"),
});
export type PathStep = typeof pathSteps.$inferSelect;
export type InsertPathStep = z.infer<typeof pathStepInsertSchema>;

// Topic types and schemas
export const topicInsertSchema = createInsertSchema(topics, {
  name: (schema) => schema.min(2, "Name must be at least 2 characters"),
});
export type Topic = typeof topics.$inferSelect;
export type InsertTopic = z.infer<typeof topicInsertSchema>;

// Path progress types and schemas
export const pathProgressInsertSchema = createInsertSchema(pathProgress);
export type PathProgress = typeof pathProgress.$inferSelect;
export type InsertPathProgress = z.infer<typeof pathProgressInsertSchema>;
