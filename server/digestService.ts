import { db } from "@db";
import { 
  users, 
  learningDigests, 
  learningSessions, 
  categories, 
  userPreferences, 
  flashcards, 
  mcqs, 
  topics,
  pathProgress
} from "@shared/schema";
import { eq, and, gte, lte, desc, count, max, avg, sql } from "drizzle-orm";
import { subDays, startOfWeek, endOfWeek, format } from "date-fns";
import OpenAI from "openai";

// Initialize OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

type UserLearningStats = {
  totalSessions: number;
  completedSessions: number;
  avgScore: number | null;
  topCategory: string | null;
  topPerformingTopic: string | null;
  improvementAreas: string | null;
  streak: number;
  pointsEarned: number;
  timeSpentMinutes: number;
};

type DigestInsight = {
  type: string;
  title: string;
  description: string;
  data?: any;
};

/**
 * Generates and saves weekly learning digests for all users who have enabled weekly digests
 */
export async function generateWeeklyDigestsForAllUsers() {
  try {
    // Get all users with weekly digests enabled
    const usersWithDigestEnabled = await db.query.users.findMany({
      with: {
        preferences: true
      },
      where: (users, { exists }) => 
        exists(
          db.select().from(userPreferences).where(
            and(
              eq(userPreferences.userId, users.id),
              eq(userPreferences.weeklyDigestEnabled, true)
            )
          )
        )
    });

    console.log(`Generating weekly digests for ${usersWithDigestEnabled.length} users`);

    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 }); // Sunday
    
    for (const user of usersWithDigestEnabled) {
      try {
        // Check if digest already exists for this week
        const existingDigest = await db.query.learningDigests.findFirst({
          where: (digest, { and, eq, gte, lte }) => 
            and(
              eq(digest.userId, user.id),
              gte(digest.weekStartDate, weekStart),
              lte(digest.weekEndDate, weekEnd)
            )
        });

        if (existingDigest) {
          console.log(`Digest already exists for user ${user.id} for the current week`);
          continue;
        }

        // Get user learning stats for the week
        const stats = await getUserLearningStats(user.id, weekStart, weekEnd);
        
        // Generate insights based on stats
        const insights = await generateInsights(user.id, stats);
        
        // Generate recommendations
        const recommendations = await generateRecommendations(user.id, stats);
        
        // Insert digest
        await db.insert(learningDigests).values({
          userId: user.id,
          weekStartDate: weekStart,
          weekEndDate: weekEnd,
          totalSessions: stats.totalSessions,
          completedSessions: stats.completedSessions,
          averageScore: stats.avgScore,
          totalTimeSpentMinutes: stats.timeSpentMinutes,
          topCategory: stats.topCategory,
          topPerformingTopic: stats.topPerformingTopic, 
          improvementAreas: stats.improvementAreas,
          streak: stats.streak,
          pointsEarned: stats.pointsEarned,
          recommendations,
          insights,
          createdAt: now
        });

        console.log(`Created weekly digest for user ${user.id}`);
      } catch (error) {
        console.error(`Error generating digest for user ${user.id}:`, error);
      }
    }

    return { success: true, message: `Generated digests for ${usersWithDigestEnabled.length} users` };
  } catch (error) {
    console.error("Error generating weekly digests:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Gets learning statistics for a user within a date range
 */
async function getUserLearningStats(
  userId: number,
  startDate: Date,
  endDate: Date
): Promise<UserLearningStats> {
  // Get total sessions in the date range
  const sessionsResult = await db
    .select({
      total: count(),
      completed: count(learningSessions.completedAt),
      avgScore: avg(learningSessions.score)
    })
    .from(learningSessions)
    .where(
      and(
        eq(learningSessions.userId, userId),
        gte(learningSessions.createdAt, startDate),
        lte(learningSessions.createdAt, endDate)
      )
    );

  // Get top category by number of sessions
  const topCategoryResult = await db
    .select({
      categoryName: categories.name,
      count: count()
    })
    .from(learningSessions)
    .leftJoin(categories, eq(learningSessions.categoryId, categories.id))
    .where(
      and(
        eq(learningSessions.userId, userId),
        gte(learningSessions.createdAt, startDate),
        lte(learningSessions.createdAt, endDate)
      )
    )
    .groupBy(categories.name)
    .orderBy(desc(count()))
    .limit(1);

  // Get top performing topic by score
  const topPerformingTopicResult = await db
    .select({
      topic: learningSessions.topic,
      avgScore: avg(learningSessions.score)
    })
    .from(learningSessions)
    .where(
      and(
        eq(learningSessions.userId, userId),
        gte(learningSessions.createdAt, startDate),
        lte(learningSessions.createdAt, endDate),
        sql`${learningSessions.score} IS NOT NULL`
      )
    )
    .groupBy(learningSessions.topic)
    .orderBy(desc(avg(learningSessions.score)))
    .limit(1);

  // Get current streak
  const userDetails = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: {
      currentStreak: true
    }
  });

  // Calculate estimated time spent (rough estimation)
  // Assuming each flashcard takes 1 minute and each MCQ takes 2 minutes
  const flashcardCount = await db
    .select({ count: count() })
    .from(learningSessions)
    .innerJoin(
      flashcards,
      eq(learningSessions.id, flashcards.sessionId)
    )
    .where(
      and(
        eq(learningSessions.userId, userId),
        gte(learningSessions.createdAt, startDate),
        lte(learningSessions.createdAt, endDate)
      )
    );

  const mcqCount = await db
    .select({ count: count() })
    .from(learningSessions)
    .innerJoin(
      mcqs,
      eq(learningSessions.id, mcqs.sessionId)
    )
    .where(
      and(
        eq(learningSessions.userId, userId),
        gte(learningSessions.createdAt, startDate),
        lte(learningSessions.createdAt, endDate)
      )
    );

  // Generate basic improvement areas based on score (will be enhanced with AI later)
  let improvementAreas = null;
  const avgScore = typeof sessionsResult[0].avgScore === 'string' 
    ? parseFloat(sessionsResult[0].avgScore) 
    : sessionsResult[0].avgScore;
    
  if (avgScore !== null && avgScore < 70) {
    improvementAreas = "Focus on reviewing flashcards more thoroughly before taking quizzes";
  }

  const timeSpentMinutes = 
    (flashcardCount[0]?.count || 0) * 1 + 
    (mcqCount[0]?.count || 0) * 2;

  // Calculate points using safe number conversions
  const completedCount = sessionsResult[0].completed || 0;
  const scoreValue = avgScore || 0;
  const pointsEarned = Math.floor(completedCount * 10 + scoreValue);

  return {
    totalSessions: sessionsResult[0].total || 0,
    completedSessions: completedCount, 
    avgScore: avgScore,
    topCategory: topCategoryResult[0]?.categoryName || null,
    topPerformingTopic: topPerformingTopicResult[0]?.topic || null,
    improvementAreas,
    streak: userDetails?.currentStreak || 0,
    pointsEarned,
    timeSpentMinutes
  };
}

