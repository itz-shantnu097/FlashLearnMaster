import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const OPENAI_MODEL = "gpt-4o";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface FlashcardGenerationResponse {
  flashcards: {
    title: string;
    content: string;
  }[];
}

export interface MCQGenerationResponse {
  mcqs: {
    question: string;
    options: string[];
    correctAnswer: string;
  }[];
}

export interface LearningResultsResponse {
  score: number;
  scorePercentage: number;
  correctAnswers: number;
  strengths: string;
  improvements: string;
  nextSteps: string;
}

export async function generateFlashcards(topic: string): Promise<FlashcardGenerationResponse> {
  const prompt = `Create a set of 5-10 educational flashcards on the topic "${topic}". 
  Each flashcard should have a title and content with educational information.
  Make the content rich and educational, including examples, explanations, and key concepts.
  Include HTML formatting for better readability (use <p>, <ul>, <li>, <pre>, <code>, etc.).
  
  Format your response as a JSON object that follows this structure:
  {
    "flashcards": [
      {
        "title": "Flashcard Title",
        "content": "Flashcard content with <html> formatting"
      }
    ]
  }`;

  try {
    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    return JSON.parse(content) as FlashcardGenerationResponse;
  } catch (error) {
    console.error("Error generating flashcards:", error);
    throw new Error("Failed to generate flashcards");
  }
}

export async function generateMCQs(topic: string): Promise<MCQGenerationResponse> {
  const prompt = `Create a set of 5 multiple-choice questions (MCQs) to test knowledge on the topic "${topic}".
  Each question should have 4 options, with exactly one correct answer.
  Make the questions diverse and cover different aspects of the topic.
  Vary the difficulty level, with some easier questions and some more challenging ones.
  
  Format your response as a JSON object that follows this structure:
  {
    "mcqs": [
      {
        "question": "Question text",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctAnswer": "A" (or B, C, D - indicating which option is correct)
      }
    ]
  }`;

  try {
    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    return JSON.parse(content) as MCQGenerationResponse;
  } catch (error) {
    console.error("Error generating MCQs:", error);
    throw new Error("Failed to generate MCQs");
  }
}

export async function generateLearningResults(
  topic: string,
  mcqs: any[],
  selectedAnswers: string[]
): Promise<LearningResultsResponse> {
  // Calculate score
  let correctAnswers = 0;
  
  for (let i = 0; i < mcqs.length; i++) {
    if (i < selectedAnswers.length && selectedAnswers[i] === mcqs[i].correctAnswer) {
      correctAnswers++;
    }
  }
  
  const score = correctAnswers;
  const scorePercentage = Math.round((correctAnswers / mcqs.length) * 100);
  
  // Generate personalized feedback
  const answeredQuestions = mcqs.map((q, index) => {
    const userAnswer = index < selectedAnswers.length ? selectedAnswers[index] : "No answer";
    return {
      question: q.question,
      userAnswer,
      correctAnswer: q.correctAnswer,
      isCorrect: userAnswer === q.correctAnswer
    };
  });
  
  const prompt = `
  I've just completed a learning session on "${topic}".
  My test results:
  - Score: ${scorePercentage}% (${correctAnswers} out of ${mcqs.length} correct)
  
  Here are the questions and my answers:
  ${answeredQuestions.map((q, i) => `
  Q${i+1}: ${q.question}
  My answer: ${q.userAnswer} (${q.isCorrect ? 'Correct' : 'Incorrect'})
  Correct answer: ${q.correctAnswer}
  `).join('\n')}
  
  Based on this performance, please provide:
  1. A brief analysis of my strengths (what I understood well)
  2. Areas where I need improvement
  3. Recommended next steps for continued learning on this topic
  
  Format your response as a JSON object with the following structure:
  {
    "strengths": "analysis of what I did well",
    "improvements": "areas where I need to improve",
    "nextSteps": "specific recommendations for continued learning"
  }`;

  try {
    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    const parsedContent = JSON.parse(content);
    
    return {
      score,
      scorePercentage,
      correctAnswers,
      totalQuestions: mcqs.length,
      strengths: parsedContent.strengths,
      improvements: parsedContent.improvements,
      nextSteps: parsedContent.nextSteps
    };
  } catch (error) {
    console.error("Error generating learning results:", error);
    throw new Error("Failed to generate learning results");
  }
}
