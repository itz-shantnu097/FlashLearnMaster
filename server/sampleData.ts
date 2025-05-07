import { v4 as uuidv4 } from "uuid";

// Sample flashcards for general knowledge topic
export const getSampleFlashcards = (topic: string) => [
  {
    id: uuidv4(),
    title: "Overview",
    content: `<p>This is a flashcard with an overview about <strong>${topic}</strong>. The content is coming from a local sample source because the OpenAI API is unavailable or has reached its quota limit.</p>
    <p>These sample flashcards will help you learn the basics about this topic while we work on resolving the API connection issue.</p>`
  },
  {
    id: uuidv4(),
    title: "Key Concepts",
    content: `<p>Here are some key concepts related to <strong>${topic}</strong>:</p>
    <ul>
      <li>Concept 1: Understanding the fundamentals</li>
      <li>Concept 2: Learning intermediate techniques</li>
      <li>Concept 3: Advanced applications</li>
    </ul>
    <p>Note: This is sample content. For personalized learning materials, please make sure your OpenAI API key has available quota.</p>`
  },
  {
    id: uuidv4(),
    title: "Practical Applications",
    content: `<p>Here are some common applications of <strong>${topic}</strong>:</p>
    <ul>
      <li>Application in education</li>
      <li>Professional use cases</li>
      <li>Everyday applications</li>
    </ul>
    <p>This sample content is provided when the OpenAI API is unavailable.</p>`
  },
  {
    id: uuidv4(),
    title: "Historical Context",
    content: `<p>The history of <strong>${topic}</strong> includes several important milestones:</p>
    <ul>
      <li>Early development and origins</li>
      <li>Major advancements over time</li>
      <li>Current state and future directions</li>
    </ul>
    <p>This is sample content provided when personalized AI-generated content is unavailable.</p>`
  },
  {
    id: uuidv4(),
    title: "Learning Resources",
    content: `<p>If you want to learn more about <strong>${topic}</strong>, here are some suggested resources:</p>
    <ul>
      <li>Books and academic papers</li>
      <li>Online courses and tutorials</li>
      <li>Communities and forums</li>
    </ul>
    <p>This is sample content. For personalized content, please ensure your OpenAI API key has available quota.</p>`
  }
];

// Sample MCQs for general knowledge topic
export const getSampleMCQs = (topic: string) => [
  {
    id: uuidv4(),
    question: `Which of the following best describes a fundamental aspect of ${topic}?`,
    options: [
      "Understanding core principles", 
      "Ignoring basic concepts", 
      "Focusing only on advanced techniques", 
      "Skipping the learning process"
    ],
    correctAnswer: "A"
  },
  {
    id: uuidv4(),
    question: `When studying ${topic}, what approach is generally most effective?`,
    options: [
      "Memorizing without understanding", 
      "Learning through practical application", 
      "Reading without taking notes", 
      "Focusing only on theory"
    ],
    correctAnswer: "B"
  },
  {
    id: uuidv4(),
    question: `Which resource would likely be most helpful for beginners learning about ${topic}?`,
    options: [
      "Advanced research papers", 
      "Complex technical documentation", 
      "Introductory tutorials and guides", 
      "Expert-level workshops"
    ],
    correctAnswer: "C"
  },
  {
    id: uuidv4(),
    question: `What is a common challenge when mastering ${topic}?`,
    options: [
      "Building foundational knowledge", 
      "Finding beginner resources", 
      "Understanding theoretical concepts", 
      "Applying knowledge to real-world situations"
    ],
    correctAnswer: "D"
  },
  {
    id: uuidv4(),
    question: `What aspect of ${topic} typically requires the most practice?`,
    options: [
      "Practical implementation skills", 
      "Reading about the topic", 
      "Watching tutorial videos", 
      "Discussing with others"
    ],
    correctAnswer: "A"
  }
];

// Sample learning results
export const getSampleLearningResults = (totalQuestions: number, correctAnswers: number) => {
  const score = correctAnswers;
  const scorePercentage = Math.round((correctAnswers / totalQuestions) * 100);
  
  return {
    score,
    scorePercentage,
    totalQuestions,
    correctAnswers,
    strengths: "You demonstrated a good understanding of the basic concepts covered in this quiz. Your answers show you've grasped the fundamental principles of the topic.",
    improvements: "There are some areas where you might benefit from more practice, particularly in applying the concepts to specific situations. Consider reviewing the questions you missed.",
    nextSteps: "To further improve your understanding, try exploring more advanced topics or practical applications. Consider seeking out additional learning resources or practicing with more complex examples."
  };
};