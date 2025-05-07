import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TopicInput from "@/components/TopicInput";
import LoadingView from "@/components/LoadingView";
import FlashcardView from "@/components/FlashcardView";
import MCQView from "@/components/MCQView";
import ResultsView from "@/components/ResultsView";
import { apiRequest } from "@/lib/queryClient";
import { Flashcard, MCQQuestion, LearningResult } from "@/lib/types";

type ViewState = "topicInput" | "loading" | "flashcard" | "mcq" | "results";

export default function Home() {
  const [viewState, setViewState] = useState<ViewState>("topicInput");
  const [topic, setTopic] = useState("");
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [mcqs, setMcqs] = useState<MCQQuestion[]>([]);
  const [currentMcqIndex, setCurrentMcqIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [resultsData, setResultsData] = useState<LearningResult | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [usingSampleData, setUsingSampleData] = useState(false);

  const handleTopicSubmit = async (inputTopic: string) => {
    setTopic(inputTopic);
    setViewState("loading");
    
    try {
      const response = await apiRequest("POST", "/api/learning/generate", { topic: inputTopic });
      const data = await response.json();
      
      setFlashcards(data.flashcards);
      setMcqs(data.mcqs);
      setUsingSampleData(!!data.usingSampleData); // Set the flag based on API response
      setCurrentFlashcardIndex(0);
      setViewState("flashcard");
    } catch (error) {
      console.error("Failed to generate learning materials:", error);
      setViewState("topicInput");
    }
  };

  const handleNextFlashcard = () => {
    if (currentFlashcardIndex < flashcards.length - 1) {
      setCurrentFlashcardIndex(currentFlashcardIndex + 1);
    } else {
      // Start MCQ test
      setCurrentMcqIndex(0);
      setSelectedAnswers([]);
      setTimeRemaining(300); // 5 minutes (300 seconds)
      setViewState("mcq");
    }
  };

  const handleSubmitAnswer = async (answerIndex: string) => {
    const newSelectedAnswers = [...selectedAnswers];
    newSelectedAnswers[currentMcqIndex] = answerIndex;
    setSelectedAnswers(newSelectedAnswers);

    if (currentMcqIndex < mcqs.length - 1) {
      setCurrentMcqIndex(currentMcqIndex + 1);
    } else {
      // Calculate results
      setViewState("loading");
      
      try {
        const response = await apiRequest("POST", "/api/learning/results", {
          topic,
          mcqs,
          selectedAnswers: newSelectedAnswers,
          usingSampleData  // Pass the flag to the API
        });
        
        const results = await response.json();
        setResultsData(results);
        setViewState("results");
      } catch (error) {
        console.error("Failed to calculate results:", error);
      }
    }
  };

  const handleNewTopic = () => {
    setTopic("");
    setFlashcards([]);
    setMcqs([]);
    setSelectedAnswers([]);
    setResultsData(null);
    setViewState("topicInput");
  };

  const handleRetryTopic = async () => {
    setViewState("loading");
    
    try {
      const response = await apiRequest("POST", "/api/learning/generate", { topic });
      const data = await response.json();
      
      setFlashcards(data.flashcards);
      setMcqs(data.mcqs);
      setCurrentFlashcardIndex(0);
      setSelectedAnswers([]);
      setViewState("flashcard");
    } catch (error) {
      console.error("Failed to regenerate learning materials:", error);
      setViewState("topicInput");
    }
  };

  const updateTimer = (newTime: number) => {
    setTimeRemaining(newTime);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow flex flex-col items-center justify-center py-8 px-4 sm:px-6">
        {viewState === "topicInput" && (
          <TopicInput onSubmit={handleTopicSubmit} initialTopic={topic} />
        )}
        
        {viewState === "loading" && (
          <LoadingView />
        )}
        
        {viewState === "flashcard" && flashcards.length > 0 && (
          <FlashcardView
            flashcards={flashcards}
            currentIndex={currentFlashcardIndex}
            topic={topic}
            onNext={handleNextFlashcard}
          />
        )}
        
        {viewState === "mcq" && mcqs.length > 0 && (
          <MCQView
            questions={mcqs}
            currentIndex={currentMcqIndex}
            onSubmit={handleSubmitAnswer}
            initialTime={timeRemaining}
            onTimeUpdate={updateTimer}
            onTimeEnd={() => {
              if (selectedAnswers.length > 0) {
                handleSubmitAnswer(selectedAnswers[selectedAnswers.length - 1]);
              }
            }}
          />
        )}
        
        {viewState === "results" && resultsData && (
          <ResultsView
            results={resultsData}
            topic={topic}
            onNewTopic={handleNewTopic}
            onRetryTopic={handleRetryTopic}
          />
        )}
      </main>
      
      <Footer />
    </div>
  );
}
