export interface Flashcard {
  id: string;
  title: string;
  content: string;
}

export interface MCQQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface LearningResult {
  score: number;
  scorePercentage: number;
  totalQuestions: number;
  correctAnswers: number;
  strengths: string;
  improvements: string;
  nextSteps: string;
}

export interface LearningSession {
  id: string;
  userId?: string;
  topic: string;
  score?: number;
  completedAt?: Date;
  createdAt: Date;
  progressType?: string; // "flashcards" or "mcq"
  progressIndex?: number;
  progressData?: string; // JSON string with additional progress data
}

export interface FlashcardSet {
  id: string;
  sessionId: string;
  flashcards: Flashcard[];
}

export interface MCQSet {
  id: string;
  sessionId: string;
  questions: MCQQuestion[];
}