/**
 * Generate insights based on user's learning data
 */
async function generateInsights(userId: number, stats: UserLearningStats): Promise<DigestInsight[]> {
  const insights: DigestInsight[] = [];
  
  // Add basic insights based on stats
  if (stats.totalSessions > 0) {
    insights.push({
      type: "activity",
      title: "Activity Summary",
      description: `You completed ${stats.completedSessions} out of ${stats.totalSessions} learning sessions this week.`,
      data: {
        completed: stats.completedSessions,
        total: stats.totalSessions,
        completionRate: stats.totalSessions > 0 
          ? Math.round((stats.completedSessions / stats.totalSessions) * 100) 
          : 0
      }
    });
  }

  if (stats.avgScore !== null) {
    insights.push({
      type: "performance",
      title: "Performance Overview",
      description: `Your average quiz score was ${Math.round(stats.avgScore)}%. ${
        stats.avgScore >= 80 
          ? "Great job!" 
          : stats.avgScore >= 60 
            ? "Keep practicing to improve." 
            : "More review might help boost your scores."
      }`,
      data: {
        avgScore: Math.round(stats.avgScore),
        level: stats.avgScore >= 80 
          ? "excellent" 
          : stats.avgScore >= 60 
            ? "good" 
            : "needs improvement"
      }
    });
  }

  if (stats.streak > 0) {
    insights.push({
      type: "streak",
      title: "Learning Streak",
      description: `You're on a ${stats.streak} day learning streak. Keep it going!`,
      data: {
        days: stats.streak
      }
    });
  }

  if (stats.timeSpentMinutes > 0) {
    insights.push({
      type: "timeSpent",
      title: "Time Investment",
      description: `You've invested about ${stats.timeSpentMinutes} minutes learning this week.`,
      data: {
        minutes: stats.timeSpentMinutes,
        hours: Math.floor(stats.timeSpentMinutes / 60),
        remainingMinutes: stats.timeSpentMinutes % 60
      }
    });
  }

  // Get AI-generated insights if we have an OpenAI API key
  if (process.env.OPENAI_API_KEY && stats.totalSessions > 0) {
    try {
      // Get recent learning sessions to provide context
      const recentSessions = await db.query.learningSessions.findMany({
        where: eq(learningSessions.userId, userId),
        orderBy: [desc(learningSessions.createdAt)],
        limit: 5
      });
      
      const topicsList = recentSessions.map(s => s.topic).join(", ");
      
      // Use OpenAI to generate personalized insights
      const prompt = `
        Based on the following user learning data, generate 1-2 insightful observations about their learning patterns, 
        progress, or potential areas for growth. Keep each insight concise (under 100 words) and actionable.
        
        User learning stats:
        - Completed ${stats.completedSessions} out of ${stats.totalSessions} learning sessions
        - Average quiz score: ${stats.avgScore !== null ? Math.round(stats.avgScore) + '%' : 'No quizzes completed'}
        - Current learning streak: ${stats.streak} days
        - Top category: ${stats.topCategory || 'None'}
        - Top performing topic: ${stats.topPerformingTopic || 'None'}
        - Recent topics studied: ${topicsList}
        - Time spent learning: ${stats.timeSpentMinutes} minutes
        
        Return the response as a JSON array with objects in this format:
        [
          {
            "type": "insight_type", // e.g., "learning_pattern", "progress", "recommendation", "growth_area"
            "title": "Short Insight Title",
            "description": "Detailed insight (1-2 sentences)"
          }
        ]
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      });

      const aiInsightsText = response.choices[0].message.content;
      if (aiInsightsText) {
        try {
          const aiInsights = JSON.parse(aiInsightsText);
          if (Array.isArray(aiInsights)) {
            insights.push(...aiInsights);
          } else if (Array.isArray(aiInsights.insights)) {
            insights.push(...aiInsights.insights);
          }
        } catch (err) {
          console.error("Error parsing AI insights:", err);
        }
      }
    } catch (error) {
      console.error("Error generating AI insights:", error);
      // Fall back to basic insights if AI fails
    }
  }

  return insights;
}

/**
 * Generate personalized learning recommendations
 */
async function generateRecommendations(userId: number, stats: UserLearningStats): Promise<string[]> {
  // Get user's learning history
  const userHistory = await db.query.learningSessions.findMany({
    where: eq(learningSessions.userId, userId),
    orderBy: [desc(learningSessions.createdAt)],
    limit: 10
  });
  
  const userTopics = new Set(userHistory.map(session => session.topic));
  
  // Get popular topics in the user's favorite categories
  const recommendedTopics: string[] = [];
  
  if (stats.topCategory) {
    const categoryTopics = await db.query.topics.findMany({
      where: and(
        eq(topics.categoryId, 
          db.select({ id: categories.id })
            .from(categories)
            .where(eq(categories.name, stats.topCategory))
            .limit(1)
        ),
        sql`popularity > 0`
      ),
      orderBy: [desc(topics.popularity)],
      limit: 5
    });
    
    for (const topic of categoryTopics) {
      if (!userTopics.has(topic.name)) {
        recommendedTopics.push(topic.name);
      }
    }
  }
  
  // Add recommendations based on difficulty progression
  if (userHistory.length > 0 && stats.avgScore && stats.avgScore > 75) {
    recommendedTopics.push(
      "Try advancing to more challenging topics to maximize your learning"
    );
  }
  
  // Add recommendation for learning paths if the user hasn't started any
  const userPathProgress = await db.query.pathProgress.findMany({
    where: eq(pathProgress.userId, userId)
  });
  
  if (userPathProgress.length === 0) {
    recommendedTopics.push(
      "Explore structured learning paths to build skills systematically"
    );
  }

  // Add generic recommendations if we don't have enough personalized ones
  if (recommendedTopics.length < 3) {
    const defaultRecommendations = [
      "Schedule regular review sessions to reinforce what you've learned",
      "Try explaining topics you've studied to someone else to solidify understanding",
      "Set specific learning goals for next week to stay motivated",
      "Explore related topics to build a more comprehensive understanding"
    ];
    
    for (const rec of defaultRecommendations) {
      if (recommendedTopics.length < 5) {
        recommendedTopics.push(rec);
      } else {
        break;
      }
    }
  }
  
  return recommendedTopics;
}

/**
 * Gets a user's latest digest
 */
export async function getUserLatestDigest(userId: number) {
  return db.query.learningDigests.findFirst({
    where: eq(learningDigests.userId, userId),
    orderBy: [desc(learningDigests.weekEndDate)]
  });
}

/**
 * Gets a user's digest for a specific week
 */
export async function getUserDigestForWeek(userId: number, weekStartDate: Date) {
  const weekEndDate = new Date(weekStartDate);
  weekEndDate.setDate(weekEndDate.getDate() + 6);
  
  return db.query.learningDigests.findFirst({
    where: and(
      eq(learningDigests.userId, userId),
      gte(learningDigests.weekStartDate, weekStartDate),
      lte(learningDigests.weekEndDate, weekEndDate)
    )
  });
}

/**
 * Marks a digest as opened
 */
export async function markDigestAsOpened(digestId: number) {
  return db.update(learningDigests)
    .set({ openedAt: new Date() })
    .where(eq(learningDigests.id, digestId));
}

/**
 * Gets all user digests
 */
export async function getUserDigests(userId: number) {
  return db.query.learningDigests.findMany({
    where: eq(learningDigests.userId, userId),
    orderBy: [desc(learningDigests.weekEndDate)]
  });
}